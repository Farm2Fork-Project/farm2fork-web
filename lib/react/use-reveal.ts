import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Fades marked descendants (`data-reveal`) in as they scroll into view.
 *
 * Server HTML is fully visible: the hidden starting state only exists once
 * this runs in the browser (it adds `motion-ready` to the root before first
 * paint), so crawlers, no-JS visitors and people who prefer reduced motion
 * always get the plain page. Late-rendered content (fetched cards, timeline
 * rows) is picked up through a MutationObserver.
 */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    root.classList.add("motion-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const observe = () =>
      root
        .querySelectorAll("[data-reveal]:not(.is-in)")
        .forEach((element) => io.observe(element));

    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mutations.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return ref;
}
