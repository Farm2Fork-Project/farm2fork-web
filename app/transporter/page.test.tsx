import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import TransporterPage from "./page";

test("transporters are sent to the mobile app", () => {
  render(<TransporterPage />);
  expect(screen.getByRole("heading", { name: "Transporters use the Farm2Fork app" })).toBeTruthy();
  expect(screen.getByRole("link", { name: /Trace a product/ })).toHaveProperty("href", expect.stringContaining("/trace"));
});
