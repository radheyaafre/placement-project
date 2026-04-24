import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="page-loading-shell">
      <div className="page-loading-card">
        <LoadingSpinner className="spinner--page" label="Loading page" />
        <p className="eyebrow">Loading</p>
        <h2>Getting your next screen ready.</h2>
        <p className="muted">
          One moment while we load the latest placement progress.
        </p>
      </div>
    </div>
  );
}
