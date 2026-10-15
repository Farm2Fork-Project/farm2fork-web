import { expect, test, vi } from "vitest";
import { NotificationRepository } from "./notification-repository";

test("reads all notification pages using the API total and limit metadata", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce({
      data: [{ id: "first" }],
      total: 51,
      page: 1,
      limit: 50,
    })
    .mockResolvedValueOnce({
      data: [{ id: "older-unread", isRead: false }],
      total: 51,
      page: 2,
      limit: 50,
    });
  const repo = new NotificationRepository({ client: { request } });
  expect((await repo.list()).map((n) => n.id)).toEqual([
    "first",
    "older-unread",
  ]);
  expect(request).toHaveBeenLastCalledWith("/notifications?limit=50&page=2");
});
