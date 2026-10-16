"use client";

import Link from "next/link";
import { IcAlert, IcLeaf, IcStore } from "@/components/icons";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import {
  cartGroupLabel,
  cartTotals,
  type CartChange,
  type CartFarmerGroup,
} from "@/lib/cart/cart.ts";
import { resolveApiUrl } from "@/lib/loans/loan-repository.ts";
import { productPath } from "@/lib/products/slug.ts";
import { CheckoutPanel } from "./CheckoutPanel";
import { farmPlace } from "./farm-label";

const rupees = new Intl.NumberFormat("en-PK");

/**
 * The cart, grouped by farm because each farm is a separate order. It shows
 * what the server said when the cart was opened (stock and price changes), a
 * running total, and the checkout beside it.
 */
export function CartView({
  checkoutBusy,
  onBusyChange,
  groups,
  changes,
  onDismissChanges,
  onQuantity,
  onRemove,
  onBrowse,
  onConfirmedFarmers,
  onViewOrders,
  repository,
  simulatorEnabled,
}: {
  checkoutBusy: boolean;
  onBusyChange: (busy: boolean) => void;
  groups: CartFarmerGroup[];
  /** Differences found when the cart was last checked against live listings. */
  changes: CartChange[];
  onDismissChanges: () => void;
  onQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onBrowse: () => void;
  onConfirmedFarmers: (farmerIds: string[]) => void;
  onViewOrders: () => void;
  repository: Pick<
    BuyerRepository,
    "createOrder" | "initiatePayment" | "quoteOrder"
  >;
  simulatorEnabled: boolean;
}) {
  const copy = useBuyerCopy();
  const all = cartTotals(groups.flatMap((group) => group.items));

  return (
    <section>
      <div className="page-header">
        <h1>{copy("Your cart")}</h1>
        <p>
          {groups.length > 1
            ? copy(
                "Your items come from {count} farms, so they're placed as separate orders. You pay for each one.",
                { count: groups.length },
              )
            : copy(
                "Review your items, then add delivery details to place your order.",
              )}
        </p>
      </div>

      {changes.length > 0 ? (
        <div className="cv-changes" role="status">
          <IcAlert size={22} />
          <div>
            <strong>{copy("Your cart was updated to match the farms.")}</strong>
            <ul>
              {changes.map((change) => (
                <li key={`${change.productId}-${change.kind}`}>
                  {changeText(change, copy)}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onDismissChanges}
          >
            {copy("Dismiss")}
          </button>
        </div>
      ) : null}

      <div className="cart-layout">
        <div className="cart-groups">
          <div className="cv-bar">
            <button
              className="btn btn-secondary"
              type="button"
              disabled={checkoutBusy}
              onClick={onBrowse}
            >
              {copy("Continue shopping")}
            </button>
            {groups.length > 0 ? (
              <>
                <p className="cv-total">
                  <span>
                    {groups.length > 1
                      ? copy("{lines} products from {count} farms", {
                          lines: all.lines,
                          count: groups.length,
                        })
                      : copy("{lines} products from 1 farm", {
                          lines: all.lines,
                        })}
                  </span>
                  <strong>Rs {rupees.format(all.amount)}</strong>
                </p>
                <a className="btn btn-primary cv-jump" href="#checkout">
                  {copy("Continue to delivery")}
                </a>
              </>
            ) : null}
          </div>

          {groups.map((group, index) => {
            const farmer = group.items[0]?.product.farmer;
            const place = farmer ? farmPlace(farmer) : "";
            const totals = cartTotals(group.items);
            return (
              <article
                className="order-card cart-group cv-farm"
                key={group.farmerId}
              >
                <header className="cv-farm-head">
                  <span className="cv-farm-icon" aria-hidden="true">
                    <IcStore size={22} />
                  </span>
                  <div>
                    <h2>{cartGroupLabel(group, index)}</h2>
                    {place ? <p>{place}</p> : null}
                  </div>
                  <span className="cv-farm-count">
                    {copy("{count} products", { count: totals.lines })}
                  </span>
                </header>

                {group.items.map((item) => {
                  const stock = Math.floor(item.product.quantity);
                  const photo = item.product.images[0];
                  return (
                    <div
                      className="order-item-row cv-item"
                      key={item.productId}
                    >
                      <Link
                        className="cv-thumb"
                        href={productPath(item.product)}
                        aria-label={copy("View {name}", {
                          name: item.product.name,
                        })}
                        tabIndex={-1}
                      >
                        {photo ? (
                          // Cloudinary/API photos are not optimisable by next/image.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveApiUrl(photo)}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <IcLeaf size={26} />
                        )}
                      </Link>
                      <div className="cart-item-info">
                        <Link
                          className="cv-name"
                          href={productPath(item.product)}
                        >
                          {item.product.name}
                        </Link>
                        <span>
                          {item.product.price} PKR / {item.product.unit}
                          {item.product.qualityGrade
                            ? ` · ${copy("Grade {grade}", { grade: item.product.qualityGrade })}`
                            : ""}
                        </span>
                        <span>
                          {copy("{quantity} {unit} available", {
                            quantity: item.product.quantity,
                            unit: item.product.unit,
                          })}
                        </span>
                        {item.quantity >= stock ? (
                          <span className="cv-limit">
                            {copy("That is all the farm has right now.")}
                          </span>
                        ) : null}
                      </div>
                      <div className="cart-item-actions">
                        <div
                          className="quantity-control"
                          role="group"
                          aria-label={copy("Quantity for {name}", {
                            name: item.product.name,
                          })}
                        >
                          <button
                            type="button"
                            aria-label={copy("Decrease {name} quantity", {
                              name: item.product.name,
                            })}
                            disabled={checkoutBusy || item.quantity <= 1}
                            onClick={() =>
                              onQuantity(item.productId, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <input
                            type="number"
                            aria-label={copy("{name} quantity", {
                              name: item.product.name,
                            })}
                            min="1"
                            max={stock}
                            step="1"
                            value={item.quantity}
                            disabled={checkoutBusy}
                            onChange={(event) =>
                              onQuantity(
                                item.productId,
                                Number(event.target.value),
                              )
                            }
                          />
                          <button
                            type="button"
                            aria-label={copy("Increase {name} quantity", {
                              name: item.product.name,
                            })}
                            disabled={checkoutBusy || item.quantity >= stock}
                            onClick={() =>
                              onQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <strong>
                          {item.product.price * item.quantity} PKR
                        </strong>
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={checkoutBusy}
                          onClick={() => onRemove(item.productId)}
                          aria-label={copy("Remove {name}", {
                            name: item.product.name,
                          })}
                        >
                          {copy("Remove")}
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="order-item-row cart-group-subtotal">
                  <span>{copy("Items subtotal")}</span>
                  <span>{totals.amount} PKR</span>
                </div>
                <p className="cv-note">
                  {copy(
                    "Delivery and the service fee are added at checkout, once you pin where it should arrive.",
                  )}
                </p>
              </article>
            );
          })}
        </div>
        <CheckoutPanel
          onBusyChange={onBusyChange}
          groups={groups}
          onConfirmedFarmers={onConfirmedFarmers}
          onViewOrders={onViewOrders}
          repository={repository}
          simulatorEnabled={simulatorEnabled}
        />
      </div>
    </section>
  );
}

function changeText(
  change: CartChange,
  copy: (text: string, values?: Record<string, string | number>) => string,
): string {
  switch (change.kind) {
    case "unavailable":
      return copy(
        "{name} is sold out or no longer listed, so it was removed.",
        {
          name: change.name,
        },
      );
    case "less_stock":
      return copy(
        "{name}: only {to} left, so the quantity went from {from} to {to}.",
        {
          name: change.name,
          from: change.from ?? 0,
          to: change.to ?? 0,
        },
      );
    case "price_up":
      return copy("{name}: the price went up from {from} to {to} PKR.", {
        name: change.name,
        from: change.from ?? 0,
        to: change.to ?? 0,
      });
    case "price_down":
      return copy("{name}: the price went down from {from} to {to} PKR.", {
        name: change.name,
        from: change.from ?? 0,
        to: change.to ?? 0,
      });
  }
}
