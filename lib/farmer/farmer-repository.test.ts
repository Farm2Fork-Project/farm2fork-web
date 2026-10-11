import { expect, test } from "vitest";
import { FarmerRepository } from "./farmer-repository.ts";

test("FarmerRepository creates a product with the exact API DTO", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new FarmerRepository({
    client: {
      request: async <T,>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return { id: "product-1" } as T;
      },
    },
  });

  await repository.createProduct({
    name: "Roma Tomatoes",
    category: "vegetables",
    description: "Fresh",
    price: 120,
    quantity: 50,
    unit: "litre",
    qualityGrade: "A",
  });

  expect(calls).toEqual([
    {
      path: "/products",
      options: {
        method: "POST",
        body: {
          name: "Roma Tomatoes",
          category: "vegetables",
          description: "Fresh",
          price: 120,
          quantity: 50,
          unit: "litre",
          qualityGrade: "A",
        },
      },
    },
  ]);
});

test("FarmerRepository reads the authenticated farmer's product page", async () => {
  const calls: string[] = [];
  const repository = new FarmerRepository({
    client: {
      request: async <T,>(path: string) => {
        calls.push(path);
        return { data: [], page: 1, limit: 20, total: 0, totalPages: 0 } as T;
      },
    },
  });

  await repository.listMyProducts();
  expect(calls).toEqual(["/products/mine?limit=100"]);
});

test("FarmerRepository reads the authenticated farmer's order page", async () => {
  const calls: string[] = [];
  const repository = new FarmerRepository({
    client: {
      request: async <T,>(path: string) => {
        calls.push(path);
        return { data: [], page: 1, limit: 20, total: 0, totalPages: 0 } as T;
      },
    },
  });

  await repository.listOrders();

  expect(calls).toEqual(["/orders?limit=20"]);
});

test("FarmerRepository persists deletes and status changes through the API", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new FarmerRepository({
    client: {
      request: async <T,>(path: string, options?: unknown) => {
        calls.push({ path, options });
        return {} as T;
      },
    },
  });

  await repository.deleteProduct("p/1");
  await repository.updateProductStatus("p1", "inactive");

  expect(calls).toEqual([
    { path: "/products/p%2F1", options: { method: "DELETE" } },
    { path: "/products/p1", options: { method: "PATCH", body: { status: "inactive" } } },
  ]);
});

test("FarmerRepository uploads a quality photo as multipart form data", async () => {
  const calls: Array<{ path: string; options?: { method?: string; body?: unknown } }> = [];
  const repository = new FarmerRepository({
    client: {
      request: async <T,>(path: string, options?: { method?: string; body?: unknown }) => {
        calls.push({ path, options });
        return {} as T;
      },
    },
  });
  const photo = new File([new Uint8Array([1, 2, 3])], "mango.jpg", { type: "image/jpeg" });

  await repository.checkQuality(photo, "mango");

  expect(calls[0].path).toBe("/ai/quality");
  const body = calls[0].options?.body as FormData;
  expect(body.get("crop")).toBe("mango");
  expect((body.get("image") as File).name).toBe("mango.jpg");
});
