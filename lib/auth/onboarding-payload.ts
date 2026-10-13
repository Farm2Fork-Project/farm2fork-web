import type {
  BuyerOnboardingRequest,
  BuyerBusinessType,
  FarmerOnboardingRequest,
} from "../api/contracts.ts";
import type { SignupDraft } from "./signup-draft.ts";
import {
  cnicDigits,
  isValidCnic,
  isValidPhone,
  normalizePkPhone,
} from "./validation.ts";
import { PAKISTAN_PROVINCES } from "../farmer/farm-location.ts";

export const BUSINESS_TYPES: BuyerBusinessType[] = [
  "individual",
  "retailer",
  "restaurant",
  "wholesaler",
];

export const CROP_OPTIONS = ["wheat", "rice", "cotton", "sugarcane", "maize", "vegetables"] as const;

const LAT = { min: 23.5, max: 37.2 };
const LNG = { min: 60.5, max: 77.9 };

export type FieldErrors = Record<string, string>;

const str = (draft: SignupDraft, key: string): string => {
  const value = draft[key];
  return typeof value === "string" ? value.trim() : "";
};

/** Validates the identity fields shared by both roles. Error values are dictionary keys. */
export function validateIdentity(draft: SignupDraft): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = str(draft, "fullName");
  if (fullName.length < 2) errors.fullName = "signup.err.fullName";
  const phone = str(draft, "phone");
  if (phone && !isValidPhone(phone)) errors.phone = "signup.err.phone";
  if (!isValidCnic(str(draft, "cnic"))) errors.cnic = "signup.err.cnic";
  return errors;
}

export function validateBuyerAbout(draft: SignupDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!BUSINESS_TYPES.includes(str(draft, "businessType") as BuyerBusinessType)) {
    errors.businessType = "signup.err.businessType";
  }
  if (str(draft, "businessType") !== "individual" && str(draft, "businessName").length < 2) {
    errors.businessName = "signup.err.businessName";
  }
  return errors;
}

export function validateFarmerFarm(draft: SignupDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (str(draft, "farmName").length < 2) errors.farmName = "signup.err.farmName";
  const size = str(draft, "landSizeAcres");
  if (size && (!Number.isFinite(Number(size)) || Number(size) < 0 || Number(size) > 100000)) {
    errors.landSizeAcres = "signup.err.landSize";
  }
  if (!str(draft, "address")) errors.address = "signup.err.address";
  if (!str(draft, "city")) errors.city = "signup.err.city";
  if (!PAKISTAN_PROVINCES.includes(str(draft, "province") as (typeof PAKISTAN_PROVINCES)[number])) {
    errors.province = "signup.err.province";
  }
  const lat = Number(str(draft, "lat"));
  const lng = Number(str(draft, "lng"));
  if (
    !str(draft, "lat") || !str(draft, "lng") ||
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < LAT.min || lat > LAT.max || lng < LNG.min || lng > LNG.max
  ) {
    errors.location = "signup.err.location";
  }
  return errors;
}

export type BuiltOnboarding<T> =
  | { ok: true; payload: T; fullName: string }
  | { ok: false; errors: FieldErrors };

export function buildBuyerOnboarding(draft: SignupDraft): BuiltOnboarding<BuyerOnboardingRequest> {
  const errors = { ...validateIdentity(draft), ...validateBuyerAbout(draft) };
  if (Object.keys(errors).length) return { ok: false, errors };
  const fullName = str(draft, "fullName");
  const businessType = str(draft, "businessType") as BuyerBusinessType;
  const phone = normalizePkPhone(str(draft, "phone") || "");
  return {
    ok: true,
    fullName,
    payload: {
      // The API still requires a business name; an individual buys as themselves.
      businessName: businessType === "individual" ? fullName : str(draft, "businessName"),
      businessType,
      cnic: cnicDigits(str(draft, "cnic")).replace(/^(\d{5})(\d{7})(\d)$/, "$1-$2-$3"),
      ...(phone ? { phone } : {}),
    },
  };
}

export function buildFarmerOnboarding(draft: SignupDraft): BuiltOnboarding<FarmerOnboardingRequest> {
  const errors = { ...validateIdentity(draft), ...validateFarmerFarm(draft) };
  if (Object.keys(errors).length) return { ok: false, errors };
  const phone = normalizePkPhone(str(draft, "phone") || "");
  const crops = Array.isArray(draft.cropTypes) ? draft.cropTypes : [];
  const size = str(draft, "landSizeAcres");
  return {
    ok: true,
    fullName: str(draft, "fullName"),
    payload: {
      cnic: cnicDigits(str(draft, "cnic")).replace(/^(\d{5})(\d{7})(\d)$/, "$1-$2-$3"),
      farmName: str(draft, "farmName"),
      farmLocation: {
        address: str(draft, "address"),
        city: str(draft, "city"),
        province: str(draft, "province"),
        lat: Number(str(draft, "lat")),
        lng: Number(str(draft, "lng")),
      },
      ...(phone ? { phone } : {}),
      ...(crops.length ? { cropTypes: crops } : {}),
      ...(size ? { landSizeAcres: Number(size) } : {}),
    },
  };
}
