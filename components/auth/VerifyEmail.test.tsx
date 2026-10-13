import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { resetNavigation, router } from "@/test/next-navigation.ts";
import { pendingSignupRole, signupDraft } from "@/lib/auth/signup-draft.ts";
import { VerifyEmail } from "./VerifyEmail";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);
const auth = vi.hoisted(() => ({
  email: "ayesha@example.com" as string | null,
  refreshEmailVerification: vi.fn(),
  resendEmailVerification: vi.fn(),
  onboardBuyer: vi.fn(),
}));
vi.mock("@/lib/auth/firebase-web-auth-repository.ts", () => ({
  FirebaseWebAuthRepository: class {
    getCurrentFirebaseIdentityEmail = () => auth.email;
    refreshEmailVerification = auth.refreshEmailVerification;
    resendEmailVerification = auth.resendEmailVerification;
    onboardBuyer = auth.onboardBuyer;
  },
}));

beforeEach(() => {
  resetNavigation("/verify-email");
  sessionStorage.clear();
  auth.email = "ayesha@example.com";
  auth.refreshEmailVerification.mockReset();
  auth.resendEmailVerification.mockReset().mockResolvedValue(undefined);
  auth.onboardBuyer.mockReset();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { headers: { "content-type": "application/json" } })));
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test/api";
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const renderPage = () =>
  render(
    <LanguageProvider>
      <VerifyEmail />
    </LanguageProvider>,
  );

test("says where the link went and what to do", async () => {
  renderPage();
  expect(await screen.findByRole("heading", { name: "Verify your email" })).toBeInTheDocument();
  expect(screen.getByText("We sent a link to ayesha@example.com. Open it, then come back here.")).toBeInTheDocument();
});

test("'I've verified' before the email is verified is a calm status, not an error", async () => {
  auth.refreshEmailVerification.mockResolvedValue({ kind: "verification_required", email: "ayesha@example.com" });
  renderPage();
  await userEvent.setup().click(await screen.findByRole("button", { name: "I've verified my email" }));
  expect(await screen.findByRole("status")).toHaveTextContent(/can't see the verification yet/i);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(router.replace).not.toHaveBeenCalled();
});

test("a verified account with an existing profile goes to its portal", async () => {
  auth.refreshEmailVerification.mockResolvedValue({
    kind: "session",
    user: { id: "f1", email: "f@example.com", role: "farmer", isVerified: true, isActive: true },
  });
  renderPage();
  await userEvent.setup().click(await screen.findByRole("button", { name: "I've verified my email" }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/farmer"));
});

test("a newly verified sign-up is finished from the saved draft, then lands on the buyer home", async () => {
  signupDraft.save("buyer", { fullName: "Ayesha Khan", businessType: "individual", cnic: "35202-1234567-1", phone: "03001234567" });
  pendingSignupRole.save("buyer");
  auth.refreshEmailVerification.mockResolvedValue({ kind: "onboarding_required", email: "ayesha@example.com" });
  auth.onboardBuyer.mockResolvedValue({ id: "b1", email: "ayesha@example.com", role: "buyer", isVerified: true, isActive: true });
  renderPage();

  await userEvent.setup().click(await screen.findByRole("button", { name: "I've verified my email" }));

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
  expect(auth.onboardBuyer).toHaveBeenCalledWith({
    businessName: "Ayesha Khan",
    businessType: "individual",
    cnic: "35202-1234567-1",
    phone: "+923001234567",
  });
  expect(signupDraft.read("buyer")).toEqual({});
});

test("with no usable draft the person finishes their profile in the sign-up form", async () => {
  pendingSignupRole.save("farmer");
  auth.refreshEmailVerification.mockResolvedValue({ kind: "onboarding_required", email: "ayesha@example.com" });
  renderPage();
  await userEvent.setup().click(await screen.findByRole("button", { name: "I've verified my email" }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/signup/farmer?identity=1"));
});

test("resend works once, then waits out a cooldown", async () => {
  renderPage();
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Resend email" }));

  expect(auth.resendEmailVerification).toHaveBeenCalledTimes(1);
  expect(await screen.findByText("Sent. Check your inbox.")).toBeInTheDocument();
  const waiting = screen.getByRole("button", { name: /Resend in 60s/ });
  expect(waiting).toBeDisabled();
});

test("a resend refused by Firebase is explained in plain language", async () => {
  auth.resendEmailVerification.mockRejectedValue(Object.assign(new Error("x"), { code: "auth/too-many-requests" }));
  renderPage();
  await userEvent.setup().click(await screen.findByRole("button", { name: "Resend email" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Too many attempts. Wait a few minutes and try again.");
});

test("after a reload there is no Firebase identity, so it asks the person to sign in again", async () => {
  auth.email = null;
  renderPage();
  expect(await screen.findByRole("heading", { name: "Sign in to continue" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  expect(screen.queryByRole("button", { name: "I've verified my email" })).not.toBeInTheDocument();
});
