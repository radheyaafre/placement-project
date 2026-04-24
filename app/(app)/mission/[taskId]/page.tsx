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

  return (
    <div className="mission-layout">
      <div className="stack">
        <SectionCard
          title={detail.mission.title}
          eyebrow={`Day ${detail.mission.dayNumber} • Week ${detail.mission.weekNumber}`}
          aside={
            <div className="pill-row">
              <StatusBadge taskType={detail.mission.taskType} />
              <StatusBadge status={detail.status} />
            </div>
          }
        >
          <p className="muted">{detail.mission.topic}</p>
          {error ? <div className="notice">{error}</div> : null}
          {submitted ? <div className="notice">{submitted}</div> : null}
          {completed ? <div className="notice">{completed}</div> : null}
        </SectionCard>

        {usesDirectFlow ? (
          <SectionCard title="Solve and finish" eyebrow="Step 1">
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
                    label="I solved this, mark finished"
                    pendingLabel="Saving progress..."
                  />
                </form>
              )}
            </div>
          </SectionCard>
        ) : detail.canRevealSolution ? (
          <SectionCard title="Attempt saved" eyebrow="Step 1">
            <p>
              Your one attempt is already saved. Review the solution below and
              mark the mission finished when you are ready.
            </p>
          </SectionCard>
        ) : (
          <SectionCard title="Attempt" eyebrow="Step 1">
            <form action={submitMissionAttemptAction} className="question-list">
              <input type="hidden" name="taskId" value={detail.mission.id} />
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-card__meta">
                    <span className="eyebrow">Question {index + 1}</span>
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
                        question.placeholder || "Write your answer here..."
                      }
                    />
                  )}
                </div>
              ))}
              <SubmitButton
                label="Submit and review solution"
                pendingLabel="Saving your attempt..."
              />
            </form>
          </SectionCard>
        )}

        {!usesDirectFlow && detail.canRevealSolution ? (
          <SectionCard title="Solution Review" eyebrow="Step 2">
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
                    <span className="eyebrow">Review {index + 1}</span>
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
                  {question.explanation ? <p>{question.explanation}</p> : null}
                  {question.sampleAnswer ? (
                    <div className="notice">
                      <strong>Sample answer:</strong> {question.sampleAnswer}
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
                    label="Mark mission finished"
                    pendingLabel="Marking finished..."
                  />
                </form>
              )}
            </div>
          </SectionCard>
        ) : null}
      </div>

      <aside className="sticky-column">
        <SectionCard title="Mission snapshot" eyebrow="Overview">
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
