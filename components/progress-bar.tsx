export function ProgressBar({
  value,
  max,
  label
}: {
  value: number;
  max: number;
  label: string;
}) {
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="progress-block">
      <div className="progress-block__meta">
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
