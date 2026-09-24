/** Mirrors the backend's PAKISTAN_PROVINCES (farm pickup routing). */
export const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
  "Islamabad Capital Territory",
] as const;
export type PakistanProvince = (typeof PAKISTAN_PROVINCES)[number];

/**
 * A farm's pickup location. All three parts are required: transporters only
 * see and claim orders from farms with a complete location.
 */
export interface FarmLocation {
  address: string;
  city: string;
  province: PakistanProvince;
}

export interface FarmLocationStatus {
  address?: string;
  city?: string;
  province?: string;
  complete: boolean;
}

/** Dictionary key for a province's localized name. */
export function provinceKey(province: string): string {
  return `province.${province.replace(/\s+/g, "")}`;
}
