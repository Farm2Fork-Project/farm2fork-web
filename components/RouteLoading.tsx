/**
 * Loading state for the signed-in portals. It lives in each portal folder
 * instead of the app root: a root loading.tsx wraps every page in a Suspense
 * boundary, and React streams large boundaries after a placeholder, which
 * leaves public pages as "Loading…" for crawlers that do not run JavaScript.
 */
export default function RouteLoading() {
  return (
    <div className="app-boundary" role="status" aria-live="polite">
      <div className="app-spinner" />
      <p>Loading…</p>
    </div>
  );
}
