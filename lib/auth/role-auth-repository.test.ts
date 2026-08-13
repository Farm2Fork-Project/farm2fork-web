import { expect, test } from "vitest";
import { ApiError } from "../api/contracts.ts";
import { RoleAuthRepository } from "./role-auth-repository.ts";

test("RoleAuthRepository restores a matching cookie-authenticated role", async () => {
  const saved: unknown[] = [];
  const repository = new RoleAuthRepository({
    client: {
      request: async () => ({
        id: "transporter-1",
        email: "driver@example.com",
        role: "transporter",
        isVerified: true,
        isActive: true,
      }),
    },
    session: {
      clear: () => undefined,
      read: () => null,
      save: (value) => saved.push(value),
    },
  });

  await expect(repository.getCurrentUser("transporter")).resolves.toEqual({
    id: "transporter-1",
    email: "driver@example.com",
    role: "transporter",
    isVerified: true,
    isActive: true,
  });
  expect(saved).toEqual([
    {
      user: {
        id: "transporter-1",
        email: "driver@example.com",
        role: "transporter",
        isVerified: true,
        isActive: true,
      },
    },
  ]);
});

test("RoleAuthRepository rejects a mismatched cookie-authenticated role", async () => {
  const repository = new RoleAuthRepository({
    client: {
      request: async () => ({
        id: "buyer-1",
        email: "buyer@example.com",
        role: "buyer",
        isVerified: true,
        isActive: true,
      }),
    },
  });

  await expect(repository.getCurrentUser("farmer")).rejects.toMatchObject(
    new ApiError(403, "This account cannot access the farmer application."),
  );
});

test("RoleAuthRepository clears UI state when the cookie session is invalid", async () => {
  let cleared = 0;
  const repository = new RoleAuthRepository({
    client: {
      request: async () => {
        throw new ApiError(401, "Your session has expired.");
      },
    },
    session: {
      clear: () => {
        cleared += 1;
      },
      read: () => null,
      save: () => undefined,
    },
  });

  await expect(repository.getCurrentUser("farmer")).rejects.toMatchObject(
    new ApiError(401, "Your session has expired."),
  );
  expect(cleared).toBe(1);
});
