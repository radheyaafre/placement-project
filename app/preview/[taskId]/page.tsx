import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getViewerContext } from "@/lib/auth";
import { demoMissions } from "@/lib/sample-data";
import { buildRedirect, formatTaskType } from "@/lib/utils";

type Params = Promise<{ taskId: string }>;

export default async function MissionPreviewPage({
  params
}: {
  params: Params;
}) {
  const { taskId } = await params;
  const mission = demoMissions.find((item) => item.id === taskId);
  const viewer = await getViewerContext();

  if (!mission) {
    notFound();
  }

  const previewQuestions = mission.questions.slice(
    0,
    mission.taskType === "aptitude" ? 3 : mission.questions.length
  );
  const remainingQuestions = Math.max(
    mission.questions.length - previewQuestions.length,
    0
  );
  const loginHref = buildRedirect("/login", { next: `/preview/${mission.id}` });
  const signupHref = buildRedirect("/signup", { next: `/preview/${mission.id}` });

  return (
    <div className="marketing-shell">
      <section className="hero-panel app-hero">
        <div className="stack">
          <div className="hero-copy">
            <p className="eyebrow">Week one sample preview</p>
            <h1 style={{ fontSize: "3.8rem" }}>{mission.title}</h1>
            <p>
              {formatTaskType(mission.taskType)} | Day {mission.dayNumber} |{" "}
              {mission.estimatedMinutes} min
            </p>
            <div className="pill-row">
              <StatusBadge taskType={mission.taskType} />
              <span className="pill">
                {mission.questions.length}{" "}
                {mission.taskType === "aptitude" ? "questions" : "prompts"}
              </span>
            </div>
          </div>

          <div className="hero-actions">
            {viewer.mode === "demo" ? (
              <Link href={`/mission/${mission.id}`} className="button">
                Open in demo
              </Link>
            ) : viewer.userId ? (
              <Link href="/dashboard" className="button">
                Go to dashboard
              </Link>
            ) : (
              <Link href={loginHref} className="button">
                Sign in to continue
              </Link>
            )}
            {viewer.mode === "supabase" && !viewer.userId ? (
              <Link href={signupHref} className="button-secondary">
                Create account
              </Link>
            ) : (
              <Link href="/" className="button-secondary">
                Back to home
              </Link>
            )}
          </div>
        </div>
      </section>

      <SectionCard title="What happens after login" eyebrow="Sample mission">
        <ul className="challenge-list">
          <li>Students get one clear mission instead of a huge study checklist.</li>
          <li>They attempt first, review next, and mark the day complete at the end.</li>
          <li>Future days stay locked so the plan remains simple and focused.</li>
        </ul>
      </SectionCard>

      <SectionCard
        title={mission.taskType === "aptitude" ? "Question preview" : "Task preview"}
        eyebrow="Preview content"
      >
        <div className="question-list">
          {previewQuestions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-card__meta">
                <span className="eyebrow">
                  {mission.taskType === "aptitude"
                    ? `Question ${index + 1}`
                    : `Prompt ${index + 1}`}
                </span>
                <strong>{question.prompt}</strong>
              </div>

              {question.questionType === "mcq" ? (
                <div className="radio-grid">
                  {question.options?.map((option) => (
                    <div key={option.id} className="option-card">
                      <span>
                        <strong>{option.label}.</strong> {option.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="notice">
                  Students answer this prompt in their own words inside the app.
                </div>
              )}
            </div>
          ))}

          {remainingQuestions ? (
            <div className="notice">
              + {remainingQuestions} more{" "}
              {mission.taskType === "aptitude" ? "questions" : "prompts"} in the
              full daily mission.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
