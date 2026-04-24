import { saveSettingsAction, signOutAction } from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { getSettingsSnapshot } from "@/lib/data";
import { formatHour12, formatWeekday } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const reminderHourOptions = Array.from({ length: 24 }, (_, hour) => ({
  value: `${hour}`,
  label: formatHour12(hour)
}));

export default async function SettingsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const settings = await getSettingsSnapshot();
  const saved = typeof params.saved === "string" ? params.saved : "";

  if (!settings) {
    return null;
  }

  const reminderSummary = settings.reminderSettings.weeklyReminderEnabled
    ? `${formatWeekday(settings.reminderSettings.weeklyReminderDay)} at ${formatHour12(
        settings.reminderSettings.weeklyReminderHour
      )}`
    : "Weekly reminder is off";

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
          <span className="eyebrow">Reminder rhythm</span>
          <strong>{reminderSummary}</strong>
          <p className="muted">
            {settings.reminderSettings.emailEnabled
              ? "Email reminders are enabled."
              : "Email reminders are paused."}
          </p>
        </div>
      </div>

      <SectionCard title="Settings" eyebrow="Profile and reminders">
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
            <label className="option-card">
              <input
                defaultChecked={settings.reminderSettings.emailEnabled}
                name="emailEnabled"
                type="checkbox"
              />
              <span>Enable reminder emails</span>
            </label>
            <label className="option-card">
              <input
                defaultChecked={settings.reminderSettings.weeklyReminderEnabled}
                name="weeklyReminderEnabled"
                type="checkbox"
              />
              <span>Send weekly reminder</span>
            </label>
          </div>
          <div className="split-panel">
            <div className="field">
              <label htmlFor="weeklyReminderDay">Reminder day</label>
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
                Sends one weekly reminder around this local time so students return
                to the app and continue the daily plan.
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
