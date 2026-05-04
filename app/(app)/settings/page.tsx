import { saveSettingsAction, signOutAction } from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { getSettingsSnapshot } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const settings = await getSettingsSnapshot();
  const saved = typeof params.saved === "string" ? params.saved : "";
  const reminderEnabled =
    settings?.reminderSettings.emailEnabled &&
    settings?.reminderSettings.weeklyReminderEnabled;

  if (!settings) {
    return null;
  }

  return (
    <div className="stack">
      <div className="summary-grid">
        <div className="summary-tile">
          <span className="eyebrow">Target</span>
          <strong>{settings.profile.targetRole || "Placement prep"}</strong>
          <p className="muted">
            {settings.profile.collegeName || "Add your college name"}
          </p>
        </div>
        <div className="summary-tile">
          <span className="eyebrow">Schedule</span>
          <strong>India time</strong>
          <p className="muted">
            All students follow the same timing across the app.
          </p>
        </div>
      </div>

      <SectionCard title="Settings" eyebrow="Profile">
        {saved ? <div className="notice">{saved}</div> : null}
        <form action={saveSettingsAction} className="stack">
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
            <label htmlFor="collegeName">College</label>
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
          <p className="muted">Schedules and unlocks now run on India time only.</p>
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
                We handle the schedule in the system. If this stays on, you get one
                summary email every 7 days with progress, pending days, and category
                counts.
              </span>
            </span>
          </label>
          <SubmitButton label="Save settings" pendingLabel="Saving settings..." />
        </form>
      </SectionCard>

      {settings.mode === "supabase" ? (
        <form action={signOutAction}>
          <SubmitButton
            className="button-secondary"
            label="Sign out"
            pendingLabel="Signing out..."
          />
        </form>
      ) : null}
    </div>
  );
}
