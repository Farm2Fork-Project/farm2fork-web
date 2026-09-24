import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import NotificationBell from "./NotificationBell";
import type { NotificationRepository } from "@/lib/notifications/notification-repository.ts";

afterEach(cleanup);

test("shows the real unread count and inbox, and marks everything read", async () => {
  const repository = {
    unreadCount: vi.fn().mockResolvedValue(2),
    list: vi.fn().mockResolvedValue([
      {
        id: "n1",
        type: "payment_confirmed",
        title: "Payment confirmed",
        message: "We received Rs 2,725 for order #A1B2C3.",
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      },
    ]),
    markAllRead: vi.fn().mockResolvedValue(undefined),
    markRead: vi.fn().mockResolvedValue(undefined),
  } as unknown as NotificationRepository;

  render(
    <LanguageProvider>
      <NotificationBell repository={repository} />
    </LanguageProvider>,
  );
  expect(await screen.findByText("2")).toBeTruthy();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Notifications" }));
  expect(await screen.findByText("Payment confirmed")).toBeTruthy();
  expect(screen.getByText("5 minutes ago")).toBeTruthy();

  await user.click(screen.getByRole("button", { name: /mark all/i }));
  expect(repository.markAllRead).toHaveBeenCalled();
  expect(screen.queryByText("2")).toBeNull();
});
