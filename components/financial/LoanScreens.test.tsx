import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import type { LoanApplication, LoanRepository } from "@/lib/loans/loan-repository.ts";
import DashboardScreen from "./DashboardScreen";
import LoanDetailScreen from "./LoanDetailScreen";

afterEach(cleanup);

const base: LoanApplication = {
  id: "l1",
  applicantId: "f1",
  amount: 120000,
  purpose: "Seeds and fertiliser",
  durationMonths: 6,
  status: "pending",
  documentCount: 1,
  repaymentSchedule: [],
  applicant: {
    farmName: "Green Valley Farm",
    city: "Multan",
    province: "Punjab",
    cropTypes: ["mango"],
    deliveredOrders: 3,
    deliveredRevenue: 45000,
  },
  createdAt: "2026-09-20T10:00:00.000Z",
  updatedAt: "2026-09-20T10:00:00.000Z",
};

const notifications = {
  unreadCount: vi.fn().mockResolvedValue(0),
};

function repo(overrides: Partial<Record<keyof LoanRepository, unknown>>) {
  return overrides as unknown as LoanRepository;
}

// The top bar's bell talks to /notifications; keep it quiet in these tests.
vi.mock("@/lib/notifications/notification-repository.ts", () => ({
  NotificationRepository: vi.fn(function () {
    return notifications;
  }),
}));

test("the queue shows only real figures computed from the applications", async () => {
  const list = vi.fn().mockResolvedValue({
    data: [
      base,
      { ...base, id: "l2", amount: 80000, status: "approved", applicant: { ...base.applicant!, farmName: "Ravi Fields" } },
      { ...base, id: "l3", amount: 50000, status: "rejected", applicant: { ...base.applicant!, farmName: "Indus Orchard" } },
    ],
    total: 3,
    page: 1,
    limit: 50,
  });
  const onSelectLoan = vi.fn();
  render(
    <LanguageProvider>
      <DashboardScreen
        repository={repo({ list })}
        onSelectLoan={onSelectLoan}
        onLogout={vi.fn()}
        onNavigateToSettings={vi.fn()}
      />
    </LanguageProvider>,
  );

  expect(await screen.findByText("Rs 250,000")).toBeTruthy(); // total requested
  expect(screen.getByText("Rs 80,000")).toBeTruthy(); // approved amount
  expect(screen.getByText("50%")).toBeTruthy(); // 1 of 2 decided
  expect(screen.queryByText(/credit score|DTI|interest/i)).toBeNull();

  // Default filter: submitted applications only.
  expect(screen.getByText("Green Valley Farm")).toBeTruthy();
  expect(screen.queryByText("Ravi Fields")).toBeNull();

  const user = userEvent.setup();
  await user.click(screen.getByRole("tab", { name: "All" }));
  await user.type(screen.getByLabelText("Search applications"), "indus");
  expect(screen.getByText("Indus Orchard")).toBeTruthy();
  expect(screen.queryByText("Green Valley Farm")).toBeNull();

  await user.click(screen.getByText("Indus Orchard"));
  expect(onSelectLoan).toHaveBeenCalledWith("l3");
});

test("review, reject-with-reason and repayment call the loan API", async () => {
  let current: LoanApplication = { ...base, status: "under_review", documents: [{ index: 0, url: "/api/files/private/a.pdf?exp=1&sig=x" }] };
  const decide = vi.fn(async (_id: string, decision: "approved" | "rejected", note?: string) => {
    current = { ...current, status: decision, reviewNote: note };
    return current;
  });
  const loans = repo({ get: vi.fn(async () => current), decide });
  render(
    <LanguageProvider>
      <LoanDetailScreen loanId="l1" repository={loans} onBack={vi.fn()} onNavigateToSettings={vi.fn()} />
    </LanguageProvider>,
  );

  expect(await screen.findByText("Revenue from delivered orders")).toBeTruthy();
  expect(screen.getByRole("link", { name: /Document 1/ })).toBeTruthy();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Reject…" }));
  const confirm = screen.getByRole("button", { name: "Confirm rejection" });
  expect(confirm).toHaveProperty("disabled", true);
  await user.type(screen.getByLabelText(/Reason/), "No sales history yet");
  await user.click(confirm);

  expect(decide).toHaveBeenCalledWith("l1", "rejected", "No sales history yet");
  expect(await screen.findByText("Reviewer note: No sales history yet")).toBeTruthy();
  expect(within(screen.getAllByText("Rejected")[0].parentElement!).getByText("Rejected")).toBeTruthy();
});
