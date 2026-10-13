import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import FarmerListings, { type Listing } from "./FarmerListings";

afterEach(cleanup);

const listings: Listing[] = [
  { id: "p1", name: "Tomatoes", category: "Vegetables", grade: "A", description: "Vine ripened.", price: 120, unit: "kg", quantity: 80, status: "Available", ledger: "confirmed" },
  { id: "p2", name: "Wheat", category: "Grains", grade: "B", description: "", price: 95, unit: "kg", quantity: 400, status: "Out of Stock", ledger: "missing" },
];

function setup() {
  const onDelete = vi.fn();
  render(
    <LanguageProvider>
      <FarmerListings listings={listings} onDelete={onDelete} onToggleStatus={vi.fn()} onAddClick={vi.fn()} />
    </LanguageProvider>,
  );
  return { onDelete };
}

test("deleting a listing is an inline two-step confirm on the card, not a modal", async () => {
  const { onDelete } = setup();
  const user = userEvent.setup();

  await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.querySelector(".modal-overlay")).toBeNull();
  const confirm = screen.getByRole("group", { name: "Delete Listing?" });
  expect(onDelete).not.toHaveBeenCalled();
  expect(within(confirm).getByRole("button", { name: "Cancel" })).toHaveFocus();

  await user.click(within(confirm).getByRole("button", { name: "Delete" }));
  expect(onDelete).toHaveBeenCalledWith("p1");
});

test("Escape cancels the delete and returns focus to the trash button", async () => {
  const { onDelete } = setup();
  const user = userEvent.setup();
  await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("group", { name: "Delete Listing?" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Delete" })[0]).toHaveFocus();
  expect(onDelete).not.toHaveBeenCalled();
});

test("a listing's details open in place and close with Escape, returning focus to the card", async () => {
  setup();
  const user = userEvent.setup();

  const open = screen.getByRole("button", { name: "Tomatoes" });
  await user.click(open);

  const detail = screen.getByRole("region", { name: "Tomatoes" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(within(detail).getByText("Vine ripened.")).toBeInTheDocument();
  expect(within(detail).getByText("Rs. 120 / kg")).toBeInTheDocument();
  expect(detail).toHaveFocus();

  fireEvent.keyDown(detail, { key: "Escape" });
  expect(screen.queryByRole("region", { name: "Tomatoes" })).not.toBeInTheDocument();
  expect(open).toHaveFocus();
});

test("a listing with no description says so", async () => {
  setup();
  await userEvent.setup().click(screen.getByRole("button", { name: "Wheat" }));
  expect(within(screen.getByRole("region", { name: "Wheat" })).getByText("No description provided.")).toBeInTheDocument();
});

test("a listing card shows its first photo, and falls back to the leaf without one", () => {
  render(
    <LanguageProvider>
      <FarmerListings
        listings={[{ ...listings[0], images: ["https://cdn.test/tomatoes.jpg"] }, listings[1]]}
        onDelete={vi.fn()}
        onToggleStatus={vi.fn()}
        onAddClick={vi.fn()}
      />
    </LanguageProvider>,
  );
  const photos = document.querySelectorAll(".mp-card-photo");
  expect(photos).toHaveLength(1);
  expect(photos[0]).toHaveAttribute("src", "https://cdn.test/tomatoes.jpg");
});
