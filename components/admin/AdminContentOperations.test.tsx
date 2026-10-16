import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ProductsScreen, LoansScreen, OrdersScreen } from "./AdminContentOperations";
import type { AdminContentRepository } from "@/lib/admin/admin-content-repository";
import type { LoanRepository } from "@/lib/loans/loan-repository";
afterEach(cleanup);
const product = {
  id: "p1",
  name: "Real tomatoes",
  category: "Vegetables",
  status: "active",
  adminHidden: false,
  price: 120,
  quantity: 50,
  unit: "kg",
  farmerId: { _id: "farmer1", fullName: "Ayesha" },
};
test("product read failures stay recoverable and moderation failures preserve the reason", async () => {
  const repo = {
    products: vi
      .fn()
      .mockRejectedValueOnce(new Error("Connection lost"))
      .mockResolvedValue({ items: [product], total: 1, page: 1, limit: 20 }),
    product: vi.fn().mockResolvedValue(product),
    visibility: vi
      .fn()
      .mockRejectedValue(new Error("Content changed. Refresh.")),
  };
  render(
    <ProductsScreen repository={repo as unknown as AdminContentRepository} />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Connection lost");
  await userEvent.click(screen.getByRole("button", { name: "Retry" }));
  await userEvent.click(
    await screen.findByRole("button", { name: "Inspect Real tomatoes" }),
  );
  await userEvent.type(
    await screen.findByLabelText("Reason for visibility change"),
    "Incorrect product information",
  );
  await userEvent.click(screen.getByRole("button", { name: "Hide product" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Content changed");
  expect(screen.getByLabelText("Reason for visibility change")).toHaveValue(
    "Incorrect product information",
  );
  expect(repo.visibility).toHaveBeenCalledWith(
    "products",
    "p1",
    true,
    "Incorrect product information",
  );
});
test("loan decision refreshes signed documents and the persisted repayment schedule", async () => {
  const loan = {
    id: "loan1",
    applicantId: "farmer1",
    amount: 10000,
    purpose: "Seeds",
    durationMonths: 2,
    status: "under_review",
    documentCount: 1,
    repaymentSchedule: [],
    applicant: { farmName: "Real farm", cropTypes: [] },
    documents: [{ index: 0, url: "https://example.org/private.pdf" }],
  };
  const approved = {
    ...loan,
    status: "approved",
    repaymentSchedule: [
      { index: 0, dueDate: "2026-11-15", amount: 5000, isPaid: false },
    ],
  };
  const repo = {
    list: vi
      .fn()
      .mockResolvedValue({ data: [loan], total: 1, page: 1, limit: 50 }),
    get: vi.fn().mockResolvedValueOnce(loan).mockResolvedValue(approved),
    decide: vi.fn().mockResolvedValue(approved),
  };
  render(<LoansScreen repository={repo as unknown as LoanRepository} />);
  await userEvent.click(
    await screen.findByRole("button", { name: "Inspect Real farm" }),
  );
  expect(
    await screen.findByRole("link", { name: "Document 1" }),
  ).toHaveAttribute("href", "https://example.org/private.pdf");
  await userEvent.type(
    screen.getByLabelText("Reason for loan decision"),
    "Verified farm and application",
  );
  await userEvent.click(screen.getByRole("button", { name: "Approve loan" }));
  expect(
    await screen.findByRole("button", { name: "Record instalment 1 paid" }),
  ).toBeInTheDocument();
  expect(repo.decide).toHaveBeenCalledWith(
    "loan1",
    "approved",
    "Verified farm and application",
  );
});
test('product pagination stays on the server and ignores a stale search response', async () => {
 let finishOld: ((page: unknown) => void) | undefined;
 const repo = { products: vi.fn().mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; })).mockResolvedValue({ items: [product], total: 41, page: 1, limit: 20 }) };
 render(<ProductsScreen repository={repo as unknown as AdminContentRepository} />);
 await userEvent.type(screen.getByLabelText('Search'), 'tomatoes');
 await userEvent.click(screen.getByRole('button', { name: 'Search' }));
 expect(await screen.findByText('Real tomatoes')).toBeInTheDocument();
 finishOld?.({ items: [{ ...product, name: 'Outdated result' }], total: 1, page: 1, limit: 20 });
 await userEvent.click(screen.getByRole('button', { name: 'Next' }));
 expect(repo.products).toHaveBeenLastCalledWith({ page: 2, search: 'tomatoes' });
 expect(screen.queryByText('Outdated result')).not.toBeInTheDocument();
});
test('external refunds require actual-transfer confirmation and retry with the same request identity', async () => {
 const order = { id: 'order1', status: 'cancelled', items: [], totalAmount: 1000, platformFeePercent: 5, platformFeeAmount: 50, deliveryFee: 50, grandTotal: 1100, createdAt: '2026-10-15', paymentId: { _id: 'payment1', status: 'success', amount: 1100, gateway: 'safepay' } };
 const evidence = { id: 'refund1', orderId: 'order1', amount: 1100, reference: 'BANK-123', paidAt: '2026-10-15T01:00:00Z', recordedBy: 'admin1', createdAt: '2026-10-15T02:00:00Z' };
 const repo = { orders: vi.fn().mockResolvedValue({ items: [order], page: 1, limit: 20, total: 1 }), order: vi.fn().mockResolvedValue(order), refund: vi.fn().mockResolvedValue(null), recordRefund: vi.fn().mockRejectedValueOnce(new Error('Response lost')).mockImplementation(async () => { repo.refund.mockResolvedValue(evidence); return evidence; }) };
 render(<OrdersScreen repository={repo as unknown as AdminContentRepository} />);
 await userEvent.click(await screen.findByRole('button', { name: 'Inspect order order1' }));
 const reference = await screen.findByLabelText('External refund reference');
 expect(screen.getByRole('button', { name: 'Record external refund' })).toBeDisabled();
 await userEvent.type(reference, 'BANK-123');
 await userEvent.type(screen.getByLabelText('Actual refund date'), '2026-10-15T06:00');
 await userEvent.type(screen.getByLabelText('Refund reason'), 'Actual bank transfer returned');
 await userEvent.click(screen.getByRole('checkbox'));
 await userEvent.click(screen.getByRole('button', { name: 'Record external refund' }));
 expect(await screen.findByRole('alert')).toHaveTextContent('Response lost');
 expect(reference).toHaveValue('BANK-123');
 const firstRequest = repo.recordRefund.mock.calls[0][1];
 await userEvent.click(screen.getByRole('button', { name: 'Record external refund' }));
 expect(await screen.findByRole('region', { name: 'External refund evidence' })).toHaveTextContent('BANK-123');
 expect(repo.recordRefund.mock.calls[1][1]).toEqual(firstRequest);
 expect(firstRequest).toMatchObject({ amount: 1100, reference: 'BANK-123', reason: 'Actual bank transfer returned' });
});
