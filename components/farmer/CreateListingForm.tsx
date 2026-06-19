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
    <div className="animate-in w-full pb-12">

      {/* Page Header */}
      <div className="page-header mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("farmer.create.title")}</h1>
        <p className="text-gray-500 text-sm">{t("farmer.create.subtitle")}</p>
      </div>

      {/* Two-Column Form Layout */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-6 w-full items-start">
          
          {/* Left Column: Produce Specifications */}
          <div className="card shadow-sm flex flex-col gap-6 w-full flex-1 p-6 md:p-8 rounded-xl bg-white border border-gray-100">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Sparkles size={16} className="text-[var(--primary-green)]" />
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider m-0">
                {t("farmer.create.specs")}
              </h3>
            </div>

            {/* Title */}
            <div className="flex flex-col w-full gap-2">
              <label className="text-xs font-bold text-gray-700 tracking-wide">
                {t("farmer.create.itemTitle")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t("farmer.create.itemTitlePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input py-2.5 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
              />
            </div>

            {/* Category & Grade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide">{t("farmer.create.category")}</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="select w-full py-2.5 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
                >
                  <option value="Vegetables">{t("farmer.create.cat.veg")}</option>
                  <option value="Fruits">{t("farmer.create.cat.fruit")}</option>
                  <option value="Grains">{t("farmer.create.cat.grain")}</option>
                  <option value="Dairy">{t("farmer.create.cat.dairy")}</option>
                </select>
              </div>
              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide">{t("farmer.create.grade")}</label>
                <select 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)} 
                  className="select w-full py-2.5 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
                >
                  <option value="A">{t("farmer.create.grade.A")}</option>
                  <option value="B">{t("farmer.create.grade.B")}</option>
                  <option value="C">{t("farmer.create.grade.C")}</option>
                </select>
              </div>
            </div>

            {/* Summary Context */}
            <div className="flex flex-col w-full gap-2">
              <label className="text-xs font-bold text-gray-700 tracking-wide">{t("farmer.create.desc")}</label>
              <textarea
                rows={8}
                placeholder={t("farmer.create.descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none font-sans leading-relaxed py-3 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
              />
            </div>
          </div>

          {/* Right Column: Pricing & Actions */}
          <div className="w-full md:w-[280px] lg:w-[340px] flex-shrink-0 flex flex-col gap-5 sticky top-6">
            
            {/* Pricing & Stock Card */}
            <div className="card shadow-sm flex flex-col gap-5 p-6 rounded-xl bg-white border border-gray-100">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <DollarSign size={16} className="text-[var(--primary-green)]" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider m-0">
                  {t("farmer.create.pricingStock")}
                </h3>
              </div>

              {/* Price */}
              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide">
                  {t("farmer.create.price")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" required min="1" placeholder="0"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                  className="input w-full py-2.5 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
                />
              </div>

              {/* Selling Unit */}
              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide">{t("farmer.create.sellingUnit")}</label>
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)} 
                  className="select w-full py-2.5 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
                >
                  <option value="kg">{t("farmer.create.unit.kg")}</option>
                  <option value="g">{t("farmer.create.unit.g")}</option>
                  <option value="liter">{t("farmer.create.unit.liter")}</option>
                  <option value="dozen">{t("farmer.create.unit.dozen")}</option>
                  <option value="mound">{t("farmer.create.unit.mound")}</option>
                </select>
              </div>

              {/* Stock Volume */}
              <div className="flex flex-col w-full gap-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide">
                  {t("farmer.create.stock")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" required min="0.1" step="any"
                  placeholder={t("farmer.create.stockPlaceholder")}
                  value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  className="input py-2.5 px-4 text-sm rounded-lg border-gray-200 focus:border-[var(--primary-green)] bg-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                className="btn flex-1 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-bold rounded-lg transition-colors text-sm"
                onClick={onCancel}
              >
                {t("farmer.create.cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-bold shadow-sm hover:shadow-md rounded-lg transition-all text-sm border-none bg-[#1F6E43] text-white hover:bg-[#185534]"
              >
                <PlusCircle size={16} /> {t("farmer.create.publish")}
              </button>
            </div>
            
          </div>
        </div>
      </form>
    </div>
  );
}
