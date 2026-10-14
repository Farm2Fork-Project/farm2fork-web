// @vitest-environment node
// Run through the backend's disposable mobile-listings-e2e.ts harness.
import { expect, test } from "vitest";
import { ApiClient } from "../lib/api/client.ts";
import { FarmerRepository } from "../lib/farmer/farmer-repository.ts";
import { BuyerRepository } from "../lib/buyer/buyer-repository.ts";

const baseUrl = process.env.LISTINGS_TEST_API;

test.skipIf(!baseUrl)(
  "web buyer sees the mobile-created listing and follows its persisted status",
  async () => {
    const client = (token: string) =>
      new ApiClient({
        baseUrl,
        fetchFn: (input, init) => {
          const headers = new Headers(init?.headers);
          headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      });
    const farmer = client(process.env.LISTINGS_TEST_FARMER_TOKEN!);
    const buyer = new BuyerRepository({
      client: client(process.env.LISTINGS_TEST_BUYER_TOKEN!),
    });
    const mine = await farmer.request<{
      data: Array<{ id: string; status: string }>;
    }>("/products/mine");
    expect(mine.data).toHaveLength(1);
    const product = mine.data[0];
    expect(product.status).toBe("inactive");
    expect(
      (await buyer.listProducts({ search: "E2E Mangoes" })).data,
    ).toHaveLength(0);
    await farmer.request(`/products/${product.id}`, {
      method: "PATCH",
      body: { status: "active" },
    });
    const visible = await buyer.listProducts({ search: "E2E Mangoes" });
    expect(visible.data).toHaveLength(1);
    expect(visible.data[0].id).toBe(product.id);
    await new FarmerRepository({ client: farmer }).updateProduct(product.id, {
      name: "E2E Mangoes",
      category: "fruits",
      description: "Web edited harvest",
      price: 375,
      quantity: 9,
      unit: "kg",
      qualityGrade: "C",
      images: [],
    });
    const changed = await buyer.getProduct(product.id);
    expect(changed.price).toBe(375);
    expect(changed.quantity).toBe(9);
    expect(changed.description).toBe("Web edited harvest");
    expect(changed.qualityGrade).toBe("C");
    await farmer.request(`/products/${product.id}`, { method: "DELETE" });
    expect(
      (await buyer.listProducts({ search: "E2E Mangoes" })).data,
    ).toHaveLength(0);
  },
);
