export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Same generous box around Pakistan the backend validates against. */
export function isInPakistan({ lat, lng }: GeoPoint): boolean {
  return lat >= 23.5 && lat <= 37.2 && lng >= 60.5 && lng <= 77.9;
}

export const DEFAULT_MAP_CENTER: GeoPoint = { lat: 31.0, lng: 72.5 };

export function formatPoint({ lat, lng }: GeoPoint): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/** Browser geolocation as a promise; rejects with a dictionary key. */
export function currentPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("map.locationUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "map.locationDenied"
              : "map.locationUnavailable",
          ),
        ),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 60_000 },
    );
  });
}
