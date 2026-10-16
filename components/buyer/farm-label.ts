/** "Green Valley Farm · Multan, Punjab" - public farm identity only. */
export function farmLabel(farmer: {
  farmName: string;
  city?: string;
  province?: string;
}): string {
  const place = [farmer.city, farmer.province].filter(Boolean).join(", ");
  return place ? `${farmer.farmName} · ${place}` : farmer.farmName;
}

/** "Multan, Punjab", or "" when the farm never gave a place. */
export function farmPlace(farmer: {
  city?: string;
  province?: string;
}): string {
  return [farmer.city, farmer.province].filter(Boolean).join(", ");
}
