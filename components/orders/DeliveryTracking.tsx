"use client";
import type { ApiOrderAddress, ApiShipment } from "@/lib/api/contracts";
import { useLanguage } from "@/components/LanguageContext";

export function DeliveryTracking({
  shipment,
  orderStatus,
  unavailable = false,
  address,
  showHistory = true,
}: {
  shipment?: ApiShipment;
  orderStatus: string;
  unavailable?: boolean;
  address?: ApiOrderAddress;
  /** Set false when the caller already draws the shipment's steps. */
  showHistory?: boolean;
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
