"use client";
import { useEffect, useState } from "react";
import { BuyerDeliveryCode } from "@/components/delivery/BuyerDeliveryCode";
import type { ApiOrderAddress, ApiShipment } from "@/lib/api/contracts";
import { useLanguage } from "@/components/LanguageContext";
import DeliveryMap, { type DeliveryMapPoint } from "@/components/maps/DeliveryMap";

/** Shipment states in which each viewer follows the transporter. */
const LIVE_STATES = {
  buyer: ["picked_up", "in_transit"],
  farmer: ["assigned"],
} as const;

export function DeliveryTracking({
  shipment,
  orderStatus,
  unavailable = false,
  address,
  showHistory = true,
  showDeliveryCode = false,
  liveMapFor,
  now,
}: {
  shipment?: ApiShipment;
  orderStatus: string;
  unavailable?: boolean;
  address?: ApiOrderAddress;
  /** Set false when the caller already draws the shipment's steps. */
  showHistory?: boolean;
  showDeliveryCode?: boolean;
  /** Shows the transporter against the viewer's own place while they wait. */
  liveMapFor?: "buyer" | "farmer";
  /** Injected by tests. */
  now?: number;
}) {
  const { language } = useLanguage();
  const ur = language === "ur";
  const states: Record<string, string> = ur
    ? {
        assigned: "ڈرائیور مقرر",
        picked_up: "پیداوار وصول",
        in_transit: "راستے میں",
        delivered: "پہنچا دیا گیا",
        cancelled: "منسوخ",
      }
    : {
        assigned: "Driver assigned",
        picked_up: "Picked up",
        in_transit: "On the way",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };
  return (
    <div className="shipment-tracking">
      {address?.street ? (
        <div className="order-delivery-address">
          <strong>{ur ? "ڈیلیوری کا پتہ" : "Delivery address"}</strong>
          <p>
            {[address.street, address.city, address.province, address.zip]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      ) : null}
      {unavailable ? (
        <p role="status">
          {ur
            ? "ڈیلیوری کی صورتحال دستیاب نہیں۔ دوبارہ تازہ کریں۔"
            : "Delivery status is unavailable. Refresh to try again."}
        </p>
      ) : !shipment ? (
        <p className="order-shipment" data-status="awaiting">
          {orderStatus === "pending"
            ? ur
              ? "ادائیگی کے بعد ڈیلیوری شروع ہوگی۔"
              : "Delivery starts after payment is confirmed."
            : orderStatus === "cancelled"
              ? ur
                ? "آرڈر منسوخ ہو گیا۔"
                : "This order was cancelled."
              : ur
                ? "ڈرائیور کی تقرری کا انتظار ہے۔"
                : "Shipment: awaiting assignment"}
        </p>
      ) : (
        <>
          <p className="order-shipment" data-status={shipment.status}>
            {ur ? "ڈیلیوری: " : "Shipment: "}
            {states[shipment.status] ?? shipment.status}
          </p>
          {showDeliveryCode && ["assigned", "picked_up", "in_transit"].includes(shipment.status) && <BuyerDeliveryCode key={`${shipment.id}:${shipment.transporterId}`} shipmentId={shipment.id} />}
          {liveMapFor && (LIVE_STATES[liveMapFor] as readonly string[]).includes(shipment.status) ? (
            <LiveDeliveryMap shipment={shipment} viewer={liveMapFor} ur={ur} now={now} />
          ) : null}
          {showHistory && shipment.statusHistory.length > 0 ? (
            <ol className="shipment-timeline">
              {shipment.statusHistory.map((entry) => (
                <li key={`${entry.status}-${entry.timestamp}`}>
                  {states[entry.status] ?? entry.status} ·{" "}
                  {new Date(entry.timestamp).toLocaleString(
                    ur ? "ur-PK" : "en-PK",
                  )}
                  {entry.note ? ` — ${entry.note}` : ""}
                </li>
              ))}
            </ol>
          ) : null}
        </>
      )}
    </div>
  );
}

function LiveDeliveryMap({
  shipment,
  viewer,
  ur,
  now,
}: {
  shipment: ApiShipment;
  viewer: "buyer" | "farmer";
  ur: boolean;
  now?: number;
}) {
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    if (now !== undefined) return;
    const timer = setInterval(() => setClock(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [now]);
  const current = now ?? clock;
  const place = viewer === "farmer" ? shipment.pickupAddress : shipment.deliveryAddress;
  const located = shipment.transporterLocation;
  const points: DeliveryMapPoint[] = [];
  // Legacy shipments may lack an address pin.
  if (typeof place?.lat === "number" && typeof place?.lng === "number") {
    points.push({
      id: "place",
      point: { lat: place.lat, lng: place.lng },
      kind: viewer === "farmer" ? "pickup" : "dropoff",
      label: viewer === "farmer" ? (ur ? "آپ کا فارم" : "Your farm") : ur ? "آپ کا ڈراپ آف" : "Your drop-off",
    });
  }
  if (located) {
    points.push({
      id: "transporter",
      point: { lat: located.lat, lng: located.lng },
      kind: "transporter",
      label: ur ? "ٹرانسپورٹر" : "Transporter",
    });
  }
  const minutes = located ? Math.max(0, Math.floor((current - new Date(located.at).getTime()) / 60000)) : null;
  const caption =
    minutes === null
      ? ur
        ? "ٹرانسپورٹر کی ایپ کھلی ہونے پر اُن کا مقام یہاں نظر آتا ہے۔"
        : "The transporter's position appears here while their app is open."
      : minutes < 1
        ? ur
          ? "ٹرانسپورٹر کا مقام ابھی اپ ڈیٹ ہوا۔"
          : "Transporter position updated just now."
        : ur
          ? `ٹرانسپورٹر کا مقام ${minutes} منٹ پہلے اپ ڈیٹ ہوا۔`
          : `Transporter position updated ${minutes} min ago.`;
  if (points.length === 0) return <p className="delivery-map-caption">{caption}</p>;
  return (
    <DeliveryMap
      points={points}
      caption={caption}
      title={ur ? "ترسیل کا براہِ راست نقشہ" : "Live delivery map"}
      openLabel={ur ? "گوگل میپس میں کھولیں" : "Open in Google Maps"}
    />
  );
}
