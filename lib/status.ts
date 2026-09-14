/**
 * Maps an order or shipment status string to one of the three visual
 * treatments defined for `.order-status` in globals.css. Order statuses
 * (pending → paid → processing → shipped → delivered, or cancelled) and
 * shipment statuses (assigned → picked_up → in_transit → delivered, or
 * failed) both collapse to the same in-progress / done / failed semantics.
 */
export function orderStatusClass(
  status: string,
): "processing" | "completed" | "cancelled" {
  const normalized = status.toLowerCase();
  if (normalized === "cancelled" || normalized === "failed") return "cancelled";
  if (normalized === "delivered") return "completed";
  return "processing";
}
