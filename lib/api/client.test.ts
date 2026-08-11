import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "./contracts.ts";
import { ApiClient } from "./client.ts";

test("ApiClient attaches the buyer bearer token and accepts JSON", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const client = new ApiClient({
    baseUrl: "http://localhost:3000/api",
    getAccessToken: () => "buyer-token",
    fetchFn: async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ id: "product-1" }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  await client.request<{ id: string }>("/products/product-1");

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "http://localhost:3000/api/products/product-1");
  const headers = new Headers(requests[0].init?.headers);
  assert.equal(headers.get("Accept"), "application/json");
  assert.equal(headers.get("Authorization"), "Bearer buyer-token");
});

test("ApiClient clears the session and normalizes a 401 response", async () => {
  let clears = 0;
  const client = new ApiClient({
    baseUrl: "http://localhost:3000/api",
    getAccessToken: () => "buyer-token",
    clearSession: () => {
      clears += 1;
    },
    fetchFn: async () =>
      new Response(JSON.stringify({ message: "Invalid access token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  });

  await assert.rejects(
    () => client.request("/products"),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 401);
      assert.equal(error.message, "Your session has expired.");
      assert.deepEqual(error.body, { message: "Invalid access token" });
      return true;
    },
  );
  assert.equal(clears, 1);
});

test("ApiClient normalizes a non-JSON 503 response", async () => {
  const client = new ApiClient({
    baseUrl: "http://localhost:3000/api",
    fetchFn: async () => new Response("Service unavailable", { status: 503 }),
  });

  await assert.rejects(
    () => client.request("/products"),
    (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 503);
      assert.equal(error.message, "Request failed with status 503.");
      assert.equal(error.body, "Service unavailable");
      return true;
    },
  );
});
