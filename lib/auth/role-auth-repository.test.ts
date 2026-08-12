import { expect, test } from "vitest";
import { ApiError } from "../api/contracts.ts";
import { RoleAuthRepository } from "./role-auth-repository.ts";

test("RoleAuthRepository registers a transporter with the exact backend DTO", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const saved: unknown[] = [];
  const repository = new RoleAuthRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return {
          accessToken: "transporter-token",
          user: {
            id: "transporter-1",
            email: "driver@example.com",
            role: "transporter",
            isVerified: false,
            isActive: true,
          },
        };
      },
    },
    session: {
      clear: () => undefined,
      read: () => null,
      save: (value) => saved.push(value),
    },
  });

  const session = await repository.registerTransporter({
    email: "driver@example.com",
    password: "StrongP@ss1",
    cnic: "35202-1234567-1",
    vehicleType: "van",
    vehicleNumber: "LEB-1234",
    licenseNumber: "DL-998877",
    serviceAreas: ["Lahore"],
  });

  expect(calls).toEqual([
    {
      path: "/auth/register/transporter",
      options: {
        method: "POST",
        body: {
          email: "driver@example.com",
          password: "StrongP@ss1",
          cnic: "35202-1234567-1",
          vehicleType: "van",
          vehicleNumber: "LEB-1234",
          licenseNumber: "DL-998877",
          serviceAreas: ["Lahore"],
        },
      },
    },
  ]);
  expect(saved).toEqual([session]);
  expect(session.user.role).toBe("transporter");
});

test("RoleAuthRepository rejects a mismatched login role before saving", async () => {
  let saved = 0;
  const repository = new RoleAuthRepository({
    client: {
      request: async () => ({
        accessToken: "buyer-token",
        user: {
          id: "buyer-1",
          email: "buyer@example.com",
          role: "buyer",
          isVerified: true,
          isActive: true,
        },
      }),
    },
    session: {
      clear: () => undefined,
      read: () => null,
      save: () => {
        saved += 1;
      },
    },
  });

  await expect(
    repository.login({ email: "buyer@example.com", password: "StrongP@ss1" }, "farmer"),
  ).rejects.toMatchObject(
    new ApiError(403, "This account cannot access the farmer application."),
  );
  expect(saved).toBe(0);
});

test("RoleAuthRepository clears a session when current-user validation returns 401", async () => {
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
