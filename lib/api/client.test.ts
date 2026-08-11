import { expect, test } from "vitest";
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

  expect(requests).toHaveLength(1);
  expect(requests[0].url).toBe("http://localhost:3000/api/products/product-1");
  const headers = new Headers(requests[0].init?.headers);
  expect(headers.get("Accept")).toBe("application/json");
  expect(headers.get("Authorization")).toBe("Bearer buyer-token");
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

  await expect(client.request("/products")).rejects.toMatchObject(
    new ApiError(401, "Your session has expired.", {
      message: "Invalid access token",
    }),
  );
  expect(clears).toBe(1);
});

test("ApiClient normalizes a non-JSON 503 response", async () => {
  const client = new ApiClient({
    baseUrl: "http://localhost:3000/api",
    fetchFn: async () => new Response("Service unavailable", { status: 503 }),
  });

  await expect(client.request("/products")).rejects.toMatchObject(
    new ApiError(503, "Request failed with status 503.", "Service unavailable"),
  );
});
