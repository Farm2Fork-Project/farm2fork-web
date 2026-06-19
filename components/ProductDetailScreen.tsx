"use client";

import { useState } from "react";
import {
  LuLeaf,
  LuShoppingCart,
  LuArrowLeft,
  LuPlus,
  LuMinus,
  LuStar,
  LuMapPin,
  LuPackage,
  LuCircleCheckBig,
} from "react-icons/lu";
import { PRODUCTS, ProductDetailScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";


export default function ProductDetailScreen({ productId, onBack }: ProductDetailScreenProps) {
  const [qty, setQty] = useState(1);
  const { t } = useLanguage();
  
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

  return (
    <>
      <button className="pd-back-btn" onClick={onBack}>
        <LuArrowLeft size={18} /> {t("product.back")}
      </button>

      <div className="pd-layout">
        {/* Image */}
        <div className="pd-image">
          <LuLeaf className="leaf" size={100} />
        </div>

        {/* Info */}
        <div className="pd-info">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h1>{product.name}</h1>
            <span className="badge badge-soft-green">{t("product.available")}</span>
          </div>
          <div className="pd-price">{product.price.toLocaleString()} {t("marketplace.currency")} <span>/ {t(`unit.${product.unit}`)}</span></div>

          <div className="pd-tags">
            <span className="pd-tag">
              <LuCircleCheckBig size={14} /> {t(`grade.${product.grade}`)}
            </span>
            <span className="pd-tag">
              <LuPackage size={14} /> 200 {t(`unit.${product.unit}`)}
            </span>
          </div>

          {/* Description */}
          <div className="pd-section">
            <h3>{t("product.descTitle")}</h3>
            <p>
              {t("product.desc")}
            </p>
          </div>

          {/* Farmer Info */}
          <div className="pd-section">
            <h3>{t("product.farmerInfo")}</h3>
            <div className="pd-farmer-row">
              <div className="pd-farmer-avatar">A</div>
              <div>
                <div className="pd-farmer-name">{product.farm}</div>
                <div className="pd-farmer-farm">{product.farm}</div>
              </div>
              <div className="pd-farmer-rating">
                <LuStar size={16} /> 4.8
              </div>
            </div>
            <div className="pd-farmer-meta">
              <span>
                <LuMapPin size={14} /> Multan, Punjab
              </span>
              <span>
                <LuPackage size={14} /> 312 {t("product.sales")}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="pd-quantity">
            <h3>{t("product.qty")}</h3>
            <div className="pd-qty-controls">
              <button
                className="pd-qty-btn"
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
              >
                <LuMinus size={16} />
              </button>
              <span className="pd-qty-value">{qty}</span>
              <button
                className="pd-qty-btn"
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
              >
                <LuPlus size={16} />
              </button>
            </div>
          </div>

          <button className="pd-add-cart" id="add-to-cart-btn">
            <LuShoppingCart size={20} /> {t("product.addCart")}
          </button>
        </div>
      </div>
    </>
  );
}
