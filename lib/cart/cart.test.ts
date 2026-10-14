import { expect, test } from "vitest";
import {
  addCartItem,
  updateCartQuantity,
  removeCartItem,
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
  expect(() => addCartItem([], product, 0)).toThrow(/at least one/i);
});

test("cart grouping keeps farmer groups separate and order payloads omit farmer ids", () => {
  const items = [
    ...addCartItem([], product, 2),
    ...addCartItem([], { ...product, id: "p2", farmerId: "f2" }, 1),
    ...addCartItem([], { ...product, id: "p3" }, 3),
  ];

  const groups = groupCartItemsByFarmer(items);
  expect(
    groups.map((group) => ({
      farmerId: group.farmerId,
      productIds: group.items.map((item) => item.productId),
    })),
  ).toEqual([
    { farmerId: "f1", productIds: ["p1", "p3"] },
    { farmerId: "f2", productIds: ["p2"] },
  ]);

  expect(
    toCreateOrderRequest(groups[0], {
      street: "12 Mall Road",
      city: "Lahore",
      province: "Punjab",
    }),
  ).toEqual({
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

test("stock bounds hold when adding repeatedly or entering cart quantities", () => {
  const stock = { ...product, quantity: 2.5 };
  const cart = addCartItem(addCartItem([], stock, 1), stock, 5);
  expect(cart[0].quantity).toBe(2);
  expect(updateCartQuantity(cart, stock.id, 50)[0].quantity).toBe(2);
  expect(updateCartQuantity(cart, stock.id, 1)[0].quantity).toBe(1);
  expect(updateCartQuantity(cart, stock.id, 1.5)).toEqual(cart);
  expect(removeCartItem(cart, stock.id)).toEqual([]);
  expect(addCartItem([], { ...stock, status: "inactive" }, 1)).toEqual([]);
  expect(addCartItem([], { ...stock, quantity: 0 }, 1)).toEqual([]);
});

test("saved carts are account-scoped and corrupted data is ignored", async () => {
  const { readSavedCart } = await import("./cart.ts");
  const cart = addCartItem([], product, 2);
  const saved = {
    getItem: (key: string) =>
      key === "f2f.cart.v1.buyer-1" ? JSON.stringify(cart) : null,
  };
  expect(readSavedCart(saved, "buyer-1")).toEqual(cart);
  expect(readSavedCart(saved, "buyer-2")).toEqual([]);
  expect(readSavedCart({ getItem: () => "broken" }, "buyer-1")).toEqual([]);
  expect(
    readSavedCart(
      { getItem: () => JSON.stringify([{ ...cart[0], quantity: 99 }]) },
      "buyer-1",
    ),
  ).toEqual([]);
});
