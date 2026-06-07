"use client";

import React, { useState } from "react";
import { PlusCircle, Leaf, Sparkles, DollarSign, Package } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface CreateListingFormProps {
  onSubmit: (listingData: {
    name: string;
    category: string;
    grade: string;
    description: string;
    price: number;
    unit: string;
    quantity: number;
  }) => void;
  onCancel: () => void;
}

export default function CreateListingForm({ onSubmit, onCancel }: CreateListingFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [grade, setGrade] = useState("A");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantity) return;

    onSubmit({
      name,
      category,
      grade,
      description,
      price: parseFloat(price),
      unit,
      quantity: parseFloat(quantity),
    });
  };

  return (
    <div className="animate-in w-full">

      {/* Page Header — matches all other screens */}
      <div className="page-header mb-8">
        <h1>{t("farmer.create.title")}</h1>
        <p>{t("farmer.create.subtitle")}</p>
      </div>

      {/* Form with Desktop Two-Column Layout */}
      <form onSubmit={handleSubmit}>
        <div className="create-web-layout">

          {/* Left Main Card: Produce Info & Context */}
          <div className="card shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--surface-medium)]">
              <Sparkles size={14} className="text-[var(--primary-green)]" />
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t("farmer.create.specs")}
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col w-full gap-2">
              <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">
                {t("farmer.create.itemTitle")} <span className="text-[var(--error-red)]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t("farmer.create.itemTitlePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>

            {/* Category & Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">{t("farmer.create.category")}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select w-full"
                >
                  <option value="Vegetables">🥦 {t("farmer.create.cat.veg")}</option>
                  <option value="Fruits">🍎 {t("farmer.create.cat.fruit")}</option>
                  <option value="Grains">🌾 {t("farmer.create.cat.grain")}</option>
                  <option value="Dairy">🥛 {t("farmer.create.cat.dairy")}</option>
                </select>
              </div>

              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">{t("farmer.create.grade")}</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="select w-full"
                >
                  <option value="A">{t("farmer.create.grade.A")}</option>
                  <option value="B">{t("farmer.create.grade.B")}</option>
                  <option value="C">{t("farmer.create.grade.C")}</option>
                </select>
              </div>
            </div>

            {/* Summary Context */}
            <div className="flex flex-col w-full gap-2">
              <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">{t("farmer.create.desc")}</label>
              <textarea
                rows={6}
                placeholder={t("farmer.create.descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Right Sidebar: Pricing, Stock, Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)", position: "sticky", top: "24px" }}>

            {/* Pricing & Stock Card */}
            <div className="card shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--surface-medium)]">
                <DollarSign size={14} className="text-[var(--primary-green)]" />
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {t("farmer.create.pricingStock")}
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">
                  {t("farmer.create.price")} <span className="text-[var(--error-red)]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input"
                />
              </div>

              {/* Selling Unit */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">{t("farmer.create.sellingUnit")}</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="select w-full"
                >
                  <option value="kg">{t("farmer.create.unit.kg")}</option>
                  <option value="g">{t("farmer.create.unit.g")}</option>
                  <option value="liter">{t("farmer.create.unit.liter")}</option>
                  <option value="dozen">{t("farmer.create.unit.dozen")}</option>
                  <option value="mound">{t("farmer.create.unit.mound")}</option>
                </select>
              </div>

              {/* Stock Volume */}
              <div className="flex flex-col w-full gap-1.5">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">
                  {t("farmer.create.stock")} <span className="text-[var(--error-red)]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  placeholder={t("farmer.create.stockPlaceholder")}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Actions Card */}
            <div className="card shadow-sm" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="submit"
                className="btn btn-primary w-full justify-center shadow-md font-bold"
                style={{ boxShadow: "0 4px 12px rgba(35, 107, 68, 0.2)", padding: "12px" }}
              >
                <PlusCircle size={16} /> {t("farmer.create.publish")}
              </button>
              <button
                type="button"
                className="btn btn-secondary w-full justify-center"
                style={{ padding: "12px" }}
                onClick={onCancel}
              >
                {t("farmer.create.cancel")}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
