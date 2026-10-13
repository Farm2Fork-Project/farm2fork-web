import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { resetNavigation, router } from "@/test/next-navigation.ts";
import { LoginForm } from "./LoginForm";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);
const me = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@/lib/api/client.ts", () => ({ ApiClient: class { request = me.request; } }));
const auth = vi.hoisted(() => ({
  signInWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  resumeGoogleRedirect: vi.fn(),
}));
vi.mock("@/lib/auth/firebase-web-auth-repository.ts", () => ({
  FirebaseWebAuthRepository: class {
    signInWithEmail = auth.signInWithEmail;
    signInWithGoogle = auth.signInWithGoogle;
    resumeGoogleRedirect = auth.resumeGoogleRedirect;
  },
}));

const session = (role: string) => ({
  kind: "session" as const,
  user: { id: "u1", email: "u@example.com", role, isVerified: true, isActive: true },
});

beforeEach(() => {
  me.request.mockReset().mockRejectedValue(new Error("401"));
  resetNavigation("/login");
  auth.signInWithEmail.mockReset();
  auth.signInWithGoogle.mockReset();
  auth.resumeGoogleRedirect.mockReset().mockResolvedValue(null);
});
afterEach(cleanup);

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email"), "u@example.com");
  await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
  await user.click(screen.getByRole("button", { name: "Log In" }));
}

const renderLogin = () =>
  render(
    <LanguageProvider>
      <LoginForm />
    </LanguageProvider>,
  );

test.each([
  ["buyer", "/"],
  ["farmer", "/farmer"],
  ["financial_partner", "/financial"],
  ["admin", "/admin/dashboard"],
  ["transporter", "/transporter"],
])("a %s signs in once and lands on %s, with no wrong-role dead end", async (role, destination) => {
  auth.signInWithEmail.mockResolvedValue(session(role));
  renderLogin();
  await signIn(userEvent.setup());
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith(destination));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("?next= brings the person back to the page they wanted, if it is theirs", async () => {
  resetNavigation("/login?next=%2Faccount%2Fedit");
  auth.signInWithEmail.mockResolvedValue(session("farmer"));
  renderLogin();
  await signIn(userEvent.setup());
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/account/edit"));
});

test("?next= into another role's portal is ignored", async () => {
  resetNavigation("/login?next=%2Fadmin%2Fdashboard");
  auth.signInWithEmail.mockResolvedValue(session("buyer"));
  renderLogin();
  await signIn(userEvent.setup());
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
});

test("an unverified email goes to /verify-email, a new account to the role chooser", async () => {
  const user = userEvent.setup();
  auth.signInWithEmail.mockResolvedValue({ kind: "verification_required", email: "u@example.com" });
  renderLogin();
  await signIn(user);
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/verify-email"));

  cleanup();
  auth.signInWithEmail.mockResolvedValue({ kind: "onboarding_required", email: "u@example.com" });
  renderLogin();
  await signIn(user);
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/signup?continue=1"));
});

test("empty fields are explained inline and nothing is sent", async () => {
  const user = userEvent.setup();
  renderLogin();
  await user.click(screen.getByRole("button", { name: "Log In" }));
  expect(screen.getByText("Enter your email address.")).toBeInTheDocument();
  expect(screen.getByText("Enter your password.")).toBeInTheDocument();
  expect(auth.signInWithEmail).not.toHaveBeenCalled();
});

test("Firebase errors become plain language", async () => {
  auth.signInWithEmail.mockRejectedValue(Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), { code: "auth/invalid-credential" }));
  renderLogin();
  await signIn(userEvent.setup());
  expect(await screen.findByRole("alert")).toHaveTextContent("That email and password don't match. Check them and try again.");
  expect(screen.queryByText(/auth\/invalid-credential/)).not.toBeInTheDocument();
});

test("forgot password is an inline link to its own page, and Google signs in through the same flow", async () => {
  const user = userEvent.setup();
  auth.signInWithGoogle.mockResolvedValue(session("farmer"));
  renderLogin();
  expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
  expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
  await user.click(screen.getByRole("button", { name: /continue with google/i }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/farmer"));
});

test("closing the Google window is not shown as an error", async () => {
  auth.signInWithGoogle.mockRejectedValue(Object.assign(new Error("x"), { code: "auth/popup-closed-by-user" }));
  renderLogin();
  await userEvent.setup().click(screen.getByRole("button", { name: /continue with google/i }));
  await waitFor(() => expect(screen.getByRole("button", { name: /continue with google/i })).toBeEnabled());
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("a Google redirect return finishes the same way", async () => {
  auth.resumeGoogleRedirect.mockResolvedValue(session("admin"));
  renderLogin();
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/admin/dashboard"));
});

test("someone who is already signed in is sent to their portal instead of seeing the form", async () => {
  me.request.mockResolvedValue({ id: "f1", email: "f@example.com", role: "farmer", isVerified: true, isActive: true });
  renderLogin();
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/farmer"));
});

test("right after signing out the form stays, with a confirmation", async () => {
  resetNavigation("/login?signedout=1");
  me.request.mockResolvedValue({ id: "f1", email: "f@example.com", role: "farmer", isVerified: true, isActive: true });
  renderLogin();
  expect(await screen.findByText("You've been signed out.")).toBeInTheDocument();
  expect(me.request).not.toHaveBeenCalled();
  expect(router.replace).not.toHaveBeenCalled();
});
