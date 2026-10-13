import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  token: vi.fn(),
  deleteToken: vi.fn(),
  supported: vi.fn(),
  request: vi.fn(),
}));
vi.mock("firebase/app", () => ({ getApps: () => [{}], getApp: () => ({}), initializeApp: () => ({}) }));
vi.mock("firebase/messaging", () => ({ getMessaging: () => ({}), getToken: sdk.token, deleteToken: sdk.deleteToken, isSupported: sdk.supported }));
vi.mock("../firebase/client", () => ({ getFirebaseClientConfig: () => ({}) }));
vi.mock("../api/client", () => ({ ApiClient: class { request = sdk.request; } }));

let push: typeof import("./firebase-push");
let session: typeof import("../auth/web-session")["webSession"];
const user = { id: "buyer-a", email: "a@example.test", role: "buyer" as const, isActive: true, isVerified: true };

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  sdk.supported.mockResolvedValue(true);
  sdk.token.mockResolvedValue("device-token");
  sdk.deleteToken.mockResolvedValue(true);
  sdk.request.mockResolvedValue(undefined);
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_VAPID_KEY", "test-vapid");
  vi.stubGlobal("Notification", { permission: "granted", requestPermission: vi.fn() });
  vi.stubGlobal("navigator", { serviceWorker: { register: async () => ({ active: {} }) } });
  localStorage.clear();
  session = (await import("../auth/web-session")).webSession;
  session.save({ user });
  push = await import("./firebase-push");
});
afterEach(() => { session.clear(); localStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

test("logout drains the first opt-in before its preference exists, revokes its SDK token, and blocks cookie-logout-window resumes", async () => {
  let finishToken!: (token: string) => void;
  sdk.token.mockImplementationOnce(() => new Promise<string>((resolve) => { finishToken = resolve; }));
  const enabling = push.createBrowserPushSession().enable();
  await waitFor(() => expect(sdk.token).toHaveBeenCalledOnce());
  expect(localStorage.getItem("push.enabled.buyer-a")).toBeNull();
  const loggingOut = push.clearBrowserPushOnLogout();
  expect(await push.createBrowserPushSession().enable()).toBe(false);
  finishToken("first-device-token");
  expect(await enabling).toBe(false);
  await loggingOut;
  expect(sdk.request.mock.calls.map((call) => call[1].method)).toEqual(["DELETE"]);
  expect(sdk.deleteToken).toHaveBeenCalledOnce();
  expect(await push.createBrowserPushSession().enable()).toBe(false);
  session.clear(); // The cookie logout path releases the barrier only now.
  session.save({ user: { ...user, id: "buyer-b" } });
  expect(await push.createBrowserPushSession().enable()).toBe(true);
});

test("logout waits for an already-started PUT before deleting a first registration with no saved preference", async () => {
  let finishPut!: () => void;
  sdk.request.mockImplementationOnce(() => new Promise<void>((resolve) => { finishPut = resolve; }));
  const enabling = push.createBrowserPushSession().enable();
  await waitFor(() => expect(sdk.request).toHaveBeenCalledWith("/notifications/device-token", expect.objectContaining({ method: "PUT" })));
  const loggingOut = push.clearBrowserPushOnLogout();
  expect(sdk.request).toHaveBeenCalledOnce();
  finishPut();
  expect(await enabling).toBe(false);
  await loggingOut;
  expect(sdk.request.mock.calls.map((call) => call[1].method)).toEqual(["PUT", "DELETE"]);
  expect(sdk.deleteToken).toHaveBeenCalledOnce();
});

test("new enables cannot reattach during delayed DELETE and wrappers created during cleanup remain stale", async () => {
  localStorage.setItem("push.enabled.buyer-a", "true");
  let finishDelete!: () => void;
  sdk.request.mockImplementationOnce(() => new Promise<void>((resolve) => { finishDelete = resolve; }));
  const disabling = push.createBrowserPushSession().disable();
  await waitFor(() => expect(sdk.request).toHaveBeenCalledOnce());
  const duringCleanup = push.createBrowserPushSession();
  expect(await duringCleanup.enable()).toBe(false);
  expect(sdk.token).not.toHaveBeenCalled();
  finishDelete();
  await disabling;
  expect(localStorage.getItem("push.enabled.buyer-a")).toBeNull();
  expect(await duringCleanup.enable()).toBe(false);
  expect(sdk.token).not.toHaveBeenCalled();
  // A deliberate new opt-in after revocation is complete can succeed.
  expect(await push.createBrowserPushSession().enable()).toBe(true);
  expect(sdk.request.mock.calls.map((call) => call[1].method)).toEqual(["DELETE", "PUT"]);
});

test("ordinary logout without any push token works on unsupported browsers without initializing the SDK", async () => {
  sdk.supported.mockResolvedValue(false);
  await push.clearBrowserPushOnLogout();
  expect(sdk.supported).not.toHaveBeenCalled();
  expect(sdk.token).not.toHaveBeenCalled();
  expect(sdk.deleteToken).not.toHaveBeenCalled();
  expect(sdk.request).not.toHaveBeenCalled();
});

test("failed DELETE keeps the opted-in preference and logout barrier until cleanup is retried", async () => {
  localStorage.setItem("push.enabled.buyer-a", "true");
  sdk.request.mockRejectedValueOnce(new Error("offline"));
  await expect(push.clearBrowserPushOnLogout()).rejects.toThrow("offline");
  expect(localStorage.getItem("push.enabled.buyer-a")).toBe("true");
  expect(sdk.deleteToken).not.toHaveBeenCalled();
  expect(await push.createBrowserPushSession().enable()).toBe(false);
  await push.clearBrowserPushOnLogout();
  expect(localStorage.getItem("push.enabled.buyer-a")).toBeNull();
  expect(sdk.deleteToken).toHaveBeenCalledOnce();
});
