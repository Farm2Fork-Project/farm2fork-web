import raw from "./pakistan-locations.json";
import type { GeoPoint } from "./geo-point.ts";
import { PAKISTAN_PROVINCES } from "../farmer/farm-location.ts";

export interface PakistanCity {
  name: string;
  lat: number;
  lng: number;
}

interface LocationDataset {
  /** ODbL credit that must stay visible wherever the city list is used. */
  attribution: string;
  provinces: { name: string; cities: PakistanCity[] }[];
}

const dataset = raw as LocationDataset;

export const LOCATIONS_ATTRIBUTION = dataset.attribution;
export const LOCATIONS_SOURCE_URL =
  "https://github.com/dr5hn/countries-states-cities-database";

/** How far a pin may sit from the chosen city centre before we ask the user. */
export const MAX_PIN_DISTANCE_KM = 60;

const byProvince = new Map<string, PakistanCity[]>(
  dataset.provinces.map((p) => [p.name, p.cities]),
);

/** Cities of a province (alphabetical in the dataset); empty for unknown input. */
export function citiesOfProvince(province: string): readonly PakistanCity[] {
  return byProvince.get(province) ?? [];
}

export function findCity(province: string, city: string): PakistanCity | null {
  const wanted = city.trim().toLowerCase();
  if (!wanted) return null;
  return (
    citiesOfProvince(province).find((c) => c.name.toLowerCase() === wanted) ??
    null
  );
}

/** Rough centre of a province (mean of its cities), to frame the map. */
export function provinceCentre(province: string): GeoPoint | null {
  const cities = citiesOfProvince(province);
  if (cities.length === 0) return null;
  return {
    lat: cities.reduce((s, c) => s + c.lat, 0) / cities.length,
    lng: cities.reduce((s, c) => s + c.lng, 0) / cities.length,
  };
}

/** Great-circle distance in kilometres (haversine). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** True when the pin is further than `maxKm` from the city centre. */
export function isPinFarFromCity(
  pin: GeoPoint,
  center: GeoPoint,
  maxKm: number = MAX_PIN_DISTANCE_KM,
): boolean {
  return distanceKm(pin, center) > maxKm;
}

export { PAKISTAN_PROVINCES };

/** The city a map pin is checked against, or null when it is not in the dataset. */
export function cityTarget(
  province: string,
  city: string,
): { name: string; center: GeoPoint } | null {
  const match = findCity(province, city);
  return match ? { name: match.name, center: { lat: match.lat, lng: match.lng } } : null;
}
