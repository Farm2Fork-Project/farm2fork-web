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

export function addCartItem(
  items: CartItem[],
  product: BuyerProduct,
  quantity: number,
): CartItem[] {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError("Cart quantity must be at least one.");
  }

  const existingIndex = items.findIndex((item) => item.productId === product.id);
  if (existingIndex === -1) {
    return [
      ...items,
      {
        productId: product.id,
        farmerId: product.farmerId,
        quantity,
        product,
      },
    ];
  }

  return items.map((item, index) =>
    index === existingIndex
      ? { ...item, quantity: item.quantity + quantity, product }
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
    items: group.items.map(({ productId, quantity }) => ({ productId, quantity })),
    shippingAddress,
  };
}

export function removeCartGroup(
  items: CartItem[],
  farmerId: string,
): CartItem[] {
  return items.filter((item) => item.farmerId !== farmerId);
}
