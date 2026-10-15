"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { IcBadgeCheck, IcLeaf, IcPlus } from "@/components/icons";
import type { BuyerProduct } from "@/lib/api/contracts.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import { resolveApiUrl } from "@/lib/loans/loan-repository.ts";
import { productPath } from "@/lib/products/slug.ts";
import { farmLabel } from "./farm-label";

/**
 * One listing in a grid: photo, grade, whether its origin is on the ledger,
 * the farm, what is left and the price. Opening and adding are separate
 * actions so a shopper can fill a cart without leaving the grid.
 */
export function ProductCard({
  product,
  onAdd,
  revealIndex,
}: {
  product: BuyerProduct;
  onAdd: (product: BuyerProduct) => void;
  /** Staggers a scroll reveal; omit for grids that re-render on filter. */
  revealIndex?: number;
}) {
  const copy = useBuyerCopy();
  const unavailable = product.status !== "active" || product.quantity < 1;
  const reveal =
    revealIndex === undefined
      ? {}
      : { "data-reveal": true, style: { "--i": revealIndex } as CSSProperties };

  return (
    <article className="mp-card" {...reveal}>
      <Link
        className="mp-card-img"
        href={productPath(product)}
        aria-label={copy("View {name}", { name: product.name })}
      >
        {product.images[0] ? (
          // Photos come from Cloudinary or the API; not optimisable by next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="mp-card-photo"
            src={resolveApiUrl(product.images[0])}
            alt=""
            loading="lazy"
          />
        ) : (
          <IcLeaf className="leaf" size={56} />
        )}
        <span className="mp-card-grade">
          {product.qualityGrade
            ? copy("Grade {grade}", { grade: product.qualityGrade })
            : copy("Ungraded")}
        </span>
        {product.originLedgerStatus === "confirmed" ? (
          <span className="mp-card-verified">
            <IcBadgeCheck size={14} />
            {copy("Verified origin")}
          </span>
        ) : null}
        {unavailable ? (
          <span className="mp-card-soldout">{copy("Sold out")}</span>
        ) : null}
      </Link>
      <div className="mp-card-body">
        <Link
          className="mp-card-name mp-card-name-btn"
          href={productPath(product)}
        >
          {product.name}
        </Link>
        {product.farmer ? (
          <div className="mp-card-farm">{farmLabel(product.farmer)}</div>
        ) : null}
        <div className="mp-card-stock">
          {unavailable
            ? copy("Not available right now")
            : copy("{quantity} {unit} available", {
                quantity: product.quantity,
                unit: product.unit,
              })}
        </div>
        <div className="mp-card-footer">
          <div className="mp-card-price">
            {product.price.toLocaleString()} PKR / {product.unit}
          </div>
          <button
            aria-label={copy("Add {name} to cart", { name: product.name })}
            className="mp-add-btn"
            disabled={unavailable}
            onClick={() => onAdd(product)}
            type="button"
          >
            <IcPlus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
