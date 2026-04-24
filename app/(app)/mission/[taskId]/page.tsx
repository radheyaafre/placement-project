import { notFound, redirect } from "next/navigation";

import {
  completeMissionAction,
  submitMissionAttemptAction
} from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { getMissionDetail } from "@/lib/data";
import { usesDirectCompleteFlow } from "@/lib/plan";
import { demoMissions } from "@/lib/sample-data";

type Params = Promise<{ taskId: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatPracticePlatform(sourcePlatform?: string) {
  const normalized = (sourcePlatform || "").toLowerCase();

  if (normalized === "leetcode") {
    return "LeetCode";
  }

  if (normalized === "gfg" || normalized === "geeksforgeeks") {
    return "GeeksforGeeks";
  }

  return "practice link";
}

export default async function MissionPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { taskId } = await params;
  const query = await searchParams;
  const detail = await getMissionDetail(taskId);

  if (!detail) {
    if (demoMissions.some((mission) => mission.id === taskId)) {
      redirect(`/preview/${taskId}`);
    }

    notFound();
  }

  const error = typeof query.error === "string" ? query.error : "";
  const submitted = typeof query.submitted === "string" ? query.submitted : "";
  const completed = typeof query.completed === "string" ? query.completed : "";
  const questions = detail.mission.questions ?? [];
  const solution = detail.mission.solution ?? [];
  const usesDirectFlow = usesDirectCompleteFlow(detail.mission.taskType);
  const isHrMission = detail.mission.taskType === "hr";
  const introCopy = usesDirectFlow
    ? "Open the original problem link, solve it there, then come back and mark the day finished."
    : detail.canRevealSolution
      ? isHrMission
        ? "Your answer is already saved. Review it with the hint below, then finish the day."
        : "Your first attempt is already saved. Review the explanation carefully, then finish the day."
      : isHrMission
        ? "Write your answer in your own words before opening the hint."
        : "Attempt the questions honestly before opening the explanation.";

  return (
    <div className="mission-layout">
      <div className="stack">
        <SectionCard
          title={detail.mission.title}
          eyebrow={`Day ${detail.mission.dayNumber} | Week ${detail.mission.weekNumber}`}
          aside={
            <div className="pill-row">
              <StatusBadge taskType={detail.mission.taskType} />
              <StatusBadge status={detail.status} />
            </div>
          }
        >
          <div className="mission-meta">
            <span className="pill">{detail.mission.estimatedMinutes} min focus</span>
            <span className="pill">{detail.mission.topic}</span>
          </div>
          <p className="mission-intro">{introCopy}</p>
          {error ? <div className="notice">{error}</div> : null}
          {submitted ? <div className="notice">{submitted}</div> : null}
          {completed ? <div className="notice">{completed}</div> : null}
        </SectionCard>

        {usesDirectFlow ? (
          <SectionCard title="Open problems" eyebrow="Solve outside the app">
            <div className="question-list">
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-card__meta">
                    <span className="eyebrow">Problem {index + 1}</span>
                    <strong>{question.prompt}</strong>
                  </div>
                  {question.sourceUrl ? (
                    <div className="pill-row">
                      <a
                        href={question.sourceUrl}
                        className="button-ghost"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Open on {formatPracticePlatform(question.sourcePlatform)}
                      </a>
                    </div>
                  ) : null}
                </div>
              ))}

              {detail.status === "completed" ? (
                <div className="notice">Mission already completed.</div>
              ) : (
                <form action={completeMissionAction}>
                  <input type="hidden" name="taskId" value={detail.mission.id} />
                  <SubmitButton
                    label="Mark day finished"
                    pendingLabel="Saving progress..."
                  />
                </form>
              )}
            </div>
          </SectionCard>
        ) : detail.canRevealSolution ? (
          <SectionCard
            title={isHrMission ? "Answer saved" : "Attempt saved"}
            eyebrow="Review next"
          >
            <p>
              {isHrMission
                ? "Your one answer is already saved. Review the hint below and mark the mission finished when you are ready."
                : "Your one attempt is already saved. Review the solution below and mark the mission finished when you are ready."}
            </p>
          </SectionCard>
        ) : (
          <SectionCard
            title={isHrMission ? "Write your answer" : "Try first"}
            eyebrow={isHrMission ? "Prepare before hint" : "Attempt before solution"}
          >
            <form action={submitMissionAttemptAction} className="question-list">
              <input type="hidden" name="taskId" value={detail.mission.id} />
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-card__meta">
                    <span className="eyebrow">
                      {isHrMission ? `HR question ${index + 1}` : `Question ${index + 1}`}
                    </span>
                    <strong>{question.prompt}</strong>
                  </div>

                  {question.questionType === "mcq" ? (
                    <div className="radio-grid">
                      {question.options?.map((option) => (
                        <label className="option-card" key={option.id}>
                          <input
                            type="radio"
                            name={`answer_${question.id}`}
                            value={option.id}
                          />
                          <span>
                            <strong>{option.label}.</strong> {option.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="textarea"
                      name={`answer_${question.id}`}
                      placeholder={
                        question.placeholder ||
                        (isHrMission
                          ? "Write or prepare your answer here..."
                          : "Write your answer here...")
                      }
                    />
                  )}
                </div>
              ))}
              <SubmitButton
                label={isHrMission ? "Save answer and review hint" : "Save attempt and review"}
                pendingLabel={isHrMission ? "Saving your answer..." : "Saving your attempt..."}
              />
            </form>
          </SectionCard>
        )}

        {!usesDirectFlow && detail.canRevealSolution ? (
          <SectionCard
            title={isHrMission ? "Your answer and hint" : "Review"}
            eyebrow="Compare and finish"
          >
            <div className="stack">
              {detail.progress?.score !== null ? (
                <div className="callout">
                  <p className="eyebrow">Aptitude score</p>
                  <h3>{detail.progress?.score}%</h3>
                  <p className="muted">
                    Review each explanation before moving to the next day.
                  </p>
                </div>
              ) : null}
              {solution.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-card__meta">
                    <span className="eyebrow">
                      {isHrMission ? `HR question ${index + 1}` : `Review ${index + 1}`}
                    </span>
                    <strong>{question.prompt}</strong>
                  </div>
                  {question.sourceUrl ? (
                    <div className="pill-row">
                      <a
                        href={question.sourceUrl}
                        className="button-ghost"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Open on {formatPracticePlatform(question.sourcePlatform)}
                      </a>
                    </div>
                  ) : null}
                  {isHrMission ? (
                    <div className="stack">
                      {detail.responsesByQuestionId[question.id]?.answerText ? (
                        <div className="notice">
                          <strong>Your answer:</strong>{" "}
                          {detail.responsesByQuestionId[question.id]?.answerText}
                        </div>
                      ) : null}
                      {question.explanation ? (
                        <div className="notice">
                          <strong>Hint:</strong> {question.explanation}
                        </div>
                      ) : null}
                      {question.sampleAnswer ? (
                        <p className="muted">
                          <strong>Example direction:</strong> {question.sampleAnswer}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {question.explanation ? <p>{question.explanation}</p> : null}
                      {question.sampleAnswer ? (
                        <div className="notice">
                          <strong>Sample answer:</strong> {question.sampleAnswer}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
              {detail.status === "completed" ? (
                <div className="notice">Mission already completed.</div>
              ) : (
                <form action={completeMissionAction}>
                  <input type="hidden" name="taskId" value={detail.mission.id} />
                  <SubmitButton
                    label="Mark day finished"
                    pendingLabel="Marking finished..."
                  />
                </form>
              )}
            </div>
          </SectionCard>
        ) : null}
      </div>

      <aside className="sticky-column">
        <SectionCard title="Mission snapshot" eyebrow="Queue info">
          <div className="stack">
            <div className="topline">
              <span className="muted">Estimated time</span>
              <strong>{detail.mission.estimatedMinutes} min</strong>
            </div>
            <div className="topline">
              <span className="muted">Current status</span>
              <StatusBadge status={detail.status} />
            </div>
            <div className="topline">
              <span className="muted">Days in a row</span>
              <strong>{detail.snapshot.currentStreak}</strong>
            </div>
          </div>
        </SectionCard>
      </aside>
    </div>
  );
}
