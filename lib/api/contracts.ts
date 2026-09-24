export type UserRole =
  | 'farmer'
  | 'buyer'
  | 'transporter'
  | 'financial_partner'
  | 'admin';
export type WebRole = Exclude<UserRole, 'admin' | 'financial_partner'>;

export interface ApiAuthUser {
  id: string;
  email: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
}

export type BuyerBusinessType =
  | 'individual'
  | 'retailer'
  | 'restaurant'
  | 'wholesaler';

export interface RegisterBuyerRequest {
  businessName: string;
  businessType: BuyerBusinessType;
  cnic: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterFarmerRequest {
  email: string;
  password: string;
  cnic: string;
  farmName: string;
  phone?: string;
  /** Required: delivery is priced from and dispatched to this pin. */
  farmLocation: {
    address: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
  };
  cropTypes?: string[];
  landSizeAcres?: number;
}

export type TransporterVehicleType = 'bike' | 'rickshaw' | 'van' | 'truck';

export interface RegisterTransporterRequest {
  email: string;
  password: string;
  cnic: string;
  vehicleType: TransporterVehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  phone?: string;
  serviceAreas?: string[];
}

export type BuyerOnboardingRequest = Omit<
  RegisterBuyerRequest,
  'email' | 'password'
>;
export type FarmerOnboardingRequest = Omit<
  RegisterFarmerRequest,
  'email' | 'password'
>;
export type TransporterOnboardingRequest = Omit<
  RegisterTransporterRequest,
  'email' | 'password'
>;

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
  /** Public farm identity; null when the farmer has no profile. */
  farmer?: ApiFarmerSummary | null;
  /** Ledger state of the listing's first provenance record. */
  originLedgerStatus?: OriginLedgerStatus;
}

export interface ApiFarmerSummary {
  farmName: string;
  city?: string;
  province?: string;
}

export type OriginLedgerStatus = "pending" | "confirmed" | "failed" | "missing";

export const GRADABLE_CROPS = [
  "wheat",
  "rice",
  "mango",
  "maize",
  "cotton",
  "sugarcane",
] as const;
export type GradableCrop = (typeof GRADABLE_CROPS)[number];

export interface AiStatus {
  available: boolean;
  qualityModel?: "trained" | "untrained" | "unavailable";
  trainedCrops?: string[];
  priceMethod?: string;
}

export interface QualityCheckResult {
  predictionId: string;
  modelGrade: "A" | "B" | "C" | "D";
  /** null when the model says D (below any listable grade). */
  suggestedListingGrade: "A" | "B" | "C" | null;
  confidenceScore: number;
  probabilities: Record<string, number>;
  crop: GradableCrop;
  cropSupported: boolean;
  lowConfidence: boolean;
  modelStatus: "trained" | "untrained";
  modelVersion: string;
}

export interface PriceSuggestionRequest {
  productName: string;
  category: string;
  unit: FarmerProductUnit;
  quantity?: number;
  qualityGrade?: "A" | "B" | "C";
}

export interface PriceSuggestion {
  predictionId: string;
  predictedMinPrice: number;
  predictedMaxPrice: number;
  unit: FarmerProductUnit;
  confidenceScore: number;
  method: "rule_based";
  basis: "crop" | "category";
  modelVersion: string;
}

export type FarmerProductUnit = 'kg' | 'ton' | 'dozen' | 'piece' | 'litre';
export type FarmerProductQualityGrade = 'A' | 'B' | 'C';

export interface CreateFarmerProductRequest {
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity: number;
  unit: FarmerProductUnit;
  qualityGrade?: FarmerProductQualityGrade;
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
  /** Absent on carts saved before farm identity existed. */
  farmer?: ApiFarmerSummary | null;
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
  /** Drop-off pin: required for new orders, absent on legacy ones. */
  lat?: number;
  lng?: number;
}

export interface OrderQuote {
  totalAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  deliveryFee: number;
  deliveryDistanceKm: number;
  grandTotal: number;
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
  /** Fixed delivery price frozen at checkout (0 on legacy orders). */
  deliveryFee?: number;
  deliveryDistanceKm?: number;
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

export type ShipmentStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed";

export interface ApiShipmentAddress {
  street?: string;
  city?: string;
  province?: string;
  zip?: string;
}

export interface ApiShipmentStatusHistory {
  status: ShipmentStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface ApiShipment {
  id: string;
  orderId: string;
  transporterId: string;
  status: ShipmentStatus;
  pickupAddress: ApiShipmentAddress;
  deliveryAddress: ApiShipmentAddress;
  statusHistory: ApiShipmentStatusHistory[];
  estimatedDelivery?: string;
  actualDelivery?: string;
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
    farmer: product.farmer ?? null,
  };
}
