import { expect, test, vi } from "vitest";
import { collectPages } from "./pagination.ts";

test("collectPages includes records after page one and propagates failed pages", async () => {
  const fetch = vi.fn(async (page: number) => ({
    data: [page],
    total: 3,
    page,
    totalPages: 3,
    limit: 1,
  }));
  expect((await collectPages(fetch)).data).toEqual([1, 2, 3]);
  const failing = vi
    .fn()
    .mockResolvedValueOnce({ data: [1], totalPages: 2 })
    .mockRejectedValue(new Error("offline"));
  await expect(collectPages(failing)).rejects.toThrow("offline");
});
