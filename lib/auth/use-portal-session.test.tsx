import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ApiError } from "../api/contracts.ts";
import { resetNavigation, router } from "@/test/next-navigation.ts";
import { usePortalSession } from "./use-portal-session.ts";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation.ts")).navigationModule);
const request = vi.hoisted(() => vi.fn());
vi.mock("../api/client.ts", () => ({ ApiClient: class { request = request; } }));

afterEach(cleanup);
beforeEach(() => {
  resetNavigation("/farmer");
  request.mockReset();
});

test("a signed-out visitor to a portal is sent to /login and brought back afterwards", async () => {
  request.mockRejectedValue(new ApiError(401, "Your session has expired."));
  renderHook(() => usePortalSession("farmer"));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login?next=%2Ffarmer"));
});

test("a different role is sent to its own portal instead of a dead end", async () => {
  request.mockResolvedValue({ id: "u1", email: "b@example.com", role: "buyer", isVerified: true, isActive: true });
  renderHook(() => usePortalSession("farmer"));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
});

test("the right role gets its session", async () => {
  const user = { id: "u1", email: "f@example.com", role: "farmer", isVerified: true, isActive: true };
  request.mockResolvedValue(user);
  const { result } = renderHook(() => usePortalSession("farmer"));
  await waitFor(() => expect(result.current).toEqual({ status: "ready", user }));
  expect(router.replace).not.toHaveBeenCalled();
});

test("the account pages accept any signed-in role", async () => {
  const user = { id: "a1", email: "a@example.com", role: "admin", isVerified: true, isActive: true };
  request.mockResolvedValue(user);
  const { result } = renderHook(() => usePortalSession(null));
  await waitFor(() => expect(result.current.status).toBe("ready"));
});

test("a network failure is a retryable error, not a redirect", async () => {
  request.mockRejectedValueOnce(new ApiError(0, "Network request failed."));
  const { result } = renderHook(() => usePortalSession("farmer"));
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(router.replace).not.toHaveBeenCalled();
  request.mockResolvedValue({ id: "u1", email: "f@example.com", role: "farmer", isVerified: true, isActive: true });
  if (result.current.status === "error") result.current.retry();
  await waitFor(() => expect(result.current.status).toBe("ready"));
});
