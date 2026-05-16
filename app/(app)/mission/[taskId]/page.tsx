import { redirect } from "next/navigation";

import {
  completeMissionAction,
  submitMissionAttemptAction
} from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { getMissionDetail } from "@/lib/data";
import { usesDirectCompleteFlow } from "@/lib/plan";
import { buildRedirect, formatTaskType } from "@/lib/utils";

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

function getReviewOptionTone(params: {
  isCorrect: boolean;
  isSelected: boolean;
}) {
  if (params.isCorrect) {
    return "review-option review-option--correct";
  }

  if (params.isSelected) {
    return "review-option review-option--incorrect";
  }

  return "review-option";
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
    redirect(
      buildRedirect("/dashboard", {
        error: "This mission is not available right now."
      })
    );
  }

  const error = typeof query.error === "string" ? query.error : "";
  const submitted = typeof query.submitted === "string" ? query.submitted : "";
  const completed = typeof query.completed === "string" ? query.completed : "";
  const questions = detail.mission.questions ?? [];
  const solution = detail.mission.solution ?? [];
  const usesDirectFlow = usesDirectCompleteFlow(detail.mission.taskType);
  const isHrMission = detail.mission.taskType === "hr";
  const introCopy = usesDirectFlow
    ? "Open the original practice link, solve it there, then mark today as complete here."
    : detail.canRevealSolution
      ? isHrMission
        ? "Your answers are saved and this day is completed. Review them with the guidance below anytime."
        : "Your attempt is saved and the day is completed. Review the explanation below anytime."
      : isHrMission
        ? "Prepare this for yourself. Write each answer down so you can revisit it before interviews."
        : "Attempt the questions honestly before opening the explanation.";

  return (
    <div className="stack">
      <SectionCard
        title={detail.mission.title}
        eyebrow={`Sprint ${detail.mission.weekNumber} • Day ${detail.mission.dayNumber}`}
        aside={
          <div className="pill-row">
            <StatusBadge taskType={detail.mission.taskType} />
            <StatusBadge status={detail.status} />
          </div>
        }
      >
        <div className="mission-meta">
          <span className="pill">{formatTaskType(detail.mission.taskType)}</span>
          <span className="pill">{detail.mission.estimatedMinutes} min</span>
          <span className="pill">{detail.mission.topic}</span>
        </div>
        <p className="mission-intro">{introCopy}</p>
        {error ? <div className="notice">{error}</div> : null}
        {submitted ? <div className="notice">{submitted}</div> : null}
        {completed ? <div className="notice">{completed}</div> : null}
      </SectionCard>

      {usesDirectFlow ? (
        <SectionCard title="Open the problem" eyebrow="Direct practice">
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
              <div className="notice">
                Day completed. You can reopen the practice link anytime.
              </div>
            ) : (
              <form action={completeMissionAction}>
                <input type="hidden" name="taskId" value={detail.mission.id} />
                <SubmitButton
                  label="I finished this task"
                  pendingLabel="Saving completion..."
                />
              </form>
            )}
          </div>
        </SectionCard>
      ) : detail.canRevealSolution ? (
        <SectionCard
          title={isHrMission ? "Saved for you" : "Review"}
          eyebrow="Completed"
        >
          <p>
            {isHrMission
              ? "Your answers are saved and this day is completed. Review the guidance below anytime."
              : "Your one attempt is saved and this day is completed. Review the answer below anytime."}
          </p>
        </SectionCard>
      ) : (
        <SectionCard
          title={isHrMission ? "Write your answers" : "Try the questions"}
          eyebrow="One attempt"
        >
          <form action={submitMissionAttemptAction} className="question-list">
            <input type="hidden" name="taskId" value={detail.mission.id} />
            {isHrMission ? (
              <div className="notice hr-prep-note">
                Prepare this for yourself. Write it down clearly so you can
                revisit it before interviews.
              </div>
            ) : null}
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
                ) : isHrMission ? (
                  <div className="hr-answer-layout">
                    <div className="hr-answer-main">
                      <textarea
                        className="textarea"
                        name={`answer_${question.id}`}
                        required
                        placeholder={
                          question.placeholder || "Write or prepare your answer here..."
                        }
                      />
                    </div>
                    <div className="hr-answer-side">
                      <div className="hint-card">
                        <span className="eyebrow">Hint / direction</span>
                        <p>
                          {question.explanation ||
                            question.sampleAnswer ||
                            "Keep it honest, specific, and based on a real example from your work, project, or college life."}
                        </p>
                      </div>
                      {question.explanation && question.sampleAnswer ? (
                        <div className="hint-card hint-card--soft">
                          <span className="eyebrow">Example direction</span>
                          <p>{question.sampleAnswer}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="textarea"
                    name={`answer_${question.id}`}
                    placeholder={question.placeholder || "Write your answer here..."}
                  />
                )}
              </div>
            ))}
            <SubmitButton
              label={isHrMission ? "Save answers and complete" : "Save attempt and complete"}
              pendingLabel={isHrMission ? "Saving your answers..." : "Saving your attempt..."}
            />
          </form>
        </SectionCard>
      )}

      {!usesDirectFlow && detail.canRevealSolution ? (
        <SectionCard
          title={isHrMission ? "Your answers and guidance" : "Review"}
          eyebrow="Saved for you"
        >
          <div className="stack">
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
                    {question.explanation || question.sampleAnswer ? (
                      <div className="notice">
                        <strong>Hint / direction:</strong>{" "}
                        {question.explanation || question.sampleAnswer}
                      </div>
                    ) : null}
                    {question.explanation && question.sampleAnswer ? (
                      <p className="muted">
                        <strong>Example direction:</strong> {question.sampleAnswer}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <>
                    {question.questionType === "mcq" ? (
                      <div className="review-options">
                        {question.options?.map((option) => {
                          const selectedOptionId =
                            detail.responsesByQuestionId[question.id]?.selectedOptionId;
                          const isSelected = selectedOptionId === option.id;
                          const isCorrect = Boolean(option.isCorrect);

                          return (
                            <div
                              key={option.id}
                              className={getReviewOptionTone({
                                isCorrect,
                                isSelected
                              })}
                            >
                              <div className="review-option__copy">
                                <strong>{option.label}.</strong> {option.text}
                              </div>
                              <div className="pill-row">
                                {isSelected ? (
                                  <span className="review-option__badge review-option__badge--selected">
                                    Your choice
                                  </span>
                                ) : null}
                                {isCorrect ? (
                                  <span className="review-option__badge review-option__badge--correct">
                                    Correct
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                        {!detail.responsesByQuestionId[question.id]?.selectedOptionId ? (
                          <div className="notice">
                            No option was selected for this question.
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {question.explanation ? (
                      <div className="notice">
                        <strong>Hint:</strong> {question.explanation}
                      </div>
                    ) : null}
                    {question.sampleAnswer ? (
                      <div className="notice">
                        <strong>Sample answer:</strong> {question.sampleAnswer}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ))}
            <div className="notice">
              Day completed. You can come back here anytime to review.
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
