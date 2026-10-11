import { expect, test } from "vitest";
import { wrongRoleMessage } from "./wrong-role.ts";

test("names the portal that matches the account's real role", () => {
  expect(wrongRoleMessage("buyer", "transporter")).toBe(
    "This is a transporter account. Sign in at /transporter instead.",
  );
  expect(wrongRoleMessage("farmer", "buyer")).toBe(
    "This is a buyer account. Sign in on the home page instead.",
  );
  expect(wrongRoleMessage("buyer", "financial_partner")).toBe(
    "This is a financial partner account. Sign in at /financial instead.",
  );
});

test("falls back to the generic message for an unknown or missing role", () => {
  expect(wrongRoleMessage("farmer")).toBe("This account cannot access the farmer application.");
  expect(wrongRoleMessage("farmer", "mystery")).toBe(
    "This account cannot access the farmer application.",
  );
});
