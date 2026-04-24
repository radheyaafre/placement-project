import Link from "next/link";

import { previewImportAction } from "@/app/actions";
import { SectionCard } from "@/components/section-card";
import { SubmitButton } from "@/components/submit-button";
import { getAdminContentSnapshot } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminContentPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const snapshot = await getAdminContentSnapshot();
  const error = typeof params.error === "string" ? params.error : "";
  const rows = typeof params.rows === "string" ? params.rows : "";
  const days = typeof params.days === "string" ? params.days : "";
  const types = typeof params.types === "string" ? params.types : "";

  if (!snapshot.isAdmin) {
    return (
      <SectionCard title="Admin access required" eyebrow="Restricted">
        <p className="muted">
          Sign in with a profile whose role is `admin` to manage plan content.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="split-panel">
      <SectionCard title="Plan content" eyebrow="Admin">
        <div className="stack">
          <div className="callout">
            <h3>{snapshot.activePlanName}</h3>
            <p className="muted">
              {snapshot.publishedDays} published day rows out of a {snapshot.durationDays}-day plan.
            </p>
          </div>
          {error ? <div className="notice">{error}</div> : null}
          {rows ? (
            <div className="notice">
              Preview parsed {rows} row(s) across {days} unique day(s). Task types: {types}
            </div>
          ) : null}
          <form action={previewImportAction} className="stack">
            <div className="field">
              <label htmlFor="csv">Paste CSV content</label>
              <textarea
                className="textarea"
                id="csv"
                name="csv"
                defaultValue={snapshot.sampleCsv}
              />
            </div>
            <SubmitButton
              label="Preview import"
              pendingLabel="Previewing import..."
            />
          </form>
        </div>
      </SectionCard>

      <SectionCard title="Import notes" eyebrow="MVP scope">
        <div className="stack">
          <p className="muted">
            This admin page currently validates and previews CSV structure. The actual
            write path is prepared through Supabase tables and the API import stub.
          </p>
          <ul>
            <li>Use one row per day for the first import pass.</li>
            <li>Keep `instructions` and `solution` simple plain text initially.</li>
            <li>
              After Supabase is configured, you can expand this into a full publish flow
              or seed content directly from SQL.
            </li>
          </ul>
          <Link href="/api/admin/import" className="button-ghost">
            API route available at /api/admin/import
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
