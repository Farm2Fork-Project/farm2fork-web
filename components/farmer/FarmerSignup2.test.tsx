import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import FarmerSignup from "./FarmerSignup2";

afterEach(cleanup);

test("FarmerSignup submits the backend farmer registration fields", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(
    <LanguageProvider>
      <FarmerSignup onBack={vi.fn()} onSubmit={onSubmit} />
    </LanguageProvider>,
  );

  await user.type(screen.getByLabelText("Email"), "farmer@example.com");
  await user.type(screen.getByLabelText("Phone (optional)"), "+923001234567");
  await user.type(screen.getByLabelText("CNIC"), "35202-1234567-1");
  await user.type(screen.getByLabelText("Password"), "StrongP@ss1");
  await user.type(screen.getByLabelText("Confirm password"), "StrongP@ss1");
  await user.click(screen.getByRole("button", { name: /next step/i }));

  await user.type(screen.getByLabelText("Farm name"), "Green Acres");
  await user.type(screen.getByLabelText("Street / village"), "Chak 5, Canal Road");
  await user.type(screen.getByLabelText("City"), "Lahore");
  await user.selectOptions(screen.getByLabelText("Province"), "Punjab");
  await user.click(screen.getByRole("button", { name: "wheat" }));
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: "farmer@example.com",
    password: "StrongP@ss1",
    phone: "+923001234567",
    cnic: "35202-1234567-1",
    farmName: "Green Acres",
    farmLocation: { address: "Chak 5, Canal Road", city: "Lahore", province: "Punjab" },
    cropTypes: ["wheat"],
  });
});

test("FarmerSignup will not submit without a complete pickup location", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <LanguageProvider>
      <FarmerSignup onBack={vi.fn()} onSubmit={onSubmit} identityEmail="farmer@example.com" />
    </LanguageProvider>,
  );

  await user.type(screen.getByLabelText("CNIC"), "35202-1234567-1");
  await user.click(screen.getByRole("button", { name: /next step/i }));
  await user.type(screen.getByLabelText("Farm name"), "Green Acres");
  await user.type(screen.getByLabelText("City"), "Lahore");
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByText(/street, city and province/i)).toBeTruthy();
});
