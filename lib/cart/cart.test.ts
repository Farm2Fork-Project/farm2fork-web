import { expect, test } from "vitest";
import {
  addCartItem,
  updateCartQuantity,
  removeCartItem,
  groupCartItemsByFarmer,
  toCreateOrderRequest,
  reconcileCart,
  cartTotals,
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

test("reconcileCart drops sold-out listings, clamps stock and reports price moves", () => {
  const items = [
    ...addCartItem([], product, 5),
    ...addCartItem([], { ...product, id: "p2" }, 3),
    ...addCartItem([], { ...product, id: "p3" }, 2),
    ...addCartItem([], { ...product, id: "p4" }, 2),
  ];
  const { items: next, changes } = reconcileCart(
    items,
    new Map([
      ["p1", { ...product, quantity: 2, price: 150 }],
      ["p2", null],
      ["p3", { ...product, id: "p3", quantity: 0 }],
    ]),
  );

  expect(next.map((item) => [item.productId, item.quantity])).toEqual([
    ["p1", 2],
    ["p4", 2],
  ]);
  expect(next[0].product.price).toBe(150);
  expect(changes.map((change) => [change.productId, change.kind])).toEqual([
    ["p1", "less_stock"],
    ["p1", "price_up"],
    ["p2", "unavailable"],
    ["p3", "unavailable"],
  ]);
});

test("reconcileCart leaves an unchanged cart as the same array", () => {
  const items = addCartItem([], product, 2);
  const result = reconcileCart(items, new Map([["p1", { ...product }]]));
  expect(result.items).toBe(items);
  expect(result.changes).toEqual([]);
});

test("cartTotals adds units and PKR across lines", () => {
  const items = [
    ...addCartItem([], product, 2),
    ...addCartItem([], { ...product, id: "p2", price: 10 }, 3),
  ];
  expect(cartTotals(items)).toEqual({ lines: 2, units: 5, amount: 270 });
});
