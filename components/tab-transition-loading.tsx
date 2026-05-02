import { LoadingSpinner } from "@/components/loading-spinner";

export function TabTransitionLoading({ label }: { label: string }) {
  return (
    <div className="app-tab-loading" aria-live="polite" aria-busy="true">
      <section className="app-tab-loading__card">
        <div className="app-tab-loading__eyebrow">
          <LoadingSpinner className="spinner--route" label={label} />
          <span>{label}</span>
        </div>
        <h2>Getting the next view ready.</h2>
        <p className="muted">
          One moment while we load the latest placement progress and tasks.
        </p>
        <div className="app-tab-loading__skeletons" aria-hidden="true">
          <div className="app-tab-loading__skeleton app-tab-loading__skeleton--wide" />
          <div className="app-tab-loading__skeleton app-tab-loading__skeleton--medium" />
          <div className="app-tab-loading__skeleton-grid">
            <div className="app-tab-loading__skeleton app-tab-loading__skeleton--tile" />
            <div className="app-tab-loading__skeleton app-tab-loading__skeleton--tile" />
          </div>
          <div className="app-tab-loading__skeleton app-tab-loading__skeleton--row" />
          <div className="app-tab-loading__skeleton app-tab-loading__skeleton--row" />
        </div>
      </section>
    </div>
  );
}
