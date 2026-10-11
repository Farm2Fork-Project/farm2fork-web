import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TransporterPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/auth/firebase-web-auth-repository.ts", () => ({
  FirebaseWebAuthRepository: class {
    resolveSession = async () => null;
    getCurrentSession = async () => null;
    resumeSession = async () => null;
    resumeGoogleRedirect = async () => null;
  },
}));

vi.mock("@/lib/auth/role-auth-repository.ts", () => ({ RoleAuthRepository: class { getCurrentUser = async () => { throw new Error("Sign in required"); }; } }));

test("the transporter web portal offers a real sign-in flow", async () => {
  render(<TransporterPage />);
  expect(await screen.findByRole("button", { name: /log in/i })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Transporters use the Farm2Fork app" })).not.toBeInTheDocument();
});
