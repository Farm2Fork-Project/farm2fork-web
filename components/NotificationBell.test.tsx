import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import NotificationBell from "./NotificationBell";
import type { NotificationRepository } from "@/lib/notifications/notification-repository.ts";

afterEach(cleanup);

test("shows the real unread count and inbox, and marks everything read", async () => {
  const repository = {
    unreadCount: vi.fn().mockResolvedValueOnce(2).mockResolvedValue(0),
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
  await waitFor(() => expect(screen.queryByText("2")).toBeNull());
});

test("failed read writes preserve unread state and the modal restores focus on close", async () => {
  const repository = {
    unreadCount: vi.fn().mockResolvedValue(1),
    list: vi.fn().mockResolvedValue([
      {
        id: "failure",
        type: "admin_action",
        title: "Account update",
        message: "A long update",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]),
    markAllRead: vi.fn().mockRejectedValue(new Error("offline")),
    markRead: vi.fn().mockRejectedValue(new Error("offline")),
  } as unknown as NotificationRepository;
  render(
    <LanguageProvider>
      <NotificationBell repository={repository} />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  const bell = screen.getByRole("button", { name: "Notifications" });
  await user.click(bell);
  await screen.findByText("Account update");
  await user.click(screen.getByRole("button", { name: "Mark all as read" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Please try again",
  );
  expect(screen.getByText("Unread")).toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Mark as read" }),
  );
  await waitFor(() =>
    expect(repository.markRead).toHaveBeenCalledWith("failure"),
  );
  expect(screen.getByText("Unread")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Close notifications" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(bell).toHaveFocus();
});

test("load failure can retry without showing a false empty state", async () => {
  const repository = {
    unreadCount: vi.fn().mockResolvedValue(0),
    list: vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([]),
  } as unknown as NotificationRepository;
  render(
    <LanguageProvider>
      <NotificationBell repository={repository} />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Notifications" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Couldn't load notifications",
  );
  expect(screen.queryByText("No notifications yet.")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("No notifications yet.")).toBeInTheDocument();
});

test("a read confirmed after closing the modal still updates the bell", async () => {
  let finish!: () => void;
  const repository = {
    unreadCount: vi.fn().mockResolvedValueOnce(1).mockResolvedValue(0),
    list: vi
      .fn()
      .mockResolvedValue([
        {
          id: "n",
          title: "Update",
          message: "Details",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]),
    markAllRead: vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    ),
  } as unknown as NotificationRepository;
  render(
    <LanguageProvider>
      <NotificationBell repository={repository} />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Notifications" }));
  await screen.findByText("Update");
  await user.click(screen.getByRole("button", { name: "Mark all as read" }));
  await user.click(screen.getByRole("button", { name: "Close notifications" }));
  await act(async () => finish());
  await waitFor(() => expect(screen.queryByText("1")).not.toBeInTheDocument());
});
