import { useSyncExternalStore } from "react";
import { vi } from "vitest";

/**
 * A tiny in-memory stand-in for next/navigation. `router.push` and
 * `router.replace` change the URL and re-render anything reading it, like the
 * real router, so multi-step flows driven by `?step=` work in tests.
 *
 * Usage (hoisted by vitest):
 *   vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);
 */
let url = new URL("http://localhost/");
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const router = {
  push: vi.fn((href: string) => {
    url = new URL(href, url);
    emit();
  }),
  replace: vi.fn((href: string) => {
    url = new URL(href, url);
    emit();
  }),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export function setUrl(href: string) {
  url = new URL(href, "http://localhost");
  emit();
}

export function resetNavigation(href = "/") {
  router.push.mockClear();
  router.replace.mockClear();
  setUrl(href);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => url.href;

function useHref() {
  return new URL(useSyncExternalStore(subscribe, snapshot, snapshot));
}

export const navigationModule = {
  useRouter: () => router,
  usePathname: () => useHref().pathname,
  useSearchParams: () => useHref().searchParams,
};
