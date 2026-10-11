import { expect, test } from "vitest";
import { PushSession } from "./push-session";

test("denied permission never registers a token; successful enable and disable bind and clear it", async () => {
  const calls: string[] = [];
  let allowed = false;
  const session = new PushSession(
    {
      permission: async () => allowed,
      token: async () => "device-token",
      deleteToken: async () => {
        calls.push("delete-sdk");
      },
    },
    {
      request: async <T>(
        path: string,
        options?: { method?: string; body?: unknown },
      ) => {
        calls.push(
          `${options?.method} ${path} ${JSON.stringify(options?.body)}`,
        );
        return undefined as T;
      },
    },
  );
  expect(await session.enable()).toBe(false);
  expect(calls).toEqual([]);
  allowed = true;
  expect(await session.enable()).toBe(true);
  await session.disable();
  expect(calls).toEqual([
    'PUT /notifications/device-token {"token":"device-token"}',
    "DELETE /notifications/device-token undefined",
    "delete-sdk",
  ]);
});

test("registration failure remains retryable and does not report enabled", async () => {
  let failed = true;
  const session = new PushSession(
    {
      permission: async () => true,
      token: async () => "t",
      deleteToken: async () => undefined,
    },
    {
      request: async <T>() => {
        if (failed) throw Error("offline");
        return undefined as T;
      },
    },
  );
  await expect(session.enable()).rejects.toThrow("offline");
  failed = false;
  expect(await session.enable()).toBe(true);
});

test("failed server cleanup preserves the SDK token so disable can be retried", async () => {
  let removed = false;
  const session = new PushSession(
    {
      permission: async () => true,
      token: async () => "t",
      deleteToken: async () => {
        removed = true;
      },
    },
    {
      request: async () => {
        throw Error("offline");
      },
    },
  );
  await expect(session.disable()).rejects.toThrow("offline");
  expect(removed).toBe(false);
});
