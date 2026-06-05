"use client";

import {
  LuShoppingCart,
  LuStore,
} from "react-icons/lu";

import { CartScreenProps } from "./types";
import { useLanguage } from "./LanguageContext";

export default function CartScreen({ onShopNow }: CartScreenProps) {
  const { t } = useLanguage();
  return (
    <>


      <div className="cart-empty">
        <div className="cart-empty-icon">
          <LuShoppingCart size={96} />
        </div>
        <h2>{t("cart.empty")}</h2>
        <p>{t("cart.emptyDesc")}</p>
        <button className="cart-shop-btn" onClick={onShopNow} id="shop-now-btn">
          <LuStore size={18} /> {t("cart.shopNow")}
        </button>
      </div>
    </>
  );
}
