import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import SignUpFormScreen from "./SignUpFormScreen";

test("SignUpFormScreen submits the backend buyer registration fields", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(
    <LanguageProvider>
      <SignUpFormScreen onBack={vi.fn()} onSubmit={onSubmit} />
    </LanguageProvider>,
  );

  await user.type(await screen.findByLabelText("Business name"), "Fresh Mart");
  await user.selectOptions(screen.getByLabelText("Business type"), "retailer");
  await user.type(screen.getByLabelText("CNIC"), "35202-1234567-1");
  await user.type(screen.getByLabelText("Email"), "buyer@example.com");
  await user.type(screen.getByLabelText("Phone (optional)"), "+923001234567");
  await user.type(screen.getByLabelText("Password"), "StrongP@ss1");
  await user.type(screen.getByLabelText("Confirm password"), "StrongP@ss1");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  expect(onSubmit).toHaveBeenCalledWith({
    businessName: "Fresh Mart",
    businessType: "retailer",
    cnic: "35202-1234567-1",
    email: "buyer@example.com",
    password: "StrongP@ss1",
    phone: "+923001234567",
  });
});

test("SignUpFormScreen reuses a Google identity without requesting a password", async () => {
  cleanup();
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <LanguageProvider>
      <SignUpFormScreen
        identityEmail="buyer@example.com"
        onBack={vi.fn()}
        onSubmit={onSubmit}
      />
    </LanguageProvider>,
  );

  expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  await user.type(screen.getByLabelText("Business name"), "Fresh Mart");
  await user.selectOptions(screen.getByLabelText("Business type"), "retailer");
  await user.type(screen.getByLabelText("CNIC"), "35202-1234567-1");
  await user.click(screen.getByRole("button", { name: "Create account" }));

  expect(onSubmit).toHaveBeenCalledWith({
    businessName: "Fresh Mart",
    businessType: "retailer",
    cnic: "35202-1234567-1",
    email: "buyer@example.com",
    password: "",
  });
});
