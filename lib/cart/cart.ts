import type {
  ApiOrderAddress,
  BuyerProduct,
  CreateOrderRequest,
} from "../api/contracts.ts";

export type CartItem = {
  productId: string;
  farmerId: string;
  quantity: number;
  product: BuyerProduct;
};

export type CartFarmerGroup = {
  farmerId: string;
  items: CartItem[];
};

/** The farm a cart group is bought from; older carts saved without farm identity get a numbered fallback. */
export function cartGroupLabel(group: CartFarmerGroup, index: number): string {
  return group.items[0]?.product.farmer?.farmName ?? `Farm ${index + 1}`;
}

export function addCartItem(
  items: CartItem[],
  product: BuyerProduct,
  quantity: number,
): CartItem[] {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError("Cart quantity must be at least one.");
  }

  if (product.status !== "active") return items;
  const existingIndex = items.findIndex(
    (item) => item.productId === product.id,
  );
  if (product.quantity < 1) return items;
  if (existingIndex === -1) {
    return [
      ...items,
      {
        productId: product.id,
        farmerId: product.farmerId,
        quantity: Math.min(quantity, Math.floor(product.quantity)),
        product,
      },
    ];
  }

  return items.map((item, index) =>
    index === existingIndex
      ? {
          ...item,
          quantity: Math.min(
            item.quantity + quantity,
            Math.floor(product.quantity),
          ),
          product,
        }
      : item,
  );
}

export function groupCartItemsByFarmer(items: CartItem[]): CartFarmerGroup[] {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    const group = groups.get(item.farmerId);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.farmerId, [item]);
    }
  }

  return Array.from(groups, ([farmerId, groupItems]) => ({
    farmerId,
    items: groupItems,
  }));
}

export function toCreateOrderRequest(
  group: CartFarmerGroup,
  shippingAddress: ApiOrderAddress,
): CreateOrderRequest {
  return {
    items: group.items.map(({ productId, quantity }) => ({
      productId,
      quantity,
    })),
    shippingAddress,
  };
}

export function removeCartGroup(
  items: CartItem[],
  farmerId: string,
): CartItem[] {
  return items.filter((item) => item.farmerId !== farmerId);
}

export function updateCartQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (!Number.isInteger(quantity) || quantity < 1) return items;
  return items.map((item) =>
    item.productId === productId
      ? {
          ...item,
          quantity: Math.min(quantity, Math.floor(item.product.quantity)),
        }
      : item,
  );
}

export function removeCartItem(
  items: CartItem[],
  productId: string,
): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

/** Versioned, per-account browser-session storage. Invalid or obsolete entries are ignored. */
export function readSavedCart(
  storage: Pick<Storage, "getItem">,
  userId: string,
): CartItem[] {
  try {
    const value = JSON.parse(
      storage.getItem(`f2f.cart.v1.${userId}`) ?? "null",
    );
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is CartItem =>
        item &&
        typeof item.productId === "string" &&
        item.productId === item.product?.id &&
        item.farmerId === item.product?.farmerId &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.product?.name === "string" &&
        Number.isFinite(item.product?.price) &&
        item.product.price >= 0 &&
        Number.isFinite(item.product?.quantity) &&
        item.product.quantity >= item.quantity &&
        item.product.status === "active" &&
        typeof item.product.unit === "string" &&
        Array.isArray(item.product.images),
    );
  } catch {
    return [];
  }
}

export type CartChange = {
  productId: string;
  name: string;
  kind: "unavailable" | "less_stock" | "price_up" | "price_down";
  /** Previous and new value: quantity for stock, PKR for price. */
  from?: number;
  to?: number;
};

/**
 * Brings saved cart items in line with the listings as the server has them
 * now. `fresh` maps a product id to its current listing, or `null` when the
 * listing is gone; an id that is missing means the lookup failed, so that item
 * is left exactly as it was. Returns the same array when nothing changed.
 */
export function reconcileCart(
  items: CartItem[],
  fresh: ReadonlyMap<string, BuyerProduct | null>,
): { items: CartItem[]; changes: CartChange[] } {
  const changes: CartChange[] = [];
  const next: CartItem[] = [];
  let touched = false;

  for (const item of items) {
    if (!fresh.has(item.productId)) {
      next.push(item);
      continue;
    }
    const product = fresh.get(item.productId) ?? null;
    const stock = product ? Math.floor(product.quantity) : 0;
    if (!product || product.status !== "active" || stock < 1) {
      changes.push({
        productId: item.productId,
        name: item.product.name,
        kind: "unavailable",
      });
      touched = true;
      continue;
    }
    const quantity = Math.min(item.quantity, stock);
    if (quantity < item.quantity) {
      changes.push({
        productId: item.productId,
        name: product.name,
        kind: "less_stock",
        from: item.quantity,
        to: quantity,
      });
    }
    if (product.price !== item.product.price) {
      changes.push({
        productId: item.productId,
        name: product.name,
        kind: product.price > item.product.price ? "price_up" : "price_down",
        from: item.product.price,
        to: product.price,
      });
    }
    const same =
      quantity === item.quantity &&
      product.price === item.product.price &&
      product.quantity === item.product.quantity &&
      product.name === item.product.name;
    if (!same) touched = true;
    next.push(same ? item : { ...item, quantity, product });
  }

  return { items: touched ? next : items, changes };
}

/** Item count and PKR total across a set of cart items. */
export function cartTotals(items: CartItem[]): {
  lines: number;
  units: number;
  amount: number;
} {
  return {
    lines: items.length,
    units: items.reduce((sum, item) => sum + item.quantity, 0),
    amount: items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
  };
}
