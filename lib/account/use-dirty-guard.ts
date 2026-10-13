"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Warns before unsaved edits are lost, without a dialog. Closing or
 * reloading the tab uses the browser's own prompt; clicking a link inside
 * the app is held back and reported as `pendingHref` so the page can show
 * an inline "Stay / Leave" choice. Browser Back is not interceptable in the
 * App Router and is not covered.
 */
export function useDirtyGuard(dirty: boolean, navigate: (href: string) => void) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const bypass = useRef(false);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bypass.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const onClick = (event: MouseEvent) => {
      if (bypass.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(`${url.pathname}${url.search}${url.hash}`);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const stay = useCallback(() => setPendingHref(null), []);
  const leave = useCallback(
    (href?: string) => {
      const target = href ?? pendingHref;
      if (!target) return;
      bypass.current = true;
      navigate(target);
    },
    [navigate, pendingHref],
  );
  /** Call right before a navigation the page starts itself (after a successful save). */
  const allowNavigation = useCallback(() => {
    bypass.current = true;
  }, []);

  return { pendingHref, stay, leave, allowNavigation };
}
