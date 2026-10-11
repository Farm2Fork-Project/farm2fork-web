"use client";

import { FormEvent, useState } from "react";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { toCreateOrderRequest } from "@/lib/cart/cart.ts";
import type {
  ApiOrderAddress,
  ApiOrderQuote,
  PaymentGateway,
} from "@/lib/api/contracts.ts";

import {
  paymentSimulatorEnabled,
  safepayCheckoutUrl,
} from "@/lib/buyer/payment-checkout.ts";
import { IcCart, IcCheckCircle } from "@/components/icons";

function paymentStatusBadgeClass(status: string): string {
  if (status === "success") return "badge-soft-green";
  if (status === "failed" || status === "refunded") return "badge-soft-red";
  return "badge-soft-blue";
}

type CheckoutRepository = Pick<
  BuyerRepository,
  "createOrder" | "initiatePayment" | "quoteOrder"
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

  const [quoted, setQuoted] = useState<{
    key: string;
    quotes: ApiOrderQuote[];
  } | null>(null);
  const requestKey = JSON.stringify(
    groups.map((group) => toCreateOrderRequest(group, address)),
  );
  const quotes = quoted?.key === requestKey ? quoted.quotes : null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (groups.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    if (!quotes) {
      try {
        const next = await Promise.all(
          groups.map((group) =>
            repository.quoteOrder(toCreateOrderRequest(group, address)),
          ),
        );
        setQuoted({ key: requestKey, quotes: next });
      } catch (quoteError) {
        setError(
          quoteError instanceof Error
            ? quoteError.message
            : "Could not price delivery. Check the delivery location and the farmer's pickup location.",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
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
        const result: CheckoutResult = {
          farmerId: group.farmerId,
          paymentStatus: "not initiated",
        };
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
        <div
          className="card"
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--sp-md)",
          }}
        >
          <IcCheckCircle size={40} color="var(--success)" />
          <h3 style={{ margin: 0 }}>
            {results.length === 1
              ? "Order placed"
              : `${results.length} orders placed`}
          </h3>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            Your orders are saved. Open each pending checkout to pay. Status is
            confirmed by the payment provider.
          </p>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "var(--sp-sm)",
            }}
          >
            {results.map((result, index) => (
              <div key={result.farmerId}>
                <div className="flex-between">
                  <span>Farmer group {index + 1}</span>
                  <span
                    className={`badge ${paymentStatusBadgeClass(result.paymentStatus)}`}
                  >
                    {result.paymentStatus}
                  </span>
                </div>
                {result.checkoutUrl ? (
                  <a className="btn btn-primary" href={result.checkoutUrl}>
                    Pay farmer group {index + 1} with Safepay
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          {error ? <p role="alert">{error}</p> : null}
          <button
            className="btn btn-primary"
            onClick={onViewOrders}
            type="button"
          >
            View orders
          </button>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="cart-empty">
        <IcCart size={72} />
        <h2>Your cart is empty</h2>
        <p>Add active marketplace products to create separate farmer orders.</p>
      </div>
    );
  }

  return (
    <form className="checkout-panel" onSubmit={submit}>
      <h3>Checkout</h3>
      <p>Each farmer group becomes its own order and pending payment.</p>

      <fieldset
        disabled={isSubmitting}
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <h4 className="checkout-section">Delivery address</h4>
        <div className="checkout-address-grid">
          <label>
            Street
            <input
              required
              value={address.street}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  street: event.target.value,
                }))
              }
            />
          </label>
          <label>
            City
            <input
              required
              value={address.city}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Province
            <input
              required
              value={address.province}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  province: event.target.value,
                }))
              }
            />
          </label>
          <label>
            ZIP code (optional)
            <input
              value={address.zip ?? ""}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  zip: event.target.value || undefined,
                }))
              }
            />
          </label>
          <label>
            Delivery latitude
            <input
              required
              type="number"
              step="any"
              min="23.5"
              max="37.2"
              value={address.lat ?? ""}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  lat:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                }))
              }
            />
          </label>
          <label>
            Delivery longitude
            <input
              required
              type="number"
              step="any"
              min="60.5"
              max="77.9"
              value={address.lng ?? ""}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  lng:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                }))
              }
            />
          </label>
        </div>
        <p>
          Enter the coordinates of your delivery address in Pakistan. You can
          copy them from your map app.
        </p>
      </fieldset>
      {quotes ? (
        <div aria-live="polite">
          {quotes.map((quote, index) => (
            <div className="card checkout-quote" key={groups[index].farmerId}>
              <h4>Farmer group {index + 1}</h4>
              <p>Items: Rs {quote.totalAmount.toLocaleString("en-PK")}</p>
              <p>
                Platform fee ({quote.platformFeePercent}%): Rs{" "}
                {quote.platformFeeAmount.toLocaleString("en-PK")}
              </p>
              <p>
                Delivery ({quote.deliveryDistanceKm} km estimated): Rs{" "}
                {quote.deliveryFee.toLocaleString("en-PK")}
              </p>
              <strong>
                Total: Rs {quote.grandTotal.toLocaleString("en-PK")}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <p>
          Get a quote to review the full total, including delivery, before
          placing orders.
        </p>
      )}

      <h4 className="checkout-section">Payment</h4>
      <label>
        Payment gateway
        <select
          value={gateway}
          onChange={(event) => setGateway(event.target.value as PaymentGateway)}
        >
          <option value="safepay">Safepay</option>
          {simulatorEnabled ? (
            <>
              <option value="jazzcash">JazzCash (local simulation)</option>
              <option value="stripe">Stripe (local simulation)</option>
            </>
          ) : null}
        </select>
      </label>

      <button className="cart-shop-btn" disabled={isSubmitting} type="submit">
        {isSubmitting
          ? quotes
            ? "Placing orders…"
            : "Pricing delivery…"
          : quotes
            ? "Place orders"
            : "Get delivery quote"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
