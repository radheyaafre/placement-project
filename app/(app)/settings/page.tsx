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
          <span className="eyebrow">Timezone</span>
          <strong>{settings.profile.timezone}</strong>
          <p className="muted">
            Your daily plan follows this timezone.
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
