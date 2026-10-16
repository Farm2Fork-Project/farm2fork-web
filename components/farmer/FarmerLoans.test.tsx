import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import FarmerLoans from "./FarmerLoans";
import type { LoanRepository } from "@/lib/loans/loan-repository";
afterEach(cleanup);
const loan = {
  id: "loan-1",
  applicantId: "farmer-1",
  amount: 5000,
  purpose: "Seeds",
  durationMonths: 6,
  status: "pending",
  documentCount: 0,
  repaymentSchedule: [],
  createdAt: "2026-10-14",
  updatedAt: "2026-10-14",
};
const limits = {
  minAmount: 1000,
  maxAmount: 100000,
  maxDurationMonths: 36,
  maxDocuments: 4,
};
test("farmer funding keeps failed application input and prevents a second open application", async () => {
  const apply = vi
    .fn()
    .mockRejectedValueOnce(new Error("Connection lost"))
    .mockResolvedValueOnce(loan);
  const repository = {
    listAll: vi.fn().mockResolvedValue([]),
    limits: vi.fn().mockResolvedValue(limits),
    apply,
  } as unknown as LoanRepository;
  const dirty = vi.fn();
  const busy = vi.fn();
  render(
    <LanguageProvider>
      <FarmerLoans repository={repository} onDirtyChange={dirty} onBusyChange={busy} />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole("button", { name: "Apply for funding" }),
  );
  await user.type(screen.getByLabelText("Amount (PKR)"), "5000");
  await user.type(screen.getByLabelText("Purpose"), "Seeds");
  expect(dirty).toHaveBeenLastCalledWith(true);
  await user.click(screen.getByRole("button", { name: "Submit application" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Connection lost");
  expect(screen.getByLabelText("Purpose")).toHaveValue("Seeds");
  await user.click(screen.getByRole("button", { name: "Submit application" }));
  expect(await screen.findByText("Pending")).toBeVisible();
  expect(dirty).toHaveBeenLastCalledWith(false);
  expect(busy).toHaveBeenCalledWith(true);
  expect(busy).toHaveBeenLastCalledWith(false);
  expect(
    screen.getByRole("button", { name: "Apply for funding" }),
  ).toBeDisabled();
  expect(apply).toHaveBeenLastCalledWith({
    amount: 5000,
    purpose: "Seeds",
    durationMonths: 6,
    documents: [],
  });
});
