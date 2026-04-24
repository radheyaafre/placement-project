import { notFound, redirect } from "next/navigation";

import {
  completeMissionAction,
  submitMissionAttemptAction
} from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
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
  const instructions = detail.mission.instructions ?? [];
  const questions = detail.mission.questions ?? [];
  const solution = detail.mission.solution ?? [];
  const usesDirectFlow = usesDirectCompleteFlow(detail.mission.taskType);
  const currentStep = usesDirectFlow
    ? detail.status === "completed"
      ? 3
      : 2
    : detail.status === "completed"
      ? 3
      : detail.canRevealSolution
        ? 2
        : 1;
  const flowSteps = usesDirectFlow
    ? [
        {
          index: "01",
          title: "Open",
          body: "Use the direct problem link."
        },
        {
          index: "02",
          title: "Solve",
          body: "Work it out in your own editor or SQL runner."
        },
        {
          index: "03",
          title: "Finish",
          body: "Mark it done after you review your approach."
        }
      ]
    : [
        {
          index: "01",
          title: "Attempt",
          body: "Solve honestly before opening the explanation."
        },
        {
          index: "02",
          title: "Review",
          body: "Compare your thinking with the solution."
        },
        {
          index: "03",
          title: "Complete",
          body: "Mark the mission done after a genuine review."
        }
      ];

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
          <div className="callout">
            <p className="eyebrow">Mission brief</p>
            <p>{detail.mission.motivationCopy}</p>
          </div>
          <div className="timeline-steps">
            {flowSteps.map((step, index) => (
              <div
                key={step.title}
                className={`timeline-step${
                  currentStep >= index + 1 ? " timeline-step--active" : ""
                }`}
              >
                <span className="timeline-step__index">{step.index}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p className="muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <ul>
            {instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
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
                  <button className="button" type="submit">
                    I solved this, mark finished
                  </button>
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
              <button className="button" type="submit">
                Submit and review solution
              </button>
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
                  <button className="button" type="submit">
                    Mark mission finished
                  </button>
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
              <span className="muted">Current streak</span>
              <strong>{detail.snapshot.currentStreak} days</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Quick guide" eyebrow="Reminder">
          <ul>
            {usesDirectFlow ? (
              <>
                <li>Open the linked problem and solve it outside the app.</li>
                <li>Use your own editor or SQL runner to practice properly.</li>
                <li>Mark it finished here once you are done.</li>
              </>
            ) : (
              <>
                <li>You get one honest attempt for this mission.</li>
                <li>Use the solution to compare process, not just the final answer.</li>
                <li>Mark it finished after a genuine review.</li>
              </>
            )}
          </ul>
        </SectionCard>
      </aside>
    </div>
  );
}
