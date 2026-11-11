/** An indeterminate loading indicator built on the native <progress> element. */
export function Spinner({ label }: { label: string }) {
  return (
    <div className="loading">
      <progress className="spinner" aria-label={label} />
      <p>{label}…</p>
    </div>
  );
}
