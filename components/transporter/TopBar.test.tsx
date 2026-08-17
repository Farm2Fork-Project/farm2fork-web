import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import TopBar from "./TopBar";

test("TopBar does not expose a seeded transporter orders screen", () => {
  render(
    <LanguageProvider>
      <TopBar activeTab="shipments" setActiveTab={vi.fn()} />
    </LanguageProvider>,
  );

  expect(screen.getByText("My Shipments")).toBeVisible();
  expect(screen.queryByText("Orders")).not.toBeInTheDocument();
});
