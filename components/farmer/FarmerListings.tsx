"use client";

import React, { useEffect, useRef, useState } from "react";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { useLanguage } from "./LanguageContext";
import { resolveApiUrl } from "@/lib/loans/loan-repository.ts";
import {
  IcCarrot as Carrot,
  IcCheck as Check,
  IcClose as X,
  IcEye as Eye,
  IcEyeOff as EyeOff,
  IcGrid as LayoutGrid,
  IcLeaf as Leaf,
  IcMango as Apple,
  IcMapPin as MapPin,
  IcMilk as Milk,
  IcPackage as Package,
  IcPlus as Plus,
  IcSearch as Search,
  IcTractor as Tractor,
  IcTrash as Trash2,
  IcWheat as Wheat,
} from "@/components/icons";

export interface Listing {
  id: string;
  name: string;
  category: string;
  grade: string;
  price: number;
  unit: string;
  quantity: number;
  status: "Available" | "Out of Stock";
  visibility?: "active" | "inactive" | "sold_out";
  description: string;
  /** Public photo URLs, first one is the cover. */
  images?: string[];
  /** Ledger state of the listing's `listed` provenance record. */
  ledger: "pending" | "confirmed" | "failed" | "missing";
}

interface FarmerListingsProps {
  listings?: Listing[];
  /** The farmer's public farm identity, from their own products. */
  farm?: { farmName: string; city?: string; province?: string } | null;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onAddClick: () => void;
  onEdit?: (listing: Listing) => void;
  busyId?: string | null;
}

const CATEGORIES = [
  { id: "All", label: "All", icon: LayoutGrid },
  { id: "Vegetables", label: "Vegetables", icon: Carrot },
  { id: "Fruits", label: "Fruits", icon: Apple },
  { id: "Grains", label: "Grains", icon: Wheat },
  { id: "Dairy", label: "Dairy", icon: Milk },
];

export default function FarmerListings({
  farm,
  listings = [],
  onDelete,
  onToggleStatus,
  onAddClick,
  onEdit,
  busyId,
}: FarmerListingsProps) {
  const { t } = useLanguage();
  const allListings = listings;
  const activeCount = listings.filter((l) => l.status === "Available").length;
  const farmPlace = [farm?.city, farm?.province].filter(Boolean).join(", ");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedListing =
    listings.find((listing) => listing.id === selectedId) ?? null;
  const setSelectedListing = (listing: Listing | null) =>
    setSelectedId(listing?.id ?? null);
  const detailRef = useRef<HTMLElement>(null);
  const openedFromRef = useRef<HTMLElement | null>(null);

  // The detail panel opens in place (not in a dialog): bring it into view and
  // hand it focus; closing returns focus to the card that opened it.
  useEffect(() => {
    if (selectedListing) {
      detailRef.current?.scrollIntoView?.({
        block: "nearest",
        behavior: "smooth",
      });
      detailRef.current?.focus({ preventScroll: true });
    }
  }, [selectedListing]);

  const closeDetail = () => {
    setSelectedListing(null);
    openedFromRef.current?.focus();
  };

  const categoryLabel = (category: string) =>
    category === "Vegetables"
      ? t("farmer.create.cat.veg")
      : category === "Fruits"
        ? t("farmer.create.cat.fruit")
        : category === "Grains"
          ? t("farmer.create.cat.grain")
          : category === "Dairy"
            ? t("farmer.create.cat.dairy")
            : category;
  const unitLabel = (unit: string) =>
    unit === "kg"
      ? t("unit.kg")
      : unit === "dozen"
        ? t("unit.dozen")
        : unit === "litre" || unit === "liter"
          ? t("unit.litre")
          : unit;

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedCategory === "All" ||
      listing.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-in w-full">
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">{t("farmer.listings.title")}</h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginTop: 4,
            margin: 0,
          }}
        >
          {t("farmer.listings.subtitle")}
        </p>
      </div>

      {/* ── Search Input Field ── */}
      <div className="marketplace-search">
        <span className="search-icon">
          <Search size={16} />
        </span>
        <input
          placeholder={t("farmer.listings.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── Farm Profile Hero Banner ── */}
      <div
        style={{
          background: "var(--primary-green-dark)",
          borderRadius: "var(--radius-xl, 16px)",
          padding: "32px 40px",
          color: "white",
          marginBottom: 32,
          boxShadow: "0 4px 20px rgba(23,75,49,0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -20,
            bottom: -40,
            opacity: 0.08,
            transform: "rotate(-15deg)",
          }}
        >
          <Tractor size={200} />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tractor size={32} color="white" />
            </div>
            <div>
              {/* Real farm identity and counts only. This banner used to show a
                  hardcoded "Green Acres Farm / 4.8 / 1,204 sales" to every farmer. */}
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                {farm?.farmName ?? t("farmer.listings.yourFarm")}
              </h2>
              {farmPlace ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                    opacity: 0.85,
                  }}
                >
                  <MapPin size={14} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {farmPlace}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 40,
              borderInlineStart: "1px solid rgba(255,255,255,0.2)",
              paddingInlineStart: 40,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 4,
                }}
              >
                {t("farmer.listings.active")}
              </p>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                {activeCount}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 4,
                }}
              >
                {t("farmer.listings.hidden")}
              </p>
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                {allListings.length - activeCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Categories Section Slider ── */}
      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-dark)",
            marginBottom: 16,
          }}
        >
          {t("farmer.listings.filterCategory")}
        </h2>
        <div className="category-row">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            let labelText = cat.label;
            if (cat.id === "All") labelText = t("marketplace.all");
            else if (cat.id === "Vegetables")
              labelText = t("farmer.create.cat.veg");
            else if (cat.id === "Fruits")
              labelText = t("farmer.create.cat.fruit");
            else if (cat.id === "Grains")
              labelText = t("farmer.create.cat.grain");
            else if (cat.id === "Dairy")
              labelText = t("farmer.create.cat.dairy");

            return (
              <button
                key={cat.id}
                className={`category-card-visual${isActive ? " active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="cat-icon-wrapper">
                  <Icon size={24} />
                </div>
                <span className="cat-name">{labelText}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Shelf Action Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          {t("farmer.listings.showingCount").replace(
            "{count}",
            String(filteredListings.length),
          )}
        </h2>
        <button
          type="button"
          onClick={onAddClick}
          style={{
            color: "var(--primary-green)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: 0,
            padding: "6px 0",
            font: "inherit",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          <Plus size={16} strokeWidth={2.25} />{" "}
          {t("farmer.listings.addProduct")}
        </button>
      </div>

      {/* ── Listing detail, inline ── */}
      {selectedListing ? (
        <section
          ref={detailRef}
          className="fl-detail"
          tabIndex={-1}
          aria-labelledby="fl-detail-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDetail();
          }}
        >
          <div className="fl-detail-head">
            {selectedListing.images?.[0] ? (
              // Photos come from Cloudinary or the API; not optimisable by next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="fl-detail-photo"
                src={resolveApiUrl(selectedListing.images[0])}
                alt=""
              />
            ) : (
              <div className="fl-detail-icon">
                <Leaf size={24} />
              </div>
            )}
            <div className="fl-detail-title">
              <h3 id="fl-detail-title">{selectedListing.name}</h3>
              <p>{categoryLabel(selectedListing.category)}</p>
            </div>
            <button
              type="button"
              className="fl-detail-close"
              onClick={closeDetail}
              aria-label={t("farmer.listings.cancel")}
            >
              <X size={20} />
            </button>
          </div>
          <dl className="fl-detail-grid">
            <div>
              <dt>{t("farmer.listings.price")}</dt>
              <dd>
                Rs. {selectedListing.price} / {unitLabel(selectedListing.unit)}
              </dd>
            </div>
            <div>
              <dt>{t("farmer.listings.gradeLabel")}</dt>
              <dd>
                {t("farmer.listings.grade").replace(
                  "{grade}",
                  selectedListing.grade,
                )}
              </dd>
            </div>
            <div>
              <dt>{t("farmer.listings.stockLabel")}</dt>
              <dd>
                {selectedListing.quantity} {unitLabel(selectedListing.unit)}
              </dd>
            </div>
            <div>
              <dt>{t("farmer.listings.statusLabel")}</dt>
              <dd>
                <span
                  className={
                    selectedListing.status === "Available"
                      ? "fl-status fl-status--ok"
                      : "fl-status fl-status--out"
                  }
                >
                  {selectedListing.status === "Available"
                    ? t("farmer.listings.available")
                    : t("farmer.listings.soldOut")}
                </span>
              </dd>
            </div>
          </dl>
          <div className="fl-detail-desc">
            <h4>{t("farmer.listings.descriptionLabel")}</h4>
            <p>
              {selectedListing.description ||
                t("farmer.listings.noDescription")}
            </p>
          </div>
        </section>
      ) : null}

      {/* ── Empty State / Grid Render Layout ── */}
      {filteredListings.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid var(--surface-medium, #E5E7EB)",
            borderRadius: "var(--radius-xl, 16px)",
            textAlign: "center",
            padding: "48px 24px",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "var(--radius-xl, 12px)",
              background: "var(--primary-green-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Package size={24} color="var(--primary-green)" />
          </div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: "var(--text-dark)",
              margin: 0,
            }}
          >
            {listings.length === 0
              ? t("farmer.listings.emptyTitle")
              : t("farmer.listings.noProducts")}
          </p>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-muted)",
              margin: "6px auto 0",
              maxWidth: 360,
            }}
          >
            {listings.length === 0
              ? t("farmer.listings.emptyDesc")
              : t("farmer.listings.noProductsDesc")}
          </p>
          {listings.length === 0 ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={onAddClick}
            >
              {t("farmer.listings.addProduct")}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mp-product-grid">
          {filteredListings.map((listing) => {
            const isOutStock = listing.visibility
              ? listing.visibility !== "active"
              : listing.status === "Out of Stock";
            let unitText = listing.unit;
            if (listing.unit === "kg") unitText = t("unit.kg");
            else if (listing.unit === "dozen") unitText = t("unit.dozen");
            else if (listing.unit === "litre" || listing.unit === "liter")
              unitText = t("unit.litre");

            return (
              <div
                key={listing.id}
                className="mp-card fl-card"
                onClick={(event) => {
                  openedFromRef.current = event.currentTarget;
                  setSelectedListing(listing);
                }}
              >
                <div className="mp-card-img">
                  {listing.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="mp-card-photo"
                      src={resolveApiUrl(listing.images[0])}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <Leaf className="leaf" size={56} />
                  )}
                  <div className="mp-card-grade">
                    <Check size={12} strokeWidth={3} />{" "}
                    {t("farmer.listings.grade").replace(
                      "{grade}",
                      listing.grade,
                    )}
                  </div>
                  {isOutStock && (
                    <div className="mp-card-soldout">
                      <span>
                        {t(
                          listing.visibility === "inactive"
                            ? "farmer.edit.hidden"
                            : "farmer.listings.soldOut",
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mp-card-body">
                  <div className="mp-card-name">
                    <button
                      type="button"
                      className="fl-open"
                      aria-expanded={selectedListing?.id === listing.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        openedFromRef.current = event.currentTarget;
                        setSelectedListing(listing);
                      }}
                    >
                      {listing.name}
                    </button>
                  </div>
                  <span
                    className={`ledger-chip ledger-chip--${listing.ledger}`}
                  >
                    {t(`farmer.ledger.${listing.ledger}`)}
                  </span>
                  <div className="mp-card-farm">
                    {t("farmer.listings.stock")
                      .replace("{stock}", String(listing.quantity))
                      .replace("{unit}", unitText)}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                      marginBottom: 12,
                    }}
                  >
                    {listing.category === "Vegetables"
                      ? t("farmer.create.cat.veg")
                      : listing.category === "Fruits"
                        ? t("farmer.create.cat.fruit")
                        : listing.category === "Grains"
                          ? t("farmer.create.cat.grain")
                          : listing.category === "Dairy"
                            ? t("farmer.create.cat.dairy")
                            : listing.category}
                  </p>

                  <div
                    className="mp-card-footer"
                    style={{
                      borderTop: "1px solid var(--surface-medium)",
                      paddingTop: "12px",
                    }}
                  >
                    <div className="mp-card-price">
                      {t("farmer.listings.priceUnit").replace(
                        "{price}",
                        String(listing.price),
                      )}{" "}
                      <span>/ {unitText}</span>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {onEdit ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={Boolean(busyId)}
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(listing);
                          }}
                        >
                          {t("farmer.edit.action")}
                        </button>
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(listing.id);
                        }}
                        disabled={Boolean(busyId)}
                        aria-label={t(
                          isOutStock ? "farmer.edit.show" : "farmer.edit.hide",
                        )}
                        title={t(
                          isOutStock ? "farmer.edit.show" : "farmer.edit.hide",
                        )}
                        className="mp-add-btn"
                        style={{
                          background: isOutStock
                            ? "var(--surface-strong)"
                            : "var(--primary-green-soft)",
                          color: isOutStock
                            ? "var(--text-muted)"
                            : "var(--primary-green)",
                        }}
                      >
                        {isOutStock ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <span
                        className="fl-delete-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InlineConfirm
                          busy={Boolean(busyId)}
                          label={t("farmer.listings.delete")}
                          prompt={t("farmer.listings.deleteTitle")}
                          confirmLabel={t("farmer.listings.delete")}
                          onConfirm={() => onDelete(listing.id)}
                          triggerClassName="mp-add-btn fl-delete"
                          icon={<Trash2 size={16} />}
                          iconOnly
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
