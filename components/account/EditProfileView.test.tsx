import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { ApiError, type ApiProfile } from "@/lib/api/contracts.ts";
import { resetNavigation, router } from "@/test/next-navigation.ts";
import { EditForm } from "./EditProfileView";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);

const buyer: ApiProfile = {
  user: { id: "b1", email: "ayesha@example.com", role: "buyer", phone: "+923001234567", fullName: "Ayesha Khan", isVerified: true, isActive: true },
  displayName: "Ayesha Khan",
  profile: { kind: "buyer", cnicMasked: "*********5671", businessName: "Khan Traders", businessType: "retailer" },
};
const farmer: ApiProfile = {
  user: { id: "f1", email: "t@example.com", role: "farmer", phone: "+923211234567", fullName: "Tariq Mehmood", isVerified: true, isActive: true },
  displayName: "Tariq Mehmood",
  profile: {
    kind: "farmer",
    cnicMasked: "*********4561",
    farmName: "Green Valley Farm",
    cropTypes: ["wheat", "Tomatoes"],
    landSizeAcres: 12.5,
    farmLocation: { address: "Chak 5", city: "Multan", province: "Punjab", lat: 30.1575, lng: 71.5249, complete: true },
  },
};

const repo = () => ({
  updateProfile: vi.fn().mockResolvedValue(buyer),
  updateFarmLocation: vi.fn().mockResolvedValue({ complete: true }),
  uploadAvatar: vi.fn(),
  removeAvatar: vi.fn(),
});

beforeEach(() => resetNavigation("/account/edit"));
afterEach(cleanup);

function renderEdit(profile: ApiProfile, repository = repo()) {
  const onProfile = vi.fn();
  render(
    <LanguageProvider>
      <EditForm profile={profile} repository={repository} onProfile={onProfile} />
    </LanguageProvider>,
  );
  return { repository, onProfile };
}

test("starts clean: Save is disabled, email and CNIC are read-only", () => {
  renderEdit(buyer);
  expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  expect(screen.getByText("No changes yet.")).toBeInTheDocument();
  expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
  expect(screen.getByLabelText("CNIC")).toHaveValue("*********5671");
  expect(screen.getByLabelText("CNIC")).toHaveAttribute("readonly");
  expect(screen.getByLabelText("Full name")).toHaveValue("Ayesha Khan");
  expect(screen.getByLabelText("Mobile number")).toHaveValue("+92 300 1234567");
});

test("editing makes it dirty, and Save sends only what changed (phone as E.164)", async () => {
  const user = userEvent.setup();
  const { repository } = renderEdit(buyer);

  await user.clear(screen.getByLabelText("Mobile number"));
  await user.type(screen.getByLabelText("Mobile number"), "0300 7654321");
  expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  await waitFor(() => expect(repository.updateProfile).toHaveBeenCalledWith({ phone: "+923007654321" }));
  expect(repository.updateFarmLocation).not.toHaveBeenCalled();
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/account?saved=1"));
});

test("invalid values are explained inline and nothing is saved", async () => {
  const user = userEvent.setup();
  const { repository } = renderEdit(buyer);

  await user.clear(screen.getByLabelText("Full name"));
  await user.type(screen.getByLabelText("Full name"), "A");
  await user.clear(screen.getByLabelText("Business name"));
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
  expect(screen.getByText("Enter your business name.")).toBeInTheDocument();
  expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
  expect(repository.updateProfile).not.toHaveBeenCalled();
});

test("field errors from the API land on the fields it names", async () => {
  const repository = repo();
  repository.updateProfile.mockRejectedValue(new ApiError(400, "fullName must be longer than or equal to 2 characters"));
  const user = userEvent.setup();
  renderEdit(buyer, repository);

  await user.type(screen.getByLabelText("Full name"), " Jr");
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  expect(await screen.findByText("Farm2Fork didn't accept this value.")).toBeInTheDocument();
  expect(screen.getByLabelText("Full name")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("Mobile number")).not.toHaveAttribute("aria-invalid");
  expect(router.push).not.toHaveBeenCalled();
  // Editing the rejected field clears its error.
  await user.type(screen.getByLabelText("Full name"), "x");
  expect(screen.getByLabelText("Full name")).not.toHaveAttribute("aria-invalid");
});

test("farmers: profile fields and the farm pin are saved by their own endpoints", async () => {
  const repository = repo();
  const user = userEvent.setup();
  renderEdit(farmer, repository);

  await user.clear(screen.getByLabelText("Farm name"));
  await user.type(screen.getByLabelText("Farm name"), "Blue Farm");
  await user.click(screen.getByRole("checkbox", { name: "Rice" }));
  fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "31.5" } });
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  await waitFor(() =>
    expect(repository.updateProfile).toHaveBeenCalledWith({ farmName: "Blue Farm", cropTypes: ["wheat", "Tomatoes", "rice"] }),
  );
  expect(repository.updateFarmLocation).toHaveBeenCalledWith({ address: "Chak 5", city: "Multan", province: "Punjab", lat: 31.5, lng: 71.5249 });
  // A crop the farmer already had that is not one of the standard choices stays selectable.
  expect(screen.getByRole("checkbox", { name: "Tomatoes" })).toBeChecked();
});

test("Discard is a two-step inline confirm, and leaving through a link while dirty asks first", async () => {
  const user = userEvent.setup();
  renderEdit(buyer);
  await user.type(screen.getByLabelText("Full name"), "x");

  await user.click(screen.getByRole("button", { name: "Discard" }));
  expect(screen.getByRole("group", { name: "Discard your changes?" })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("group", { name: "Discard your changes?" })).not.toBeInTheDocument();

  const back = document.createElement("a");
  back.href = "/farmer";
  document.body.append(back);
  fireEvent.click(back);
  expect(await screen.findByText("You have unsaved changes. Leave without saving?")).toBeInTheDocument();
  expect(router.push).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
  fireEvent.click(back);
  await user.click(await screen.findByRole("button", { name: "Leave" }));
  expect(router.push).toHaveBeenCalledWith("/farmer");
  back.remove();
});
