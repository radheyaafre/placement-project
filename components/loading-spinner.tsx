export function LoadingSpinner({
  className = "",
  label = "Loading"
}: {
  className?: string;
  label?: string;
}) {
  const spinnerClassName = className
    ? `spinner ${className}`.trim()
    : "spinner";

  return (
    <span className="spinner-wrap" role="status" aria-label={label}>
      <span className={spinnerClassName} aria-hidden="true" />
    </span>
  );
}
