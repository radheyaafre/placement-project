import Link from "next/link";

import { saveOnboardingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getSettingsSnapshot } from "@/lib/data";
import { buildRedirect, formatHour12 } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const reminderHourOptions = Array.from({ length: 24 }, (_, hour) => ({
  value: `${hour}`,
  label: formatHour12(hour)
}));

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const settings = await getSettingsSnapshot();
  const error = typeof params.error === "string" ? params.error : "";
  const reportBugHref = buildRedirect("/report-bug", { next: "/onboarding" });

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
          This form captures the basics and starts the 90-day plan from today.
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
          <div className="split-panel">
            <div className="field">
              <label htmlFor="weeklyReminderDay">Weekly reminder day</label>
              <select
                className="select"
                id="weeklyReminderDay"
                name="weeklyReminderDay"
                defaultValue={`${settings.reminderSettings.weeklyReminderDay}`}
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="weeklyReminderHour">Reminder time</label>
                <span
                  className="info-chip"
                  title="This sends one weekly reminder email around the selected time in your timezone."
                >
                  i
                </span>
              </div>
              <p className="field-note">
                Pick the time when the weekly reminder should reach the student in
                their own timezone.
              </p>
              <select
                className="select"
                id="weeklyReminderHour"
                name="weeklyReminderHour"
                defaultValue={`${settings.reminderSettings.weeklyReminderHour}`}
              >
                {reminderHourOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            <h3>3. Weekly reminder rhythm</h3>
            <p className="muted">
              Reminder preferences are stored here and later used by the scheduled
              reminder route.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
