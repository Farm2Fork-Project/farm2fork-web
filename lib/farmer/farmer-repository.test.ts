import { expect, test } from "vitest";
import { FarmerRepository } from "./farmer-repository.ts";

test("FarmerRepository creates a product with the exact API DTO", async () => {
  const calls: Array<{ path: string; options?: unknown }> = [];
  const repository = new FarmerRepository({
    client: {
      request: async (path, options) => {
        calls.push({ path, options });
        return { id: "product-1" };
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
      request: async (path) => {
        calls.push(path);
        return { data: [], page: 1, limit: 20, total: 0, totalPages: 0 };
      },
    },
  });

  await repository.listMyProducts();
  expect(calls).toEqual(["/products/mine?limit=100"]);
});
