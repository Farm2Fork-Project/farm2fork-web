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
  /** The person's own name; absent until they add one. */
  fullName?: string;
  /** 256px square avatar (Cloudinary URL, or a root-relative path in local development). */
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface ApiFarmLocationStatus {
  address?: string;
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  complete: boolean;
}

/** Role details of GET /auth/me/profile; only the caller's own role is filled. */
export interface ApiProfileDetails {
  kind: UserRole;
  /** Identity number with all but the last 4 digits hidden. Read only. */
  cnicMasked?: string;
  businessName?: string;
  businessType?: BuyerBusinessType;
  farmName?: string;
  cropTypes?: string[];
  landSizeAcres?: number;
  farmLocation?: ApiFarmLocationStatus;
  vehicleType?: TransporterVehicleType;
  vehicleNumber?: string;
  serviceAreas?: string[];
  institutionName?: string;
  institutionType?: string;
}

export interface ApiProfile {
  user: ApiAuthUser;
  displayName: string;
  profile: ApiProfileDetails;
}

/** PATCH /auth/me/profile: send only the fields that changed. */
export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  businessName?: string;
  businessType?: BuyerBusinessType;
  farmName?: string;
  cropTypes?: string[];
  landSizeAcres?: number;
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
] as const;
export type GradableCrop = (typeof GRADABLE_CROPS)[number];

export interface AiStatus {
  available: boolean;
  qualityModel?: "trained" | "untrained" | "unavailable";
  trainedCrops?: string[];
  priceMethod?: string;
}

export type QualityReviewReason =
  | "low_confidence"
  | "unfamiliar_photo"
  | "photo_check_unavailable";

export interface QualityCheckResult {
  predictionId: string;
  /** null when the photo needs review: no grade may be shown. */
  modelGrade: "A" | "B" | "C" | "D" | null;
  /** null when the model says D (below any listable grade). */
  suggestedListingGrade: "A" | "B" | "C" | null;
  confidenceScore: number;
  probabilities: Record<string, number>;
  crop: GradableCrop;
  cropSupported: boolean;
  lowConfidence: boolean;
  /** Ask for a retake or a manual grade instead of showing a grade. */
  needsReview: boolean;
  reviewReason: QualityReviewReason | null;
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
  /** Observed AMIS Punjab wholesale prices, not a prediction. */
  method: "official_wholesale";
  commodity: string;
  /** Mandi trading day, YYYY-MM-DD. */
  observedOn: string;
  /** The farmer's own market, or "Punjab" for the middle half of markets. */
  marketScope: string;
  marketCount: number;
  source: string;
  sourceUrl: string;
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
  /** Public photo URLs from `uploadProductImages`. */
  images?: string[];
}

export interface BuyerProduct {
  description?: string;
  category?: string;
  createdAt?: string;
  /** Ledger state of the listing's origin record; absent on saved carts. */
  originLedgerStatus?: OriginLedgerStatus;
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

export interface ApiOrderQuote {
  totalAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  deliveryFee: number;
  deliveryDistanceKm: number;
  grandTotal: number;
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
  unit?: string;
  productId: string;
  farmerId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ApiOrder {
  canCancel?: boolean;
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

export type PaymentGateway = 'jazzcash' | 'stripe' | 'safepay';

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
  pickupContact?: { name?: string; phone?: string };
  deliveryContact?: { name?: string; phone?: string };
  issue?: { reason: string; note?: string; stage: string; reportedAt: string; resolvedAt?: string; resolution?: string };
  assignmentHistory?: { fromTransporterId?: string; transporterId: string; assignedBy: string; reason: string; timestamp: string }[];
  deliveryFee?: number;
  deliveryDistanceKm?: number;
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

export interface ApiAvailableDelivery {
  farmName?: string;
  items?: Array<{productName: string; quantity: number; unit?: string}>;
  pickup?: {lat: number; lng: number; city: string; province: string};
  dropoffArea?: {lat: number; lng: number; city: string; province: string};
  deliveryFee?: number;
  deliveryDistanceKm?: number;
  distanceToPickupKm?: number;
  orderId: string;
  pickupCity: string;
  pickupProvince: string;
  deliveryCity: string;
  deliveryProvince: string;
  itemCount: number;
  createdAt: string;
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  note: string;
}

export interface InitiatePaymentResponse {
  payment: ApiPayment;
  checkoutUrl?: string;
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
    description: product.description,
    category: product.category,
    createdAt: product.createdAt,
    originLedgerStatus: product.originLedgerStatus,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit,
    images: product.images,
    qualityGrade: product.qualityGrade,
    status: product.status,
    farmer: product.farmer ?? null,
  };
}

export interface ApiTransporterStatus {
  online: boolean;
  locationFresh: boolean;
  lastLocationAt?: string;
  activeShipmentId?: string;
  radiusKm: number;
}
export interface ApiCoordinates { lat: number; lng: number }
