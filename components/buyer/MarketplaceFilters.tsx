"use client";

import { useState } from "react";
import {
  IcBadgeCheck,
  IcCarrot,
  IcClose,
  IcMango,
  IcMilk,
  IcSliders,
  IcWheat,
  IcGrid,
} from "@/components/icons";
import type { ProductQuery } from "@/lib/buyer/buyer-repository.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";

const CATEGORIES = [
  { value: "", label: "All", Icon: IcGrid },
  { value: "vegetables", label: "Vegetables", Icon: IcCarrot },
  { value: "fruits", label: "Fruits", Icon: IcMango },
  { value: "grains", label: "Grains", Icon: IcWheat },
  { value: "dairy", label: "Dairy", Icon: IcMilk },
] as const;

const GRADES = ["A", "B", "C"] as const;

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "name:asc", label: "Name: A to Z" },
] as const;

/** Filters the shopper has narrowed beyond the default full listing. */
export function activeFilterCount(query: ProductQuery): number {
  return [
    query.search,
    query.category,
    query.qualityGrade,
    query.minPrice,
    query.maxPrice,
    query.verifiedOrigin,
  ].filter((value) => value !== undefined && value !== "").length;
}

function parsePrice(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Search, category, sort and the narrowing filters for the marketplace. All of
 * it is expressed as a `ProductQuery`, so the server does the filtering and
 * the page counts stay true.
 */
export function MarketplaceFilters({
  query,
  total,
  shown,
  loading,
  onChange,
}: {
  query: ProductQuery;
  /** Listings matching the query across all pages, once known. */
  total: number | null;
  /** Listings on the current page. */
  shown: number;
  loading: boolean;
  onChange: (query: ProductQuery) => void;
}) {
  const copy = useBuyerCopy();
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<ProductQuery>) =>
    onChange({ ...query, ...patch, page: 1 });
  const sort = `${query.sortBy ?? "createdAt"}:${query.sortOrder ?? "desc"}`;
  const narrowing = [
    query.qualityGrade,
    query.minPrice,
    query.maxPrice,
    query.verifiedOrigin,
  ].filter((value) => value !== undefined).length;
  const priceBackwards =
    query.minPrice !== undefined &&
    query.maxPrice !== undefined &&
    query.minPrice > query.maxPrice;
  const filtered = activeFilterCount(query) > 0;
  const categoryLabel = CATEGORIES.find(
    (category) => category.value === (query.category ?? ""),
  );

  const chips: Array<{
    key: string;
    label: string;
    clear: Partial<ProductQuery>;
  }> = [];
  if (query.search)
    chips.push({
      key: "search",
      label: `“${query.search}”`,
      clear: { search: undefined },
    });
  if (query.category)
    chips.push({
      key: "category",
      label: copy(categoryLabel?.label ?? query.category),
      clear: { category: undefined },
    });
  if (query.qualityGrade)
    chips.push({
      key: "grade",
      label: copy("Grade {grade}", { grade: query.qualityGrade }),
      clear: { qualityGrade: undefined },
    });
  if (query.minPrice !== undefined || query.maxPrice !== undefined)
    chips.push({
      key: "price",
      label:
        query.minPrice !== undefined && query.maxPrice !== undefined
          ? copy("PKR {min} to {max}", {
              min: query.minPrice,
              max: query.maxPrice,
            })
          : query.minPrice !== undefined
            ? copy("From PKR {min}", { min: query.minPrice })
            : copy("Up to PKR {max}", { max: query.maxPrice ?? 0 }),
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  if (query.verifiedOrigin)
    chips.push({
      key: "verified",
      label: copy("Verified origin"),
      clear: { verifiedOrigin: undefined },
    });

  return (
    <div className="mf">
      <div className="mf-row">
        <input
          aria-label={copy("Search products")}
          className="search-input-field mf-search"
          onChange={(event) => set({ search: event.target.value || undefined })}
          placeholder={copy("Search products")}
          value={query.search ?? ""}
        />
        <select
          aria-label={copy("Sort by")}
          className="mf-sort"
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(":");
            set({ sortBy, sortOrder: sortOrder as "asc" | "desc" });
          }}
          value={sort}
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {copy(option.label)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="mf-toggle"
          aria-expanded={open}
          aria-controls="mf-panel"
          onClick={() => setOpen((value) => !value)}
        >
          <IcSliders size={18} />
          {copy("Filters")}
          {narrowing > 0 ? <b className="mf-count">{narrowing}</b> : null}
        </button>
      </div>

      <div className="mf-cats" role="group" aria-label={copy("Category")}>
        {CATEGORIES.map(({ value, label, Icon }) => {
          const active = (query.category ?? "") === value;
          return (
            <button
              key={value || "all"}
              type="button"
              className="mf-cat"
              aria-pressed={active}
              onClick={() => set({ category: value || undefined })}
            >
              <Icon size={20} />
              {copy(value ? label : "All categories")}
            </button>
          );
        })}
      </div>

      <div className="mf-panel" id="mf-panel" data-open={open}>
        <div className="mf-field">
          <span className="mf-label" id="mf-grade-label">
            {copy("Quality grade")}
          </span>
          <div className="mf-seg" role="group" aria-labelledby="mf-grade-label">
            <button
              type="button"
              aria-pressed={!query.qualityGrade}
              onClick={() => set({ qualityGrade: undefined })}
            >
              {copy("Any")}
            </button>
            {GRADES.map((grade) => (
              <button
                key={grade}
                type="button"
                aria-pressed={query.qualityGrade === grade}
                onClick={() => set({ qualityGrade: grade })}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        <div className="mf-field">
          <span className="mf-label" id="mf-price-label">
            {copy("Price per unit (PKR)")}
          </span>
          <div
            className="mf-price"
            role="group"
            aria-labelledby="mf-price-label"
          >
            <input
              type="number"
              inputMode="numeric"
              min="0"
              aria-label={copy("Lowest price")}
              placeholder={copy("Min")}
              aria-invalid={priceBackwards}
              value={query.minPrice ?? ""}
              onChange={(event) =>
                set({ minPrice: parsePrice(event.target.value) })
              }
            />
            <span aria-hidden="true">–</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              aria-label={copy("Highest price")}
              placeholder={copy("Max")}
              aria-invalid={priceBackwards}
              value={query.maxPrice ?? ""}
              onChange={(event) =>
                set({ maxPrice: parsePrice(event.target.value) })
              }
            />
          </div>
          {priceBackwards ? (
            <span className="mf-warn" role="alert">
              {copy("The lowest price is above the highest price.")}
            </span>
          ) : null}
        </div>

        <label className="mf-verified">
          <input
            type="checkbox"
            checked={query.verifiedOrigin === true}
            onChange={(event) =>
              set({ verifiedOrigin: event.target.checked || undefined })
            }
          />
          <span className="mf-verified-box" aria-hidden="true">
            <IcBadgeCheck size={20} />
          </span>
          <span>
            <strong>{copy("Verified origin only")}</strong>
            <small>
              {copy("Where the produce started is recorded on the ledger.")}
            </small>
          </span>
        </label>
      </div>

      <div className="mf-summary" aria-live="polite">
        <span className="mf-result">
          {loading
            ? copy("Updating results…")
            : total === null
              ? ""
              : total === shown
                ? copy("{count} listings", { count: total })
                : copy("Showing {shown} of {total} listings", {
                    shown,
                    total,
                  })}
        </span>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className="mf-chip"
            aria-label={copy("Remove filter: {filter}", { filter: chip.label })}
            onClick={() => set(chip.clear)}
          >
            {chip.label}
            <IcClose size={14} />
          </button>
        ))}
        {filtered ? (
          <button
            type="button"
            className="mf-clear"
            onClick={() => onChange({ limit: query.limit, page: 1 })}
          >
            {copy("Clear all")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
