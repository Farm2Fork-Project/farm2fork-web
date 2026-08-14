import { expect, test } from "vitest";
import { firebaseAuthRedirectRewrites } from "./auth-redirect-proxy.ts";

test("proxies Firebase auth helpers without redirecting the browser away from the app origin", () => {
  expect(firebaseAuthRedirectRewrites("farm2fork-2a5b9")).toEqual([
    {
      source: "/__/auth/:path*",
      destination: "https://farm2fork-2a5b9.firebaseapp.com/__/auth/:path*",
    },
  ]);
});

test("does not create a helper proxy from an empty project id", () => {
  expect(firebaseAuthRedirectRewrites("   ")).toEqual([]);
});
