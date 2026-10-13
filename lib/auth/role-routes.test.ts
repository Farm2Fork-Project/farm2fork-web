import { describe, expect, test } from "vitest";
import { loginPathFor, portalPathForRole, resolvePostLoginPath, safeNextPath } from "./role-routes.ts";

describe("role routing after sign-in", () => {
  test("each role lands on its own portal", () => {
    expect(resolvePostLoginPath("buyer")).toBe("/");
    expect(resolvePostLoginPath("farmer")).toBe("/farmer");
    expect(resolvePostLoginPath("financial_partner")).toBe("/financial");
    expect(resolvePostLoginPath("admin")).toBe("/admin/dashboard");
    expect(resolvePostLoginPath("transporter")).toBe("/transporter");
    expect(portalPathForRole("farmer")).toBe("/farmer");
  });

  test("a ?next= inside the person's own area is honoured", () => {
    expect(resolvePostLoginPath("farmer", "/farmer")).toBe("/farmer");
    expect(resolvePostLoginPath("admin", "/admin/users")).toBe("/admin/users");
    expect(resolvePostLoginPath("buyer", "/account/edit")).toBe("/account/edit");
    expect(resolvePostLoginPath("buyer", "/?payment_return=complete")).toBe("/?payment_return=complete");
  });

  test("a ?next= into another role's portal falls back to the person's own", () => {
    expect(resolvePostLoginPath("buyer", "/farmer")).toBe("/");
    expect(resolvePostLoginPath("farmer", "/admin/dashboard")).toBe("/farmer");
    expect(resolvePostLoginPath("financial_partner", "/farmer/listings")).toBe("/financial");
  });

  test("a ?next= that is not a same-site path is ignored", () => {
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil", "javascript:alert(1)", "", null, undefined]) {
      expect(safeNextPath(bad, "buyer"), String(bad)).toBeNull();
    }
  });

  test("auth pages are never a destination, so sign-in cannot loop", () => {
    for (const path of ["/login", "/signup/buyer", "/verify-email", "/forgot-password?x=1"]) {
      expect(safeNextPath(path, "farmer"), path).toBeNull();
    }
  });

  test("the landing page is a destination for buyers only", () => {
    expect(safeNextPath("/", "buyer")).toBe("/");
    expect(safeNextPath("/", "farmer")).toBeNull();
  });

  test("portals send signed-out visitors to /login with the page they wanted", () => {
    expect(loginPathFor("/farmer")).toBe("/login?next=%2Ffarmer");
    expect(loginPathFor("/admin/dashboard")).toBe("/login?next=%2Fadmin%2Fdashboard");
  });
});
