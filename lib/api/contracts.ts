export type UserRole = 'farmer' | 'buyer' | 'transporter' | 'admin';

export interface ApiAuthUser {
  id: string;
  email: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface ApiAuthResult {
  accessToken: string;
  user: ApiAuthUser;
}

export interface ApiProduct {
  id: string;
  farmerId: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity: number;
  unit: string;
  images: string[];
  qualityGrade?: string;
  qrCode?: string;
  initialBlockchainRecordId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerProduct {
  id: string;
  farmerId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  images: string[];
  qualityGrade?: string;
  status: string;
}

export interface ApiPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiOrderAddress {
  street: string;
  city: string;
  province: string;
  zip?: string;
}

export interface CreateOrderRequest {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: ApiOrderAddress;
}

export interface ApiOrderItem {
  productId: string;
  farmerId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ApiOrder {
  id: string;
  buyerId: string;
  farmerId: string;
  items: ApiOrderItem[];
  totalAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  grandTotal: number;
  shippingAddress: ApiOrderAddress;
  status: string;
  paymentId?: string;
  shipmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentGateway = 'jazzcash' | 'stripe';

export interface CreatePaymentRequest {
  orderId: string;
  gateway: PaymentGateway;
}

export interface ApiPayment {
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  blockchainTxId?: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentResponse {
  payment: ApiPayment;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function toBuyerProduct(product: ApiProduct): BuyerProduct {
  return {
    id: product.id,
    farmerId: product.farmerId,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit,
    images: product.images,
    qualityGrade: product.qualityGrade,
    status: product.status,
  };
}
