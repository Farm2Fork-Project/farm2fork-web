"use client";

import { FormEvent, useState } from "react";
import { LuCircleCheckBig, LuShoppingCart } from "react-icons/lu";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { toCreateOrderRequest } from "@/lib/cart/cart.ts";
import type { ApiOrderAddress, PaymentGateway } from "@/lib/api/contracts.ts";

import { paymentSimulatorEnabled, safepayCheckoutUrl } from "@/lib/buyer/payment-checkout.ts";

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
  checkoutUrl?: string;
};

export function CheckoutPanel({
  groups,
  repository,
  onConfirmedFarmers,
  onViewOrders,
  simulatorEnabled = paymentSimulatorEnabled(),
}: {
  groups: CartFarmerGroup[];
  repository: CheckoutRepository;
  onConfirmedFarmers: (farmerIds: string[]) => void;
  onViewOrders: () => void;
  simulatorEnabled?: boolean;
}) {
  const [address, setAddress] = useState<ApiOrderAddress>({
    street: "",
    city: "",
    province: "",
  });
  const [gateway, setGateway] = useState<PaymentGateway>("safepay");
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
        // An order already exists even if its gateway handoff fails. Recover it
        // from Orders instead of creating another order from the same cart group.
        confirmedFarmers.push(group.farmerId);
        const result: CheckoutResult = { farmerId: group.farmerId, paymentStatus: "not initiated" };
        nextResults.push(result);
        const response = await repository.initiatePayment(order.id, gateway);
        result.paymentStatus = response.payment.status;
        result.checkoutUrl = safepayCheckoutUrl(response);
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
            Your orders are saved. Open each pending checkout to pay. Status is confirmed by the payment provider.
          </p>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}>
            {results.map((result, index) => (
              <div key={result.farmerId}>
                <div className="flex-between">
                <span>Farmer group {index + 1}</span>
                <span className={`badge ${paymentStatusBadgeClass(result.paymentStatus)}`}>
                  {result.paymentStatus}
                </span>
                </div>
                {result.checkoutUrl ? <a className="btn btn-primary" href={result.checkoutUrl}>
                  Pay farmer group {index + 1} with Safepay
                </a> : null}
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

  if (groups.length === 0) {
    return <div className="cart-empty"><LuShoppingCart size={72} /><h2>Your cart is empty</h2>
      <p>Add active marketplace products to create separate farmer orders.</p></div>;
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
          <option value="safepay">Safepay</option>
          {simulatorEnabled ? <>
            <option value="jazzcash">JazzCash (local simulation)</option>
            <option value="stripe">Stripe (local simulation)</option>
          </> : null}
        </select>
      </label>

      <button className="cart-shop-btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Placing orders…" : "Place orders"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
