import Link from "next/link";

import { saveOnboardingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getSettingsSnapshot } from "@/lib/data";
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

  return (
    <div className="split-panel">
      <section className="section-card">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">Onboarding</p>
            <h2>Set up the student journey</h2>
          </div>
        </div>
        <p className="muted">
          This form captures the basics, starts the 90-day plan from today, and keeps
          the weekly reminder on by default.
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
            <p className="eyebrow">What unlocks after this</p>
            <h2>Student-ready daily flow</h2>
          </div>
        </div>
        <div className="stack">
          <div className="callout">
            <h3>1. Personalized start date</h3>
            <p className="muted">
              Day 1 begins when the onboarding form is saved, so each student follows
              the same content at their own pace.
            </p>
          </div>
          <div className="callout">
            <h3>2. Daily mission feed</h3>
            <p className="muted">
              The dashboard highlights one mission per day with progress, streak, and
              backlog visibility.
            </p>
          </div>
          <div className="callout">
            <h3>3. Clear progress view</h3>
            <p className="muted">
              Students can always see what is done, what is started, and what comes
              next in the 90-day plan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
