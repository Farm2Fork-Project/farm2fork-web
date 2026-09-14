"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="app-boundary">
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. You can try again, or go back to the homepage.</p>
      <div style={{ display: "flex", gap: "var(--sp-md)" }}>
        <button className="btn btn-outline" onClick={reset} type="button">
          Try again
        </button>
        <a className="btn btn-primary" href="/">
          Back to home
        </a>
      </div>
    </div>
  );
}
