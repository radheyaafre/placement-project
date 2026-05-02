import Link from "next/link";
import { redirect } from "next/navigation";

import { saveOnboardingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getSettingsSnapshot, getViewerStudentPlanState } from "@/lib/data";
import { buildRedirect } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const settings = await getSettingsSnapshot();
  const error = typeof params.error === "string" ? params.error : "";
  const reportBugHref = buildRedirect("/report-bug", { next: "/onboarding" });
  const reminderEnabled =
    settings?.reminderSettings.emailEnabled &&
    settings?.reminderSettings.weeklyReminderEnabled;

  if (!settings) {
    return null;
  }

  if (settings.mode === "supabase") {
    const planState = await getViewerStudentPlanState();

    if (planState === "present") {
      redirect("/settings");
    }
  }

  return (
    <div className="split-panel">
      <section className="section-card">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">Required setup</p>
            <h2>Complete this once to start Day 1</h2>
          </div>
        </div>
        <p className="muted">
          This is the first required step after login. Save these details once, start
          your 90-day plan from today, and then the main dashboard becomes your home.
        </p>
        {error ? <div className="notice">{error}</div> : null}
        <form action={saveOnboardingAction} className="stack">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              className="input"
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={settings.profile.fullName}
            />
          </div>
          <div className="field">
            <label htmlFor="collegeName">College name</label>
            <input
              className="input"
              id="collegeName"
              name="collegeName"
              type="text"
              defaultValue={settings.profile.collegeName}
            />
          </div>
          <div className="field">
            <label htmlFor="targetRole">Target role</label>
            <input
              className="input"
              id="targetRole"
              name="targetRole"
              type="text"
              defaultValue={settings.profile.targetRole}
            />
          </div>
          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input
              className="input"
              id="timezone"
              name="timezone"
              type="text"
              defaultValue={settings.profile.timezone}
            />
          </div>
          <label className="toggle-field" htmlFor="weeklyReminderEnabled">
            <input
              className="toggle-field__input"
              id="weeklyReminderEnabled"
              name="weeklyReminderEnabled"
              type="checkbox"
              defaultChecked={reminderEnabled}
            />
            <span className="toggle-field__control" aria-hidden="true" />
            <span className="toggle-field__copy">
              <span className="toggle-field__title">Weekly email reminder</span>
              <span className="toggle-field__hint">
                Once every 7 days, we send a progress summary with your joined date,
                completed count, pending count, and category-wise progress. You can
                switch this off anytime in Settings.
              </span>
            </span>
          </label>
          <SubmitButton
            label="Save and start Day 1"
            pendingLabel="Starting Day 1..."
          />
        </form>
        <p className="muted">
          Something not working? <Link href={reportBugHref}>Report a bug</Link>
        </p>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">What happens next</p>
            <h2>After this, the dashboard takes over</h2>
          </div>
        </div>
        <div className="stack">
          <div className="callout">
            <h3>1. Your Day 1 gets fixed</h3>
            <p className="muted">
              The program starts from the day you save this form, so your 90-day flow
              tracks against your own join date.
            </p>
          </div>
          <div className="callout">
            <h3>2. The next task becomes clear</h3>
            <p className="muted">
              The dashboard opens your current task, upcoming unlocks, and pending
              days without extra setup screens.
            </p>
          </div>
          <div className="callout">
            <h3>3. Settings stay separate</h3>
            <p className="muted">
              Later profile edits live in Settings, so students do not have to think
              about onboarding again.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
