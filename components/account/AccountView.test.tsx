import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import type { ApiProfile } from "@/lib/api/contracts.ts";
import { resetNavigation, router } from "@/test/next-navigation.ts";
import { AccountView } from "./AccountView";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);
vi.mock("@/components/NotificationSettings", () => ({ default: () => <div>notification settings</div> }));
const api = vi.hoisted(() => ({ request: vi.fn(), logout: vi.fn() }));
vi.mock("@/lib/api/client.ts", () => ({ ApiClient: class { request = api.request; } }));
vi.mock("@/lib/auth/firebase-web-auth-repository.ts", () => ({
  FirebaseWebAuthRepository: class { logout = api.logout; },
}));

const farmer: ApiProfile = {
  user: { id: "f1", email: "tariq@example.com", role: "farmer", phone: "+923211234567", fullName: "Tariq Mehmood", isVerified: true, isActive: true },
  displayName: "Tariq Mehmood",
  profile: {
    kind: "farmer",
    cnicMasked: "*********4561",
    farmName: "Green Valley Farm",
    cropTypes: ["wheat", "Tomatoes"],
    landSizeAcres: 12.5,
    farmLocation: { address: "Chak 5", city: "Multan", province: "Punjab", lat: 30, lng: 71, complete: true },
  },
};

beforeEach(() => {
  resetNavigation("/account");
  api.request.mockReset().mockResolvedValue(farmer);
  api.logout.mockReset().mockResolvedValue(undefined);
  localStorage.clear();
});
afterEach(cleanup);

const renderAccount = () =>
  render(
    <LanguageProvider>
      <AccountView />
    </LanguageProvider>,
  );

test("shows who the person is: name, role, email, verified state, masked CNIC and farm details", async () => {
  renderAccount();
  expect(await screen.findByRole("heading", { level: 1, name: "Tariq Mehmood" })).toBeInTheDocument();
  expect(screen.getByText("Farmer")).toBeInTheDocument();
  expect(screen.getByText("Email verified")).toBeInTheDocument();
  expect(screen.getByText("+92 321 1234567")).toBeInTheDocument();
  expect(screen.getByText("*********4561")).toBeInTheDocument();
  expect(screen.getByText("Green Valley Farm")).toBeInTheDocument();
  expect(screen.getByText("Wheat, Tomatoes")).toBeInTheDocument();
  expect(screen.getByText("Chak 5, Multan, Punjab")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Edit profile/ })).toHaveAttribute("href", "/account/edit");
  expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute("href", "/farmer");
  expect(screen.getByText("notification settings")).toBeInTheDocument();
});

test("a farmer without a pickup location is told, with a way to add one", async () => {
  api.request.mockResolvedValue({ ...farmer, profile: { ...farmer.profile, farmLocation: { complete: false } } });
  renderAccount();
  expect(await screen.findByText(/No pickup location yet/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Add it" })).toHaveAttribute("href", "/account/edit");
});

test("help links go to the public pages; Contact appears only when a contact email is configured", async () => {
  renderAccount();
  const help = within((await screen.findByRole("heading", { name: "Help & Information" })).closest("section")!);
  expect(help.getByRole("link", { name: "FAQs" })).toHaveAttribute("href", "/faq");
  expect(help.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
  expect(help.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  expect(help.getByRole("link", { name: "Terms & Conditions" })).toHaveAttribute("href", "/terms");
  expect(help.queryByRole("link", { name: "Contact Us" })).not.toBeInTheDocument();
});

test("language and text size live here and persist", async () => {
  renderAccount();
  const user = userEvent.setup();
  await user.click(await screen.findByRole("radio", { name: "Large" }));
  await waitFor(() => expect(localStorage.getItem("app_font_size")).toBe("large"));
  await user.click(screen.getByRole("radio", { name: "اردو" }));
  await waitFor(() => expect(localStorage.getItem("app_lang")).toBe("ur"));
  expect(document.querySelector(".ac-page")).toHaveAttribute("dir", "rtl");
});

test("sign out is a two-step inline confirm and ends the session", async () => {
  renderAccount();
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Sign out" }));
  expect(api.logout).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "Sign out" }));
  await waitFor(() => expect(api.logout).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login?signedout=1"));
});

test("a load failure is retryable", async () => {
  api.request.mockRejectedValueOnce(new Error("down"));
  renderAccount();
  expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your account");
  await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByRole("heading", { level: 1, name: "Tariq Mehmood" })).toBeInTheDocument();
});
