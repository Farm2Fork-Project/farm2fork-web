"use client";
import React, { useState } from "react";
import {
  LuLeaf,
  LuSearch,
  LuPlus,
  LuCircleCheckBig,
  LuCarrot,
  LuApple,
  LuWheat,
  LuMilk,
  LuLayoutGrid,
  LuSlidersHorizontal,
  LuX,
  LuArrowUpDown,
  LuRotateCcw,
} from "react-icons/lu";
import { PRODUCTS, CATEGORIES, MarketplaceScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

const CAT_ICONS: Record<string, React.ReactNode> = {
  All: <LuLayoutGrid size={18} />,
  Vegetables: <LuCarrot size={18} />,
  Fruits: <LuApple size={18} />,
  Grains: <LuWheat size={18} />,
  Dairy: <LuMilk size={18} />,
};

export default function MarketplaceScreen({
  onViewProduct,
}: MarketplaceScreenProps) {
  const { t, language } = useLanguage();
  const isRtl = language === "ur";

  // Filter & Sorting States
  const [activeCat, setActiveCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>(["A", "B"]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleGradeChange = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleClearFilters = () => {
    setActiveCat("All");
    setSearchQuery("");
    setSelectedGrades(["A", "B"]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("latest");
  };

  // Filter Logic
  const displayedProducts = PRODUCTS.filter((p) => {
    // 1. Search Query
    if (
      searchQuery &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.farm.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // 2. Category Match (Mock data based on naming strings)
    if (activeCat !== "All") {
      let catMatch = false;
      const nameLower = p.name.toLowerCase();
      if (activeCat === "Vegetables" && (nameLower.includes("onion") || nameLower.includes("spinach") || nameLower.includes("tomato"))) catMatch = true;
      if (activeCat === "Fruits" && (nameLower.includes("mango") || nameLower.includes("orange") || nameLower.includes("guava"))) catMatch = true;
      if (activeCat === "Grains" && nameLower.includes("maize")) catMatch = true;
      if (activeCat === "Dairy" && (nameLower.includes("milk") || nameLower.includes("ghee") || nameLower.includes("yoghurt") || nameLower.includes("doodh") || nameLower.includes("dahi"))) catMatch = true;
      if (!catMatch) return false;
    }

    // 3. Quality Grades
    if (selectedGrades.length > 0 && !selectedGrades.includes(p.grade)) {
      return false;
    }

    // 4. Price range
    const priceMin = parseFloat(minPrice);
    if (!isNaN(priceMin) && p.price < priceMin) {
      return false;
    }
    const priceMax = parseFloat(maxPrice);
    if (!isNaN(priceMax) && p.price > priceMax) {
      return false;
    }

    // 5. Availability (In Stock Only)
    if (inStockOnly && !p.available) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedProducts = [...displayedProducts].sort((a, b) => {
    if (sortBy === "priceLowHigh") {
      return a.price - b.price;
    }
    if (sortBy === "priceHighLow") {
      return b.price - a.price;
    }
    // "latest" / default (by product ID)
    return a.id - b.id;
  });

  const renderSidebarContent = () => (
    <div className="filter-sidebar-content">
      <div className="sidebar-section-header">
        <h4>{t("marketplace.filters")}</h4>
        <button className="clear-filters-btn" onClick={handleClearFilters}>
          <LuRotateCcw size={12} /> {t("marketplace.clearFilters")}
        </button>
      </div>

      {/* Categories */}
      <div className="sidebar-group">
        <h5>{t("marketplace.categories")}</h5>
        <div className="sidebar-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`sidebar-cat-btn${activeCat === cat ? " active" : ""}`}
              onClick={() => {
                setActiveCat(cat);
                setMobileFiltersOpen(false);
              }}
            >
              <span className="icon">{CAT_ICONS[cat] || <LuLeaf size={16} />}</span>
              <span className="name">{t(`marketplace.${cat.toLowerCase()}` as any)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Grade */}
      <div className="sidebar-group">
        <h5>{t("marketplace.filterGrade")}</h5>
        <div className="checkbox-group">
          {["A", "B"].map((g) => (
            <label key={g} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedGrades.includes(g)}
                onChange={() => handleGradeChange(g)}
              />
              <span>{t(`grade.${g}` as any)} {t("marketplace.grade")}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="sidebar-group">
        <h5>{t("marketplace.filterPrice")} ({t("marketplace.currency")})</h5>
        <div className="price-inputs">
          <input
            type="number"
            placeholder={t("marketplace.minPrice")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="price-input"
          />
          <span className="separator">-</span>
          <input
            type="number"
            placeholder={t("marketplace.maxPrice")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="price-input"
          />
        </div>
      </div>

      {/* Stock Availability */}
      <div className="sidebar-group">
        <label className="checkbox-label toggle-stock">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          <span>{t("marketplace.filterInStock")}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="marketplace-container">
      {/* Desktop Left Sidebar */}
      <aside className="marketplace-desktop-sidebar">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Slide-out Filters */}
      {mobileFiltersOpen && (
        <div className="mobile-filters-drawer-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div className="mobile-filters-drawer" onClick={(e) => e.stopPropagation()} dir={isRtl ? "rtl" : "ltr"}>
            <div className="drawer-header">
              <h3>{t("marketplace.filters")}</h3>
              <button className="close-btn" onClick={() => setMobileFiltersOpen(false)}>
                <LuX size={20} />
              </button>
            </div>
            <div className="drawer-body">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}

      {/* Right Main Content Area */}
      <div className="marketplace-main-content">
        {/* Top Controls Row */}
        <div className="marketplace-controls-row">
          <div className="search-field-wrapper">
            <span className="search-icon">
              <LuSearch size={16} />
            </span>
            <input
              type="text"
              placeholder={t("marketplace.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>

          <div className="controls-right-actions">
            <button
              className="mobile-filters-trigger"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <LuSlidersHorizontal size={16} />
              <span>{t("marketplace.mobileFilters")}</span>
            </button>

            <div className="sort-wrapper">
              <span className="sort-icon"><LuArrowUpDown size={14} /></span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown-field"
                aria-label={t("marketplace.sortBy")}
              >
                <option value="latest">{t("marketplace.sortLatest")}</option>
                <option value="priceLowHigh">{t("marketplace.sortPriceLowHigh")}</option>
                <option value="priceHighLow">{t("marketplace.sortPriceHighLow")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="hero-content">
            <span className="hero-badge">{t("marketplace.direct")}</span>
            <h2>{t("marketplace.harvest")}</h2>
            <p>{t("marketplace.discount")}</p>
            <button
              className="btn btn-primary"
              style={{
                marginTop: "16px",
                background: "var(--white)",
                color: "var(--primary-green)",
                border: "none",
              }}
              onClick={handleClearFilters}
            >
              {t("marketplace.shop")}
            </button>
          </div>
        </div>

        {/* Dynamic Grid Results */}
        <div className="section-title" style={{ marginTop: "24px" }}>
          <h3>
            {activeCat === "All"
              ? t("marketplace.trending")
              : `${t(`marketplace.${activeCat.toLowerCase()}` as any)} ${t("marketplace.products")}`}
          </h3>
        </div>

        <div className="mp-product-grid">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((p) => (
              <div
                className="mp-card"
                key={p.id}
                onClick={() => p.available && onViewProduct(p.id)}
                id={`product-${p.id}`}
              >
                <div className="mp-card-img">
                  <LuLeaf className="leaf" size={56} />
                  <div className="mp-card-grade">
                    <LuCircleCheckBig size={12} /> {t(`grade.${p.grade}` as any)}
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
                      {p.price.toLocaleString()} {t("marketplace.currency")} <span>/ {t(`unit.${p.unit}` as any)}</span>
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
            <div
              style={{
                padding: "64px 0",
                textAlign: "center",
                gridColumn: "1 / -1",
                color: "var(--text-muted)",
              }}
            >
              <p>{t("marketplace.empty")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
