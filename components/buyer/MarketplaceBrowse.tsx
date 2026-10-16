"use client";

import { IcSearch } from "@/components/icons";
import type { BuyerProduct } from "@/lib/api/contracts.ts";
import type { ProductQuery } from "@/lib/buyer/buyer-repository.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import { MarketplaceFilters, activeFilterCount } from "./MarketplaceFilters";
import { ProductCard } from "./ProductCard";

const SKELETON_CARDS = 8;

/**
 * The browse half of the marketplace: filters, results and paging. Cards are
 * links to each product's own page (/product/<name>-<id>).
 */
export function MarketplaceBrowse({
  loading,
  onRetry,
  page,
  total,
  totalPages,
  error,
  onAddToCart,
  onQueryChange,
  products,
  query,
}: {
  loading: boolean;
  onRetry: () => void;
  page: number;
  /** Listings matching the query across all pages; null before the first answer. */
  total: number | null;
  totalPages: number;
  error: string | null;
  onAddToCart: (product: BuyerProduct, quantity?: number) => void;
  onQueryChange: (query: ProductQuery) => void;
  products: BuyerProduct[];
  query: ProductQuery;
}) {
  const copy = useBuyerCopy();
  const firstLoad = loading && products.length === 0 && !error;
  const filtered = activeFilterCount(query) > 0;

  return (
    <section className="marketplace-container">
      <div className="marketplace-main-content">
        <MarketplaceFilters
          query={query}
          total={error ? null : total}
          shown={products.length}
          loading={loading}
          onChange={onQueryChange}
        />
        <div className="section-title">
          <h3>{copy("Marketplace")}</h3>
        </div>
        {error ? (
          <div className="flow-state" role="alert">
            <p>{error}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onRetry}
            >
              {copy("Try again")}
            </button>
          </div>
        ) : null}
        {loading ? (
          <p className="sr-only" role="status">
            {copy("Loading products…")}
          </p>
        ) : null}
        {!error && !loading && products.length === 0 ? (
          <div className="empty-state mp-empty">
            <IcSearch size={48} />
            <h2>{copy("No products found")}</h2>
            <p>
              {filtered
                ? copy("Nothing matches these filters. Try removing one.")
                : copy("No produce is listed right now. Check back soon.")}
            </p>
            {filtered ? (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => onQueryChange({ limit: query.limit, page: 1 })}
              >
                {copy("Clear filters")}
              </button>
            ) : null}
          </div>
        ) : null}
        {firstLoad ? (
          <div className="mp-product-grid" aria-hidden="true">
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <div className="mp-skel" key={index}>
                <span className="mp-skel-img" />
                <span className="mp-skel-line" />
                <span className="mp-skel-line mp-skel-short" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="mp-product-grid"
            aria-busy={loading}
            data-stale={loading && products.length > 0}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAddToCart}
              />
            ))}
          </div>
        )}
        {totalPages > 1 ? (
          <nav
            className="flow-pagination"
            aria-label={copy("Marketplace pages")}
          >
            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading || page <= 1}
              onClick={() => onQueryChange({ ...query, page: page - 1 })}
            >
              {copy("Previous")}
            </button>
            <span>
              {copy("Page {page} of {total}", { page, total: totalPages })}
            </span>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => onQueryChange({ ...query, page: page + 1 })}
            >
              {copy("Next")}
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
