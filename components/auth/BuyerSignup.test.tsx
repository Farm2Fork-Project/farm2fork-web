import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { router, resetNavigation, setUrl } from "@/test/next-navigation.ts";
import { firebaseOnboardingIntent } from "@/lib/auth/firebase-onboarding-intent.ts";
import { pendingSignupRole, signupDraft } from "@/lib/auth/signup-draft.ts";
import { BuyerSignup } from "./BuyerSignup";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);

const auth = vi.hoisted(() => ({
  signUpWithEmail: vi.fn(),
  onboardBuyer: vi.fn(),
  identityEmail: null as string | null,
}));
vi.mock("@/lib/auth/firebase-web-auth-repository.ts", () => ({
  FirebaseWebAuthRepository: class {
    signUpWithEmail = auth.signUpWithEmail;
    onboardBuyer = auth.onboardBuyer;
    getCurrentFirebaseIdentityEmail = () => auth.identityEmail;
  },
}));

const fetchMock = vi.fn();

beforeEach(() => {
  resetNavigation("/signup/buyer");
  sessionStorage.clear();
  auth.signUpWithEmail.mockReset().mockResolvedValue({ kind: "verification_required", email: "ayesha@example.com" });
  auth.onboardBuyer.mockReset();
  auth.identityEmail = null;
  fetchMock.mockReset().mockResolvedValue(new Response("{}", { status: 200, headers: { "content-type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test/api";
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderWizard = () =>
  render(
    <LanguageProvider>
      <BuyerSignup />
    </LanguageProvider>,
  );

async function completeAccountStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Email"), "ayesha@example.com");
  await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
  await user.type(screen.getByLabelText("Confirm password"), "Str0ngPass!");
  await user.click(screen.getByRole("button", { name: /continue/i }));
}

test("the account step validates inline and does not advance until it is right", async () => {
  const user = userEvent.setup();
  renderWizard();

  await user.type(await screen.findByLabelText("Email"), "not-an-email");
  await user.type(screen.getByLabelText("Password"), "short");
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
  expect(screen.getByText("The two passwords don't match.")).toBeInTheDocument();
  expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Enter a valid email address.");
  await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus());
  expect(new URL(window.location.href).searchParams.get("step")).toBeNull();
  expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
});

test("an individual buyer is never asked for a business name and signs up in three short steps", async () => {
  const user = userEvent.setup();
  renderWizard();

  await completeAccountStep(user);
  expect(await screen.findByRole("heading", { name: "About you" })).toBeInTheDocument();
  expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("heading", { name: "About you" })).toHaveFocus());

  // Nothing is typed yet: the step refuses to advance and says why.
  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
  expect(screen.getByText("Choose how you're buying.")).toBeInTheDocument();

  await user.type(screen.getByLabelText("Full name"), "Ayesha Khan");
  await user.type(screen.getByLabelText(/Mobile number/), "0300 1234567");
  expect(screen.getByText("We'll save it as +92 300 1234567.")).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: "Individual" }));
  expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(await screen.findByRole("heading", { name: "Identity" })).toBeInTheDocument();
  await user.type(screen.getByLabelText("CNIC"), "3520212345671");
  expect(screen.getByLabelText("CNIC")).toHaveValue("35202-1234567-1");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  await waitFor(() => expect(auth.signUpWithEmail).toHaveBeenCalledWith({ email: "ayesha@example.com", password: "Str0ngPass!" }));
  expect(router.push).toHaveBeenLastCalledWith("/verify-email");
  expect(pendingSignupRole.read()).toBe("buyer");
  // The finished draft is what completes the profile after the email is verified, and it has no password.
  expect(signupDraft.read("buyer")).toMatchObject({ fullName: "Ayesha Khan", businessType: "individual", cnic: "35202-1234567-1" });
  expect(JSON.stringify(Object.values(sessionStorage))).not.toContain("Str0ngPass!");
});

test("a business buyer must name the business", async () => {
  const user = userEvent.setup();
  renderWizard();
  await completeAccountStep(user);

  await user.type(await screen.findByLabelText("Full name"), "Ayesha Khan");
  await user.click(screen.getByRole("radio", { name: "Restaurant" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(screen.getByText("Enter your business name.")).toBeInTheDocument();
  await user.type(screen.getByLabelText("Business name"), "Khan Kitchen");
  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(await screen.findByRole("heading", { name: "Identity" })).toBeInTheDocument();
});

test("going back keeps what was typed", async () => {
  const user = userEvent.setup();
  renderWizard();
  await completeAccountStep(user);

  await user.type(await screen.findByLabelText("Full name"), "Ayesha Khan");
  await user.click(screen.getByRole("button", { name: /back/i }));
  expect(await screen.findByLabelText("Email")).toHaveValue("ayesha@example.com");

  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(await screen.findByLabelText("Full name")).toHaveValue("Ayesha Khan");
});

test("after a reload the draft is restored but the password is not, so the person is sent back to enter it", async () => {
  signupDraft.save("buyer", { email: "ayesha@example.com", fullName: "Ayesha Khan", businessType: "individual", cnic: "35202-1234567-1" });
  setUrl("/signup/buyer?step=3");
  renderWizard();

  expect(await screen.findByLabelText("Email")).toHaveValue("ayesha@example.com");
  expect(screen.getByText(/enter it again/i)).toBeInTheDocument();
  expect(new URL(window.location.href).searchParams.get("step")).toBeNull();
});

test("an existing email is reported on the email field, on the first step", async () => {
  auth.signUpWithEmail.mockRejectedValue(Object.assign(new Error("Firebase: Error (auth/email-already-in-use)."), { code: "auth/email-already-in-use" }));
  const user = userEvent.setup();
  renderWizard();
  await completeAccountStep(user);
  await user.type(await screen.findByLabelText("Full name"), "Ayesha Khan");
  await user.click(screen.getByRole("radio", { name: "Individual" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.type(await screen.findByLabelText("CNIC"), "3520212345671");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  expect(await screen.findByText("That email already has an account. Sign in instead.")).toBeInTheDocument();
  expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
});

test("a Google or verified account skips the account step and onboards with the profile form", async () => {
  auth.identityEmail = "ayesha@example.com";
  firebaseOnboardingIntent.save("ayesha@example.com");
  auth.onboardBuyer.mockResolvedValue({ id: "b1", email: "ayesha@example.com", role: "buyer", isVerified: true, isActive: true });
  setUrl("/signup/buyer?identity=1");
  const user = userEvent.setup();
  renderWizard();

  expect(await screen.findByText("Signed in as ayesha@example.com.")).toBeInTheDocument();
  expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();

  await user.type(screen.getByLabelText("Full name"), "Ayesha Khan");
  await user.type(screen.getByLabelText(/Mobile number/), "03001234567");
  await user.click(screen.getByRole("radio", { name: "Individual" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  await user.type(await screen.findByLabelText("CNIC"), "35202-1234567-1");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  await waitFor(() =>
    expect(auth.onboardBuyer).toHaveBeenCalledWith({
      businessName: "Ayesha Khan",
      businessType: "individual",
      cnic: "35202-1234567-1",
      phone: "+923001234567",
    }),
  );
  // The onboarding endpoint takes no name, so it is saved with a profile edit.
  await waitFor(() => {
    const patch = fetchMock.mock.calls.find(([, init]) => init?.method === "PATCH");
    expect(patch?.[0]).toBe("http://api.test/api/auth/me/profile");
    expect(JSON.parse(patch?.[1].body)).toEqual({ fullName: "Ayesha Khan" });
  });
  await waitFor(() => expect(router.replace).toHaveBeenLastCalledWith("/"));
});

test("without a live identity the identity route explains and offers sign-in instead of an empty form", async () => {
  setUrl("/signup/buyer?identity=1");
  renderWizard();
  expect(await screen.findByText(/sign-in session ended/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute("href", "/login");
});
