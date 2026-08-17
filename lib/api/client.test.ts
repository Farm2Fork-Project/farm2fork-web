import { afterEach, expect, test, vi } from "vitest";
import { ApiError } from "./contracts.ts";
import { ApiClient } from "./client.ts";

test("ApiClient uses cookie credentials and a CSRF header without a bearer token", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const client = new ApiClient({
    baseUrl: "http://localhost:3000/api",
    fetchFn: async (url, init) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ id: "product-1" }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  await client.request<{ id: string }>("/products/product-1", { method: "POST" });

  expect(requests).toHaveLength(1);
  expect(requests[0].url).toBe("http://localhost:3000/api/products/product-1");
  const headers = new Headers(requests[0].init?.headers);
  expect(headers.get("Accept")).toBe("application/json");
  expect(headers.get("Authorization")).toBeNull();
  expect(headers.get("X-Farm2Fork-CSRF")).toBe("1");
  expect(requests[0].init?.credentials).toBe("include");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("ApiClient invokes the browser fetch function with the browser global receiver", async () => {
  let receiver: unknown;
  const fetchFn = function (this: unknown) {
    receiver = this;
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    }));
  };
  vi.stubGlobal("fetch", fetchFn);
  const client = new ApiClient({ baseUrl: "http://localhost:3000/api" });

  await client.request("/health");

  expect(receiver).toBe(globalThis);
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
