import type {
  ApiProfile,
  BuyerBusinessType,
  UpdateProfileRequest,
} from "../api/contracts.ts";
import type { FieldErrors } from "../auth/onboarding-payload.ts";
import { BUSINESS_TYPES } from "../auth/onboarding-payload.ts";
import { displayPhone, normalizePkPhone } from "../auth/validation.ts";
import { PAKISTAN_PROVINCES, type FarmLocation } from "../farmer/farm-location.ts";

/** Everything the edit form can show, as strings so inputs stay controlled. */
export type ProfileForm = {
  fullName: string;
  phone: string;
  businessName: string;
  businessType: string;
  farmName: string;
  landSizeAcres: string;
  cropTypes: string[];
  address: string;
  city: string;
  province: string;
  lat: string;
  lng: string;
};

export function initialForm(profile: ApiProfile): ProfileForm {
  const details = profile.profile;
  const place = details.farmLocation;
  return {
    fullName: profile.user.fullName ?? "",
    phone: displayPhone(profile.user.phone),
    businessName: details.businessName ?? "",
    businessType: details.businessType ?? "",
    farmName: details.farmName ?? "",
    landSizeAcres: details.landSizeAcres === undefined ? "" : String(details.landSizeAcres),
    cropTypes: details.cropTypes ?? [],
    address: place?.address ?? "",
    city: place?.city ?? "",
    province: place?.province ?? "",
    lat: place?.lat === undefined ? "" : String(place.lat),
    lng: place?.lng === undefined ? "" : String(place.lng),
  };
}

const LAT = { min: 23.5, max: 37.2 };
const LNG = { min: 60.5, max: 77.9 };

function locationTouched(original: ProfileForm, form: ProfileForm): boolean {
  return (["address", "city", "province", "lat", "lng"] as const).some((key) => original[key].trim() !== form[key].trim());
}

/** Error values are dictionary keys. */
export function validateProfileForm(profile: ApiProfile, form: ProfileForm): FieldErrors {
  const errors: FieldErrors = {};
  const original = initialForm(profile);
  const kind = profile.profile.kind;

  const name = form.fullName.trim();
  if (name && (name.length < 2 || name.length > 80)) errors.fullName = "signup.err.fullName";
  if (!name && original.fullName) errors.fullName = "signup.err.fullName";

  const phone = form.phone.trim();
  if (phone ? !normalizePkPhone(phone) : !!original.phone) errors.phone = "signup.err.phone";

  if (kind === "buyer") {
    if (!BUSINESS_TYPES.includes(form.businessType as BuyerBusinessType)) errors.businessType = "signup.err.businessType";
    const bn = form.businessName.trim();
    if (form.businessType !== "individual" && (bn.length < 2 || bn.length > 120)) errors.businessName = "signup.err.businessName";
  }

  if (kind === "farmer") {
    const fn = form.farmName.trim();
    if (fn.length < 2 || fn.length > 120) errors.farmName = "signup.err.farmName";
    const size = form.landSizeAcres.trim();
    if (size) {
      const n = Number(size);
      if (!Number.isFinite(n) || n < 0 || n > 100000) errors.landSizeAcres = "signup.err.landSize";
    } else if (original.landSizeAcres) {
      errors.landSizeAcres = "signup.err.landSize";
    }
    if (form.cropTypes.length > 20) errors.cropTypes = "account.err.tooManyCrops";
    if (locationTouched(original, form)) {
      if (!form.address.trim()) errors.address = "signup.err.address";
      if (!form.city.trim()) errors.city = "signup.err.city";
      if (!PAKISTAN_PROVINCES.includes(form.province as (typeof PAKISTAN_PROVINCES)[number])) errors.province = "signup.err.province";
      const lat = Number(form.lat);
      const lng = Number(form.lng);
      if (
        !form.lat.trim() || !form.lng.trim() ||
        !Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < LAT.min || lat > LAT.max || lng < LNG.min || lng > LNG.max
      ) {
        errors.location = "signup.err.location";
      }
    }
  }
  return errors;
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((value, index) => value === b[index]);

/** The PATCH body (only what changed) and the farm location to save separately. */
export function diffProfile(
  profile: ApiProfile,
  form: ProfileForm,
): { changes: UpdateProfileRequest; location: FarmLocation | null } {
  const original = initialForm(profile);
  const kind = profile.profile.kind;
  const changes: UpdateProfileRequest = {};

  const name = form.fullName.trim();
  if (name && name !== original.fullName) changes.fullName = name;

  const phone = normalizePkPhone(form.phone.trim());
  if (phone && phone !== profile.user.phone) changes.phone = phone;

  if (kind === "buyer") {
    if (form.businessType !== original.businessType) changes.businessType = form.businessType as BuyerBusinessType;
    if (form.businessType !== "individual" && form.businessName.trim() !== original.businessName) {
      changes.businessName = form.businessName.trim();
    }
  }

  let location: FarmLocation | null = null;
  if (kind === "farmer") {
    if (form.farmName.trim() !== original.farmName) changes.farmName = form.farmName.trim();
    const size = form.landSizeAcres.trim();
    if (size && size !== original.landSizeAcres) changes.landSizeAcres = Number(size);
    if (!sameList(form.cropTypes, original.cropTypes)) changes.cropTypes = form.cropTypes;
    if (locationTouched(original, form)) {
      location = {
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province as FarmLocation["province"],
        lat: Number(form.lat),
        lng: Number(form.lng),
      };
    }
  }
  return { changes, location };
}

export function isDirty(profile: ApiProfile, form: ProfileForm): boolean {
  const { changes, location } = diffProfile(profile, form);
  return Object.keys(changes).length > 0 || location !== null;
}

const FIELD_NAMES = ["fullName", "phone", "businessName", "businessType", "farmName", "cropTypes", "landSizeAcres"] as const;
const FIELD_ALIASES: Record<string, string> = { crops: "cropTypes" };

/**
 * class-validator messages begin with the property name ("fullName must be
 * longer than…"). Returns the fields the API rejected and any other messages.
 */
export function splitApiFieldErrors(message: string): { fields: string[]; other: string[] } {
  const fields: string[] = [];
  const other: string[] = [];
  for (const part of message.split(/;\s*/).filter(Boolean)) {
    const first = part.split(/[\s.]/)[0];
    const field = FIELD_NAMES.find((name) => name === first) ?? FIELD_ALIASES[first];
    if (field) fields.push(field);
    else other.push(part);
  }
  return { fields, other };
}
