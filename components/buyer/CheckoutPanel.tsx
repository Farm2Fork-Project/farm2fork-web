"use client";

import { FormEvent, useState } from "react";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { toCreateOrderRequest } from "@/lib/cart/cart.ts";
import type { ApiOrderAddress, PaymentGateway } from "@/lib/api/contracts.ts";

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
}: {
  groups: CartFarmerGroup[];
  repository: CheckoutRepository;
  onConfirmedFarmers: (farmerIds: string[]) => void;
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
      {results.length > 0 ? (
        <p>
          {results.length} {results.length === 1 ? "payment is" : "payments are"} pending.
        </p>
      ) : null}
    </form>
  );
}
