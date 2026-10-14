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
