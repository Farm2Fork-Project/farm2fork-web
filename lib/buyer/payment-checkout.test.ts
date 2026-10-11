import { afterEach, expect, test, vi } from "vitest";
import { paymentSimulatorEnabled } from "./payment-checkout.ts";

afterEach(() => vi.unstubAllEnvs());

test("simulation requires explicit development configuration and is disabled in production", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_PAYMENT_SIMULATOR_ENABLED", "false");
  expect(paymentSimulatorEnabled()).toBe(false);
  vi.stubEnv("NEXT_PUBLIC_PAYMENT_SIMULATOR_ENABLED", "true");
  expect(paymentSimulatorEnabled()).toBe(true);
  vi.stubEnv("NODE_ENV", "production");
  expect(paymentSimulatorEnabled()).toBe(false);
});
