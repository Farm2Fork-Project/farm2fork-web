/**
 * A non-secret "this browser had a buyer signed in" flag. The real session is
 * an HTTP-only cookie the page cannot read, so without a hint the public
 * landing page paints first and the marketplace replaces it a moment later.
 * With the hint, an inline script in the layout marks <html> before first
 * paint and CSS shows a quiet splash instead. It grants nothing: the session
 * check still decides, and a stale hint is cleared as soon as it fails.
 */
export const SESSION_HINT_KEY = "f2f_buyer_hint";
export const SESSION_HINT_ATTRIBUTE = "data-f2f-buyer";

/** Inline, pre-paint: copy the stored hint onto <html>. Must stay tiny and dependency-free. */
export const SESSION_HINT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  SESSION_HINT_KEY,
)})==="1")document.documentElement.setAttribute(${JSON.stringify(
  SESSION_HINT_ATTRIBUTE,
)},"")}catch(e){}`;

export function rememberBuyerSession(): void {
  try {
    window.localStorage.setItem(SESSION_HINT_KEY, "1");
  } catch {
    /* Storage blocked: the landing page just shows first, as before. */
  }
}

/** Lifts the splash for this page view; unless `keepStored`, also forgets the hint for next time. */
export function forgetBuyerSession(
  options: { keepStored?: boolean } = {},
): void {
  if (!options.keepStored) {
    try {
      window.localStorage.removeItem(SESSION_HINT_KEY);
    } catch {
      /* Nothing to clear. */
    }
  }
  document.documentElement.removeAttribute(SESSION_HINT_ATTRIBUTE);
}
