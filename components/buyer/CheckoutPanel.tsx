"use client";

import { FormEvent, useEffect, useState } from "react";
import { IcCart, IcCheckCircle } from "@/components/icons";
import { paymentSimulatorEnabled, safepayCheckoutUrl } from "@/lib/buyer/payment-checkout.ts";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import type { CartFarmerGroup } from "@/lib/cart/cart.ts";
import { toCreateOrderRequest } from "@/lib/cart/cart.ts";
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

    for (const group of groups) {
      try {
        const order = await repository.createOrder(
          toCreateOrderRequest(group, { ...address, lat: dropoff.lat, lng: dropoff.lng }),
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

      <fieldset disabled={isSubmitting} style={{ border: 0, margin: 0, padding: 0 }}>
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
        <strong>Drop-off location</strong>
        <MapPinPicker value={dropoff} onChange={setDropoff} purpose="dropoff" disabled={isSubmitting} />
      </div>

      </fieldset>

      <div className="checkout-quotes" aria-live="polite">
        {groups.map((group, index) => {
          const state = quotes[`${pinKey}|${group.farmerId}`];
          const label =
            group.items[0]?.product.farmer?.farmName ?? `Order ${index + 1}`;
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
                <span>
                  Items Rs {rupees.format(state.quote.totalAmount)} + fee Rs{" "}
                  {rupees.format(state.quote.platformFeeAmount)} + delivery Rs{" "}
                  {rupees.format(state.quote.deliveryFee)} ({state.quote.deliveryDistanceKm} km) ={" "}
                  <strong>Rs {rupees.format(state.quote.grandTotal)}</strong>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <label>
        Payment gateway
        <select
          disabled={isSubmitting}
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

      <button className="cart-shop-btn" disabled={isSubmitting || !dropoff || !groups.every((group) => quotes[`${pinKey}|${group.farmerId}`]?.kind === "ready")} type="submit">
        {isSubmitting ? "Placing orders…" : "Place orders"}
      </button>

      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
