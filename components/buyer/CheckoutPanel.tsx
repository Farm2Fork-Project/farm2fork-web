"use client";

import { FormEvent, useEffect, useState } from "react";
import { IcCart, IcCheckCircle } from "@/components/icons";
import { paymentSimulatorEnabled, safepayCheckoutUrl } from "@/lib/buyer/payment-checkout.ts";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { cartGroupLabel, toCreateOrderRequest } from "@/lib/cart/cart.ts";
import type { ApiOrderAddress, OrderQuote, PaymentGateway } from "@/lib/api/contracts.ts";
import MapPinPicker from "@/components/maps/MapPinPicker";
import { PAKISTAN_PROVINCES } from "@/lib/farmer/farm-location.ts";
import type { GeoPoint } from "@/lib/geo/geo-point.ts";

const rupees = new Intl.NumberFormat("en-PK");

type QuoteState =
  | { kind: "ready"; quote: OrderQuote }
  | { kind: "unavailable" };

function paymentStatusBadgeClass(status: string): string {
  if (status === "success") return "badge-soft-green";
  if (status === "failed" || status === "refunded") return "badge-soft-red";
  return "badge-soft-blue";
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case "success":
      return "Paid";
    case "pending":
      return "Awaiting payment";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return "Payment not started";
  }
}

type CheckoutRepository = Pick<
  BuyerRepository,
  "createOrder" | "initiatePayment" | "quoteOrder"
>;

type CheckoutResult = {
  farmerId: string;
  farmName: string;
  /** What the buyer owes for this order, when known. */
  amount?: number;
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
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null);
  // Keyed by pin + farmer, so a moved pin shows "calculating" until its
  // own quote arrives; a missing entry means the request is in flight.
  const [quotes, setQuotes] = useState<Record<string, QuoteState>>({});
  const pinKey = dropoff ? JSON.stringify({
    pin: dropoff,
    items: groups.map((group) => ({ farmerId: group.farmerId, items: group.items.map((item) => ({ productId: item.product.id, quantity: item.quantity })) })),
  }) : "";

  useEffect(() => {
    if (!dropoff) return;
    let cancelled = false;
    const key = pinKey;
    for (const group of groups) {
      repository
        .quoteOrder(
          toCreateOrderRequest(group, {
            street: "-",
            city: "-",
            province: "-",
            lat: dropoff.lat,
            lng: dropoff.lng,
          }),
        )
        .then(
          (quote): QuoteState => ({ kind: "ready", quote }),
          (): QuoteState => ({ kind: "unavailable" }),
        )
        .then((result) => {
          if (cancelled) return;
          setQuotes((current) => ({ ...current, [`${key}|${group.farmerId}`]: result }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [dropoff, groups, repository, pinKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (groups.length === 0 || isSubmitting) return;
    if (!dropoff) {
      setError("Pin the drop-off location on the map first; the delivery fee is priced from it.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    if (!groups.every((group) => quotes[`${pinKey}|${group.farmerId}`]?.kind === "ready")) {
      setError("Wait for a delivery quote for every farmer before placing orders.");
      setIsSubmitting(false);
      return;
    }
    const confirmedFarmers: string[] = [];
    const nextResults: CheckoutResult[] = [];

    for (const [index, group] of groups.entries()) {
      try {
        const order = await repository.createOrder(
          toCreateOrderRequest(group, { ...address, lat: dropoff.lat, lng: dropoff.lng }),
        );
        // An order already exists even if its gateway handoff fails. Recover it
        // from Orders instead of creating another order from the same cart group.
        confirmedFarmers.push(group.farmerId);
        const quoted = quotes[`${pinKey}|${group.farmerId}`];
        const result: CheckoutResult = {
          farmerId: group.farmerId,
          farmName: cartGroupLabel(group, index),
          amount:
            typeof order.grandTotal === "number"
              ? order.grandTotal
              : quoted?.kind === "ready"
                ? quoted.quote.grandTotal
                : undefined,
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
            : "Could not place this order.";
        setError(
          `${message} Check Orders to see what was saved before trying again.`,
        );
        break;
      }
    }

    setResults(nextResults);
    if (confirmedFarmers.length > 0) onConfirmedFarmers(confirmedFarmers);
    setIsSubmitting(false);
  }

  if (results.length > 0) {
    const unpaid = results.some((result) => result.paymentStatus !== "success");
    return (
      <div className="checkout-panel">
        <div className="card checkout-receipt">
          <IcCheckCircle size={40} color="var(--success)" />
          <h3>
            {results.length === 1
              ? "Order placed"
              : `${results.length} orders placed`}
          </h3>
          <p>
            {unpaid
              ? results.length === 1
                ? "Your order is saved but not confirmed yet. Pay now to confirm it. Payment opens on Safepay's secure page."
                : "Your orders are saved but not confirmed yet. Pay for each one to confirm it. Payment opens on Safepay's secure page."
              : "Your payment is confirmed."}
          </p>
          <div className="checkout-receipt-list">
            {results.map((result) => (
              <div className="checkout-receipt-row" key={result.farmerId}>
                <div className="flex-between">
                  <span>
                    <strong>{result.farmName}</strong>
                    {result.amount !== undefined ? (
                      <span className="checkout-receipt-amount"> · Rs {rupees.format(result.amount)}</span>
                    ) : null}
                  </span>
                  <span
                    className={`badge ${paymentStatusBadgeClass(result.paymentStatus)}`}
                  >
                    {paymentStatusLabel(result.paymentStatus)}
                  </span>
                </div>
                {result.checkoutUrl ? (
                  <a className="btn btn-primary" href={result.checkoutUrl}>
                    {results.length === 1
                      ? `Pay${result.amount !== undefined ? ` Rs ${rupees.format(result.amount)}` : ""} on Safepay`
                      : `Pay${result.amount !== undefined ? ` Rs ${rupees.format(result.amount)}` : ""} to ${result.farmName}`}
                  </a>
                ) : result.paymentStatus !== "success" ? (
                  <p className="checkout-receipt-note">
                    We couldn&apos;t open payment for this order. Open Orders and choose Pay to try again.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {error ? <p role="alert">{error}</p> : null}
          <button
            className="btn btn-secondary"
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
        <p>Add products from the marketplace to start an order.</p>
      </div>
    );
  }

  const allQuoted = groups.every((group) => quotes[`${pinKey}|${group.farmerId}`]?.kind === "ready");
  const total = dropoff && allQuoted
    ? groups.reduce((sum, group) => {
        const state = quotes[`${pinKey}|${group.farmerId}`];
        return sum + (state?.kind === "ready" ? state.quote.grandTotal : 0);
      }, 0)
    : null;
  const several = groups.length > 1;
  const submitLabel = isSubmitting
    ? "Placing order…"
    : several
      ? `Place ${groups.length} orders${total !== null ? ` · Rs ${rupees.format(total)}` : ""}`
      : `Place order${total !== null ? ` · Rs ${rupees.format(total)}` : ""}`;

  return (
    <form className="checkout-panel" onSubmit={submit}>
      <h3>Checkout</h3>
      <p>
        {several
          ? `Your items come from ${groups.length} farms, so you'll place ${groups.length} orders and pay for each one.`
          : "Add your delivery details, place the order, then pay securely on Safepay."}
      </p>

      <fieldset disabled={isSubmitting} style={{ border: 0, margin: 0, padding: 0 }}>
      <h4 className="checkout-step">1. Delivery address</h4>
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
          <select
            required
            value={address.province}
            onChange={(event) =>
              setAddress((current) => ({ ...current, province: event.target.value }))
            }
          >
            <option value="">Select province</option>
            {PAKISTAN_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
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

      <div className="checkout-dropoff">
        <h4 className="checkout-step">2. Drop-off location</h4>
        <p className="checkout-hint">Pin where the delivery should arrive. The delivery fee is calculated from this pin.</p>
        <MapPinPicker value={dropoff} onChange={setDropoff} purpose="dropoff" disabled={isSubmitting} />
      </div>

      </fieldset>

      <h4 className="checkout-step">3. Your {several ? "orders" : "order"}</h4>
      <div className="checkout-quotes" aria-live="polite">
        {groups.map((group, index) => {
          const state = quotes[`${pinKey}|${group.farmerId}`];
          const label = cartGroupLabel(group, index);
          return (
            <div className="checkout-quote" key={group.farmerId}>
              <span className="checkout-quote-farm">{label}</span>
              {!dropoff ? (
                <span className="checkout-quote-note">Pin the drop-off to see the delivery fee</span>
              ) : !state ? (
                <span className="checkout-quote-note">Calculating delivery…</span>
              ) : state.kind === "unavailable" ? (
                <span className="checkout-quote-error">
                  This farm hasn&apos;t pinned its pickup location yet, so it can&apos;t be ordered right now.
                </span>
              ) : (
                <>
                  <span className="checkout-quote-line"><span>Items</span><span>Rs {rupees.format(state.quote.totalAmount)}</span></span>
                  <span className="checkout-quote-line"><span>Service fee</span><span>Rs {rupees.format(state.quote.platformFeeAmount)}</span></span>
                  <span className="checkout-quote-line"><span>Delivery ({state.quote.deliveryDistanceKm} km)</span><span>Rs {rupees.format(state.quote.deliveryFee)}</span></span>
                  <span className="checkout-quote-line checkout-quote-total"><span>Order total</span><strong>Rs {rupees.format(state.quote.grandTotal)}</strong></span>
                </>
              )}
            </div>
          );
        })}
        {several && total !== null ? (
          <div className="checkout-quote-line checkout-grand-total">
            <span>Total for all {groups.length} orders</span>
            <strong>Rs {rupees.format(total)}</strong>
          </div>
        ) : null}
      </div>

      <h4 className="checkout-step">4. Payment</h4>
      {simulatorEnabled ? (
        <label>
          Payment method
          <select
            disabled={isSubmitting}
            value={gateway}
            onChange={(event) => setGateway(event.target.value as PaymentGateway)}
          >
            <option value="safepay">Safepay</option>
            <option value="jazzcash">JazzCash (local simulation)</option>
            <option value="stripe">Stripe (local simulation)</option>
          </select>
        </label>
      ) : (
        <p className="checkout-hint">
          You&apos;ll pay on Safepay&apos;s secure page with a card or mobile wallet. Farm2Fork never sees your card details.
        </p>
      )}

      <button className="cart-shop-btn" disabled={isSubmitting || !dropoff || !allQuoted} type="submit">
        {submitLabel}
      </button>
      <p className="checkout-hint">
        {several
          ? "Next, you'll pay for each order on Safepay. An order isn't confirmed until it's paid."
          : "Next, you'll pay on Safepay. Your order isn't confirmed until it's paid."}
      </p>

      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
