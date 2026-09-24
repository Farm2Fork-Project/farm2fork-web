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
 * A farm's pickup location. Everything is required: delivery fees are priced
 * from the map pin and transporters are matched and navigated to it.
 */
export interface FarmLocation {
  address: string;
  city: string;
  province: PakistanProvince;
  lat: number;
  lng: number;
}

export interface FarmLocationStatus {
  address?: string;
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  complete: boolean;
}

/** Dictionary key for a province's localized name. */
export function provinceKey(province: string): string {
  return `province.${province.replace(/\s+/g, "")}`;
}
