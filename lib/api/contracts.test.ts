import assert from "node:assert/strict";
import test from "node:test";
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

    assert.deepEqual(product, {
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
    assert.equal("farmName" in product, false);
    assert.equal("rating" in product, false);
    assert.equal("location" in product, false);
    assert.equal("sales" in product, false);
});
