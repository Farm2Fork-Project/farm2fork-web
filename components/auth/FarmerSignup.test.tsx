import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { resetNavigation, router } from "@/test/next-navigation.ts";
import { signupDraft } from "@/lib/auth/signup-draft.ts";
import { FarmerSignup } from "./FarmerSignup";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);
const signUp = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/firebase-web-auth-repository.ts", () => ({
  FirebaseWebAuthRepository: class {
    signUpWithEmail = signUp;
    getCurrentFirebaseIdentityEmail = () => null;
  },
}));

beforeEach(() => {
  resetNavigation("/signup/farmer");
  sessionStorage.clear();
  signUp.mockReset().mockResolvedValue({ kind: "verification_required", email: "t@example.com" });
});
afterEach(cleanup);

test("a farmer signs up in three steps; the location step needs address, province and a pin inside Pakistan", async () => {
  const user = userEvent.setup();
  render(
    <LanguageProvider>
      <FarmerSignup />
    </LanguageProvider>,
  );

  await user.type(await screen.findByLabelText("Email"), "t@example.com");
  await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
  await user.type(screen.getByLabelText("Confirm password"), "Str0ngPass!");
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(await screen.findByRole("heading", { name: "Your farm" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /continue/i }));
  expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
  expect(screen.getByText("Enter your farm's name.")).toBeInTheDocument();

  await user.type(screen.getByLabelText("Full name"), "Tariq Mehmood");
  await user.type(screen.getByLabelText("Farm name"), "Green Valley Farm");
  await user.click(screen.getByRole("checkbox", { name: "Wheat" }));
  await user.click(screen.getByRole("button", { name: /continue/i }));

  expect(await screen.findByRole("heading", { name: "Location and ID" })).toBeInTheDocument();
  expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Create account" }));
  expect(screen.getByText("Enter the street or village.")).toBeInTheDocument();
  expect(screen.getByText("Choose a province.")).toBeInTheDocument();
  expect(screen.getByText("Pin your farm on the map, or enter coordinates inside Pakistan.")).toBeInTheDocument();
  expect(screen.getByText("A CNIC has 13 digits.")).toBeInTheDocument();
  expect(signUp).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText("Street or village"), "Chak 5, Canal Road");
  await user.type(screen.getByLabelText("City"), "Multan");
  await user.selectOptions(screen.getByLabelText("Province"), "Punjab");
  await user.type(screen.getByLabelText("Latitude"), "51.5");
  await user.type(screen.getByLabelText("Longitude"), "71.5249");
  await user.type(screen.getByLabelText("CNIC"), "3520212345671");
  await user.click(screen.getByRole("button", { name: "Create account" }));
  expect(screen.getByText("Pin your farm on the map, or enter coordinates inside Pakistan.")).toBeInTheDocument();
  expect(signUp).not.toHaveBeenCalled();

  await user.clear(screen.getByLabelText("Latitude"));
  await user.type(screen.getByLabelText("Latitude"), "30.1575");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  await waitFor(() => expect(signUp).toHaveBeenCalledTimes(1));
  expect(router.push).toHaveBeenLastCalledWith("/verify-email");
  expect(signupDraft.read("farmer")).toMatchObject({
    farmName: "Green Valley Farm",
    cropTypes: ["wheat"],
    province: "Punjab",
    lat: "30.1575",
    cnic: "35202-1234567-1",
  });
});
