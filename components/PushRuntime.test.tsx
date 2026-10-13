import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { webSession } from "@/lib/auth/web-session";
import PushRuntime from "./PushRuntime";

const mocks = vi.hoisted(() => ({ callbacks: [] as Array<(message: { notification: { title: string; body: string } }) => void> }));
vi.mock("firebase/app", () => ({ getApp: () => ({}), getApps: () => [{}], initializeApp: () => ({}) }));
vi.mock("firebase/messaging", () => ({
  isSupported: async () => true,
  getMessaging: () => ({}),
  onMessage: (_messaging: unknown, callback: (message: { notification: { title: string; body: string } }) => void) => { mocks.callbacks.push(callback); return () => undefined; },
}));
vi.mock("@/lib/notifications/firebase-push", () => ({ createBrowserPushSession: () => ({ enable: async () => true }), pushOptInKey: () => null }));
afterEach(() => { cleanup(); webSession.clear(); mocks.callbacks.length = 0; });

test("foreground notifications from the previous session disappear and cannot reappear after an account switch", async () => {
  const user = { id: "buyer-a", email: "a@example.test", role: "buyer" as const, isActive: true, isVerified: true };
  webSession.save({ user });
  render(<PushRuntime />);
  await waitFor(() => expect(mocks.callbacks).toHaveLength(1));
  act(() => mocks.callbacks[0]({ notification: { title: "A's order", body: "Delivered" } }));
  expect(screen.getByRole("status")).toHaveTextContent("A's order");
  act(() => webSession.save({ user: { ...user, id: "buyer-b" } }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  act(() => mocks.callbacks[0]({ notification: { title: "A's late order", body: "Delivered" } }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
