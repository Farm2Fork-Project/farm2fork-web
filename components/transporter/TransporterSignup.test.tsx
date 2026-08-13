import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import TransporterSignup1Screen from "./TransporterSignup1Screen";
import TransporterSignup2Screen from "./TransporterSignup2Screen";

test("TransporterSignup1Screen returns backend personal registration fields", async () => {
  const user = userEvent.setup();
  const onNext = vi.fn();
  render(
    <LanguageProvider>
      <TransporterSignup1Screen onBack={vi.fn()} onNext={onNext} />
    </LanguageProvider>,
  );

  await user.type(screen.getByLabelText("Email"), "driver@example.com");
  await user.type(screen.getByLabelText("Phone (optional)"), "+923001234567");
  await user.type(screen.getByLabelText("CNIC"), "35202-1234567-1");
  await user.type(screen.getByLabelText("Password"), "StrongP@ss1");
  await user.click(screen.getByRole("button", { name: /next step/i }));

  expect(onNext).toHaveBeenCalledWith({
    email: "driver@example.com",
    password: "StrongP@ss1",
    phone: "+923001234567",
    cnic: "35202-1234567-1",
  });
});

test("TransporterSignup1Screen reuses a Google identity without a password", async () => {
  cleanup();
  const user = userEvent.setup();
  const onNext = vi.fn();
  render(
    <LanguageProvider>
      <TransporterSignup1Screen
        identityEmail="driver@example.com"
        onBack={vi.fn()}
        onNext={onNext}
      />
    </LanguageProvider>,
  );

  expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  await user.type(screen.getByLabelText("CNIC"), "35202-1234567-1");
  await user.click(screen.getByRole("button", { name: /next step/i }));
  expect(onNext).toHaveBeenCalledWith({
    email: "driver@example.com",
    password: "",
    cnic: "35202-1234567-1",
  });
});

test("TransporterSignup2Screen returns distinct vehicle and licence fields", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(
    <LanguageProvider>
      <TransporterSignup2Screen onBack={vi.fn()} onSubmit={onSubmit} />
    </LanguageProvider>,
  );

  await user.selectOptions(screen.getByLabelText("Vehicle type"), "van");
  await user.type(screen.getByLabelText("Vehicle number"), "LEB-1234");
  await user.type(screen.getByLabelText("Driving licence number"), "DL-998877");
  await user.type(screen.getByLabelText("Service areas"), "Lahore, Kasur");
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    vehicleType: "van",
    vehicleNumber: "LEB-1234",
    licenseNumber: "DL-998877",
    serviceAreas: ["Lahore", "Kasur"],
  });
});
