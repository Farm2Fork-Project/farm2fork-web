import assert from "node:assert/strict";
import test from "node:test";
import {
  addCartItem,
  groupCartItemsByFarmer,
  toCreateOrderRequest,
} from "./cart.ts";

const product = {
  id: "p1",
  farmerId: "f1",
  name: "Roma Tomatoes",
  price: 120,
  quantity: 20,
  unit: "kg",
  images: [],
  qualityGrade: "A",
  status: "active",
};

test("addCartItem rejects quantities below one", () => {
  assert.throws(() => addCartItem([], product, 0), /at least one/i);
});

test("cart grouping keeps farmer groups separate and order payloads omit farmer ids", () => {
  const items = [
    ...addCartItem([], product, 2),
    ...addCartItem([], { ...product, id: "p2", farmerId: "f2" }, 1),
    ...addCartItem([], { ...product, id: "p3" }, 3),
  ];

  const groups = groupCartItemsByFarmer(items);
  assert.deepEqual(
    groups.map((group) => ({
      farmerId: group.farmerId,
      productIds: group.items.map((item) => item.productId),
    })),
    [
      { farmerId: "f1", productIds: ["p1", "p3"] },
      { farmerId: "f2", productIds: ["p2"] },
    ],
  );

  assert.deepEqual(toCreateOrderRequest(groups[0], {
    street: "12 Mall Road",
    city: "Lahore",
    province: "Punjab",
  }), {
    items: [
      { productId: "p1", quantity: 2 },
      { productId: "p3", quantity: 3 },
    ],
    shippingAddress: {
      street: "12 Mall Road",
      city: "Lahore",
      province: "Punjab",
    },
  });
});
