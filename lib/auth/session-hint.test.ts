import { afterEach, describe, expect, it } from "vitest";
import {
  SESSION_HINT_ATTRIBUTE,
  SESSION_HINT_KEY,
  SESSION_HINT_SCRIPT,
  forgetBuyerSession,
  rememberBuyerSession,
} from "./session-hint.ts";

const marked = () =>
  document.documentElement.hasAttribute(SESSION_HINT_ATTRIBUTE);
const runInlineScript = () => new Function(SESSION_HINT_SCRIPT)();

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute(SESSION_HINT_ATTRIBUTE);
});

describe("session hint", () => {
  it("marks <html> before paint only for a browser that remembers a buyer", () => {
    runInlineScript();
    expect(marked()).toBe(false);

    rememberBuyerSession();
    expect(localStorage.getItem(SESSION_HINT_KEY)).toBe("1");
    runInlineScript();
    expect(marked()).toBe(true);
  });

  it("forgetting lifts the splash and, by default, the stored hint", () => {
    rememberBuyerSession();
    runInlineScript();

    forgetBuyerSession();
    expect(marked()).toBe(false);
    expect(localStorage.getItem(SESSION_HINT_KEY)).toBeNull();
  });

  it("can lift the splash for this view but keep the hint (e.g. offline)", () => {
    rememberBuyerSession();
    runInlineScript();

    forgetBuyerSession({ keepStored: true });
    expect(marked()).toBe(false);
    expect(localStorage.getItem(SESSION_HINT_KEY)).toBe("1");
  });
});
