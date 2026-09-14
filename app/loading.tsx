export default function Loading() {
  return (
    <div className="app-boundary" role="status" aria-live="polite">
      <div className="app-spinner" />
      <p>Loading…</p>
    </div>
  );
}
