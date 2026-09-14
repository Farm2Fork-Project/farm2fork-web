"use client";

import { FormEvent, useState } from "react";
import { LuCircleCheckBig } from "react-icons/lu";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { toCreateOrderRequest } from "@/lib/cart/cart.ts";
import type { ApiOrderAddress, PaymentGateway } from "@/lib/api/contracts.ts";

function paymentStatusBadgeClass(status: string): string {
  if (status === "success") return "badge-soft-green";
  if (status === "failed" || status === "refunded") return "badge-soft-red";
  return "badge-soft-blue";
}

type CheckoutRepository = Pick<
  BuyerRepository,
  "createOrder" | "initiatePayment"
>;

type CheckoutResult = {
  farmerId: string;
  paymentStatus: string;
};

export function CheckoutPanel({
  groups,
  repository,
  onConfirmedFarmers,
  onViewOrders,
}: {
  groups: CartFarmerGroup[];
  repository: CheckoutRepository;
  onConfirmedFarmers: (farmerIds: string[]) => void;
  onViewOrders: () => void;
}) {
  const [address, setAddress] = useState<ApiOrderAddress>({
    street: "",
    city: "",
    province: "",
  });
  const [gateway, setGateway] = useState<PaymentGateway>("jazzcash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<CheckoutResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (groups.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const confirmedFarmers: string[] = [];
    const nextResults: CheckoutResult[] = [];

    for (const group of groups) {
      try {
        const order = await repository.createOrder(
          toCreateOrderRequest(group, address),
        );
        const payment = await repository.initiatePayment(order.id, gateway);
        confirmedFarmers.push(group.farmerId);
        nextResults.push({
          farmerId: group.farmerId,
          paymentStatus: payment.status,
        });
      } catch (checkoutError) {
        const message =
          checkoutError instanceof Error
            ? checkoutError.message
            : "Could not place this farmer group order.";
        setError(
          `${message} Review Orders and Payments before manually retrying this group.`,
        );
        break;
      }
    }

    setResults(nextResults);
    if (confirmedFarmers.length > 0) onConfirmedFarmers(confirmedFarmers);
    setIsSubmitting(false);
  }

  if (results.length > 0) {
    return (
      <div className="checkout-panel">
        <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-md)" }}>
          <LuCircleCheckBig size={40} color="var(--success)" />
          <h3 style={{ margin: 0 }}>
            {results.length === 1 ? "Order placed" : `${results.length} orders placed`}
          </h3>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Each farmer group is now its own order with a pending payment.
          </p>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}>
            {results.map((result, index) => (
              <div className="flex-between" key={result.farmerId}>
                <span>Farmer group {index + 1}</span>
                <span className={`badge ${paymentStatusBadgeClass(result.paymentStatus)}`}>
                  {result.paymentStatus}
                </span>
              </div>
            ))}
          </div>
          {error ? <p role="alert">{error}</p> : null}
          <button className="btn btn-primary" onClick={onViewOrders} type="button">
            View orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="checkout-panel" onSubmit={submit}>
      <h3>Checkout</h3>
      <p>Each farmer group becomes its own order and pending payment.</p>

      <div className="checkout-address-grid">
        <label>
          Street
          <input
            required
            value={address.street}
            onChange={(event) =>
              setAddress((current) => ({ ...current, street: event.target.value }))
            }
          />
        </label>
        <label>
          City
          <input
            required
            value={address.city}
            onChange={(event) =>
              setAddress((current) => ({ ...current, city: event.target.value }))
            }
          />
        </label>
        <label>
          Province
          <input
            required
            value={address.province}
            onChange={(event) =>
              setAddress((current) => ({ ...current, province: event.target.value }))
            }
          />
        </label>
        <label>
          ZIP code (optional)
          <input
            value={address.zip ?? ""}
            onChange={(event) =>
              setAddress((current) => ({ ...current, zip: event.target.value || undefined }))
            }
          />
        </label>
      </div>

      <label>
        Payment gateway
        <select
          value={gateway}
          onChange={(event) => setGateway(event.target.value as PaymentGateway)}
        >
          <option value="jazzcash">JazzCash</option>
          <option value="stripe">Stripe</option>
        </select>
      </label>

      <button className="cart-shop-btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Placing orders…" : "Place orders"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
