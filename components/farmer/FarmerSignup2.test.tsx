import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import FarmerSignup from "./FarmerSignup2";

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
  await user.type(screen.getByLabelText("Farm location"), "Lahore");
  await user.click(screen.getByRole("button", { name: "wheat" }));
  await user.click(screen.getByRole("button", { name: /create account/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: "farmer@example.com",
    password: "StrongP@ss1",
    phone: "+923001234567",
    cnic: "35202-1234567-1",
    farmName: "Green Acres",
    farmLocation: { address: "Lahore" },
    cropTypes: ["wheat"],
  });
});
