import { expect, test } from "vitest";
import { toBuyerProduct } from "./contracts.ts";

test("toBuyerProduct preserves backend data without inventing farmer profile fields", () => {
    const product = toBuyerProduct({
      id: '66a000000000000000000001',
      farmerId: '66a000000000000000000002',
      name: 'Roma Tomatoes',
      category: 'vegetables',
      price: 120,
      quantity: 20,
      unit: 'kg',
      images: [],
      qualityGrade: 'A',
      status: 'active',
      createdAt: '2026-08-12T00:00:00.000Z',
      updatedAt: '2026-08-12T00:00:00.000Z',
    });

    expect(product).toEqual({
      id: '66a000000000000000000001',
      farmerId: '66a000000000000000000002',
      name: 'Roma Tomatoes',
      price: 120,
      quantity: 20,
      unit: 'kg',
      images: [],
      qualityGrade: 'A',
      status: 'active',
    });
    expect(product).not.toHaveProperty("farmName");
    expect(product).not.toHaveProperty("rating");
    expect(product).not.toHaveProperty("location");
    expect(product).not.toHaveProperty("sales");
});
