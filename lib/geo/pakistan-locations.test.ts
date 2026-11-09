import { expect, test } from "vitest";
import { PAKISTAN_PROVINCES } from "../farmer/farm-location.ts";
import { isInPakistan } from "./geo-point.ts";
import {
  LOCATIONS_ATTRIBUTION,
  MAX_PIN_DISTANCE_KM,
  cityTarget,
  citiesOfProvince,
  distanceKm,
  findCity,
  isPinFarFromCity,
} from "./pakistan-locations.ts";

test("every province has cities and every city sits inside Pakistan's bounds", () => {
  let total = 0;
  for (const province of PAKISTAN_PROVINCES) {
    const cities = citiesOfProvince(province);
    expect(cities.length, province).toBeGreaterThan(0);
    for (const c of cities) {
      total += 1;
      expect(c.name.trim(), `${province} city name`).not.toBe("");
      expect(c.lat, c.name).toBeGreaterThanOrEqual(23.5);
      expect(c.lat, c.name).toBeLessThanOrEqual(37.2);
      expect(c.lng, c.name).toBeGreaterThanOrEqual(60.5);
      expect(c.lng, c.name).toBeLessThanOrEqual(77.9);
      expect(isInPakistan(c), c.name).toBe(true);
    }
  }
  expect(total).toBeGreaterThan(400);
});

test("city names are unique within a province", () => {
  for (const province of PAKISTAN_PROVINCES) {
    const names = citiesOfProvince(province).map((c) => c.name.toLowerCase());
    expect(new Set(names).size, province).toBe(names.length);
  }
});

test("the ODbL attribution travels with the data", () => {
  expect(LOCATIONS_ATTRIBUTION).toMatch(/ODbL/);
});

test("lookup is case-insensitive and scoped to the province", () => {
  expect(findCity("Punjab", "lahore")?.name).toBe("Lahore");
  expect(findCity("Sindh", "Lahore")).toBeNull();
  expect(cityTarget("Punjab", "Nowhere")).toBeNull();
  expect(cityTarget("Sindh", "Karachi")?.center.lat).toBeCloseTo(24.86, 1);
});

test("distance and the far-from-city check", () => {
  const lahore = { lat: 31.5497, lng: 74.3436 };
  expect(distanceKm(lahore, lahore)).toBe(0);
  expect(distanceKm(lahore, { lat: 24.8607, lng: 67.0011 })).toBeGreaterThan(1000);
  expect(isPinFarFromCity({ lat: 31.6, lng: 74.4 }, lahore)).toBe(false);
  expect(isPinFarFromCity({ lat: 30.1575, lng: 71.5249 }, lahore)).toBe(true);
  expect(isPinFarFromCity({ lat: 31.9, lng: 74.3436 }, lahore, 10)).toBe(true);
  expect(MAX_PIN_DISTANCE_KM).toBe(60);
});
