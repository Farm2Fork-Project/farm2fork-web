"use client";

import React, { useState } from "react";
import { 
  Tractor, 
  MapPin, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  Check,
  Search,
  LayoutGrid,
  Carrot,
  Apple,
  Wheat,
  Milk,
  Plus,
  Leaf
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

export interface Listing {
  id: string;
  name: string;
  category: string;
  grade: string;
  price: number;
  unit: string;
  quantity: number;
  status: "Available" | "Out of Stock";
  description: string;
}

interface FarmerListingsProps {
  listings?: Listing[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onAddClick: () => void;
}

const CATEGORIES = [
  { id: "All", label: "All", icon: LayoutGrid },
  { id: "Vegetables", label: "Vegetables", icon: Carrot },
  { id: "Fruits", label: "Fruits", icon: Apple },
  { id: "Grains", label: "Grains", icon: Wheat },
  { id: "Dairy", label: "Dairy", icon: Milk },
];

export default function FarmerListings({
  listings = [],
  onDelete,
  onToggleStatus,
  onAddClick,
}: FarmerListingsProps) {
  const { t } = useLanguage();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesCategory = selectedCategory === "All" || listing.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-in w-full">
      
      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400, textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={22} color="var(--error-red, #EF4444)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
              {t("farmer.listings.deleteTitle")}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              {t("farmer.listings.deleteDesc")}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setDeleteConfirmId(null)}
              >
                {t("farmer.listings.cancel")}
              </button>
              <button
                className="btn"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  background: "var(--error-red, #EF4444)",
                  color: "white",
                }}
                onClick={confirmDelete}
              >
                {t("farmer.listings.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.5px", margin: 0 }}>
          {t("farmer.listings.title")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, margin: 0 }}>
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
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", right: -20, bottom: -40, opacity: 0.08, transform: "rotate(-15deg)" }}>
          <Tractor size={200} />
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tractor size={32} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>{t("farmer.listings.farmName")}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, opacity: 0.85 }}>
                <MapPin size={14} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t("farmer.listings.farmLocation")}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 40, borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 40 }}>
            <div>
              <p style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{t("farmer.listings.rating")}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={18} fill="#F0B429" color="#F0B429" />
                <span style={{ fontSize: 22, fontWeight: 800 }}>4.8</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{t("farmer.listings.salesLog")}</p>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{t("farmer.listings.salesCount")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Categories Section Slider ── */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>
          {t("farmer.listings.filterCategory")}
        </h2>
        <div className="category-row">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            let labelText = cat.label;
            if (cat.id === "All") labelText = t("marketplace.all");
            else if (cat.id === "Vegetables") labelText = t("farmer.create.cat.veg");
            else if (cat.id === "Fruits") labelText = t("farmer.create.cat.fruit");
            else if (cat.id === "Grains") labelText = t("farmer.create.cat.grain");
            else if (cat.id === "Dairy") labelText = t("farmer.create.cat.dairy");

            return (
              <button 
                key={cat.id} 
                className={`category-card-visual${isActive ? " active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="cat-icon-wrapper">
                  <Icon size={24} />
                </div>
                <span className="cat-name">
                  {labelText}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Shelf Action Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
          {t("farmer.listings.showingCount")
            .replace("{filtered}", String(filteredListings.length))
            .replace("{total}", String(listings.length))}
        </h2>
        <span 
          onClick={onAddClick}
          style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color: "var(--primary-green)", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginRight: 16
          }}
        >
          <Plus size={14} strokeWidth={3} /> {t("farmer.listings.addProduct")}
        </span>
      </div>

      {/* ── Empty State / Grid Render Layout ── */}
      {filteredListings.length === 0 ? (
        <div style={{ background: "white", border: "1px solid var(--surface-medium, #E5E7EB)", borderRadius: "var(--radius-xl, 16px)", textAlign: "center", padding: "48px 24px" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: "var(--radius-xl, 12px)",
              background: "var(--primary-green-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Package size={24} color="var(--primary-green)" />
          </div>
          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)", margin: 0 }}>
            {t("farmer.listings.noProducts")}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, margin: 0 }}>
            {t("farmer.listings.noProductsDesc")}
          </p>
        </div>
      ) : (
        <div className="mp-product-grid">
          {filteredListings.map((listing) => {
            const isOutStock = listing.status === "Out of Stock";
            let unitText = listing.unit;
            if (listing.unit === "kg") unitText = t("unit.kg");
            else if (listing.unit === "dozen") unitText = t("unit.dozen");
            else if (listing.unit === "litre" || listing.unit === "liter") unitText = t("unit.litre");
            
            return (
              <div
                key={listing.id}
                className="mp-card"
              >
                <div className="mp-card-img">
                  <Leaf className="leaf" size={56} />
                  <div className="mp-card-grade">
                    <Check size={12} strokeWidth={3} /> {t("farmer.listings.grade").replace("{grade}", listing.grade)}
                  </div>
                  {isOutStock && (
                    <div className="mp-card-soldout">
                      <span>{t("farmer.listings.soldOut")}</span>
                    </div>
                  )}
                </div>

                <div className="mp-card-body">
                  <div className="mp-card-name">{listing.name}</div>
                  <div className="mp-card-farm">
                    {t("farmer.listings.stock")
                      .replace("{qty}", String(listing.quantity))
                      .replace("{unit}", unitText)}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px", marginBottom: 12 }}>
                    {listing.category === "Vegetables" ? t("farmer.create.cat.veg") :
                     listing.category === "Fruits" ? t("farmer.create.cat.fruit") :
                     listing.category === "Grains" ? t("farmer.create.cat.grain") :
                     listing.category === "Dairy" ? t("farmer.create.cat.dairy") : listing.category}
                  </p>
                  
                  <div className="mp-card-footer" style={{ borderTop: "1px solid var(--surface-medium)", paddingTop: "12px" }}>
                    <div className="mp-card-price">
                      {t("farmer.listings.priceUnit").replace("{price}", String(listing.price))} <span>/ {unitText}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => onToggleStatus(listing.id)}
                        title={isOutStock ? t("farmer.listings.soldOut") : "Toggle Status"}
                        className="mp-add-btn"
                        style={{
                          background: isOutStock ? "var(--surface-strong)" : "var(--primary-green-soft)",
                          color: isOutStock ? "var(--text-muted)" : "var(--primary-green)",
                        }}
                      >
                        {isOutStock ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(listing.id)}
                        title={t("farmer.listings.delete")}
                        className="mp-add-btn"
                        style={{
                          background: "#FEE2E2",
                          color: "var(--error-red)",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
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
