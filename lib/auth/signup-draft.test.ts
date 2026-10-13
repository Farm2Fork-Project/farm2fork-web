import { afterEach, describe, expect, test } from "vitest";
import { pendingSignupRole, signupDraft } from "./signup-draft.ts";

afterEach(() => sessionStorage.clear());

describe("sign-up drafts", () => {
  test("keep typed values for the role and restore them", () => {
    signupDraft.save("buyer", { fullName: "Ayesha Khan", businessType: "retailer" });
    expect(signupDraft.read("buyer")).toEqual({ fullName: "Ayesha Khan", businessType: "retailer" });
    expect(signupDraft.read("farmer")).toEqual({});
  });

  test("never store a password, even if a caller passes one", () => {
    signupDraft.save("buyer", { email: "a@b.com", password: "hunter22", confirmation: "hunter22" });
    const stored = JSON.stringify(Object.fromEntries(Object.keys(sessionStorage).map((k) => [k, sessionStorage.getItem(k)])));
    expect(stored).not.toContain("hunter22");
    expect(signupDraft.read("buyer")).toEqual({ email: "a@b.com" });
  });

  test("lists survive (crops) and a corrupt draft reads as empty", () => {
    signupDraft.save("farmer", { cropTypes: ["wheat", "rice"] });
    expect(signupDraft.read("farmer")).toEqual({ cropTypes: ["wheat", "rice"] });
    sessionStorage.setItem("farm2fork.signup-draft.v1.farmer", "{not json");
    expect(signupDraft.read("farmer")).toEqual({});
  });

  test("clear removes it, and the pending role round-trips", () => {
    signupDraft.save("buyer", { fullName: "A" });
    signupDraft.clear("buyer");
    expect(signupDraft.read("buyer")).toEqual({});
    pendingSignupRole.save("farmer");
    expect(pendingSignupRole.read()).toBe("farmer");
    pendingSignupRole.clear();
    expect(pendingSignupRole.read()).toBeNull();
  });
});
