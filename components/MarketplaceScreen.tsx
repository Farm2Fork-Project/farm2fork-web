"use client";

import { useState } from "react";
import {
  LuLeaf,
  LuSearch,
  LuShoppingCart,
  LuPlus,
  LuCircleCheckBig,
  LuCarrot,
  LuApple,
  LuWheat,
  LuMilk,
  LuLayoutGrid,
} from "react-icons/lu";
import { PRODUCTS, CATEGORIES, MarketplaceScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

const CAT_ICONS: Record<string, React.ReactNode> = {
  All: <LuLayoutGrid size={24} />,
  Vegetables: <LuCarrot size={24} />,
  Fruits: <LuApple size={24} />,
  Grains: <LuWheat size={24} />,
  Dairy: <LuMilk size={24} />,
};

export default function MarketplaceScreen({
  onViewProduct,
}: MarketplaceScreenProps) {
  const [activeCat, setActiveCat] = useState("All");
  const { t } = useLanguage();

  // Group products by category or return all if 'All' is selected
  const displayedProducts =
    activeCat === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => {
        // A bit of mock matching since 'types.ts' doesn't have a category field on PRODUCTS.
        // Let's assume name matching for the mock:
        if (activeCat === "Vegetables" && (p.name.includes("Onion") || p.name.includes("Spinach") || p.name.includes("Tomato"))) return true;
        if (activeCat === "Fruits" && (p.name.includes("Mango") || p.name.includes("Orange") || p.name.includes("Guava"))) return true;
        if (activeCat === "Grains" && p.name.includes("Maize")) return true;
        if (activeCat === "Dairy" && (p.name.includes("Milk") || p.name.includes("Ghee") || p.name.includes("Yoghurt") || p.name.includes("Doodh") || p.name.includes("Dahi"))) return true;
        // Fallback if it didn't match the hardcoded strings (this handles the mock dataset)
        return false;
      });

  return (
    <>
      <div className="marketplace-search">
        <span className="search-icon">
          <LuSearch size={16} />
        </span>
        <input placeholder={t("marketplace.search")} />
      </div>

      <div className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">{t("marketplace.direct")}</span>
          <h2>{t("marketplace.harvest")}</h2>
          <p>{t("marketplace.discount")}</p>
          <button className="btn btn-primary" style={{ marginTop: "16px", background: "var(--white)", color: "var(--primary-green)", border: "none" }}>
            {t("marketplace.shop")}
          </button>
        </div>
      </div>

      <div className="section-title">
        <h3>{t("marketplace.categories")}</h3>
      </div>
      <div className="category-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-card-visual${activeCat === cat ? " active" : ""}`}
            onClick={() => setActiveCat(cat)}
          >
            <div className="cat-icon-wrapper">
              {CAT_ICONS[cat] || <LuLeaf size={24} />}
            </div>
            <span className="cat-name">{t(`marketplace.${cat.toLowerCase()}` as any)}</span>
          </button>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>{activeCat === "All" ? t("marketplace.trending") : `${t(`marketplace.${activeCat.toLowerCase()}` as any)} ${t("marketplace.products")}`}</h3>
        <span style={{ fontSize: "13px", color: "var(--primary-green)", fontWeight: 600, cursor: "pointer" }}>{t("marketplace.seeAll")}</span>
      </div>

      <div className="mp-product-grid">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((p) => (
            <div
              className="mp-card"
              key={p.id}
              onClick={() => p.available && onViewProduct(p.id)}
              id={`product-${p.id}`}
            >
              <div className="mp-card-img">
                <LuLeaf className="leaf" size={56} />
                <div className="mp-card-grade">
                  <LuCircleCheckBig size={12} /> {t(`grade.${p.grade}`)}
                </div>
                {!p.available && (
                  <div className="mp-card-soldout">{t("marketplace.soldout")}</div>
                )}
              </div>
              <div className="mp-card-body">
                <div className="mp-card-name">{p.name}</div>
                <div className="mp-card-farm">{p.farm}</div>
                <div className="mp-card-footer">
                  <div className="mp-card-price">
                    {p.price.toLocaleString()} {t("marketplace.currency")} <span>/ {t(`unit.${p.unit}`)}</span>
                  </div>
                  <button
                    className="mp-add-btn"
                    disabled={!p.available}
                    aria-label={`Add ${p.name} to cart`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LuPlus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "40px 0", textAlign: "center", gridColumn: "1 / -1", color: "var(--text-muted)" }}>
            <p>{t("marketplace.empty")}</p>
          </div>
        )}
      </div>
    </>
  );
}
