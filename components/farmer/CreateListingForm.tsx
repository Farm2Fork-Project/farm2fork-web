"use client";

import { useDirtyGuard } from "@/lib/account/use-dirty-guard";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { resolveApiUrl } from "@/lib/loans/loan-repository";
import { useLanguage } from "./LanguageContext";
import AiListingAssistant, {
  type AiAssistantClient,
} from "./AiListingAssistant";
import type {
  CreateFarmerProductRequest,
  FarmerProductUnit,
} from "@/lib/api/contracts.ts";
import {
  IcClose as X,
  IcCoin as DollarSign,
  IcPlus as Plus,
  IcPlusCircle as PlusCircle,
  IcSparkles as Sparkles,
} from "@/components/icons";

interface CreateListingFormProps {
  onSubmit: (
    listingData: Partial<CreateFarmerProductRequest> & {
      expectedQuantity?: number;
      status?: "active" | "inactive";
    },
  ) => Promise<void>;
  onCancel: () => void;
  initialListing?: CreateFarmerProductRequest;
  initialVisibility?: "active" | "inactive" | "sold_out";
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  /** Enables the AI price/quality assistant when provided. */
  aiClient?: AiAssistantClient;
  /** Uploads listing photos and resolves with their public URLs. */
  onUploadPhotos?: (photos: File[]) => Promise<string[]>;
}

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoDraft {
  file: File;
  preview: string;
}

export default function CreateListingForm({
  onSubmit,
  onCancel,
  aiClient,
  onUploadPhotos,
  initialListing,
  initialVisibility = "active",
  onDirtyChange,
  onBusyChange,
}: CreateListingFormProps) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(initialVisibility === "active");
  const [name, setName] = useState(initialListing?.name ?? "");
  const [category, setCategory] = useState(
    initialListing
      ? initialListing.category.charAt(0).toUpperCase() +
          initialListing.category.slice(1)
      : "Vegetables",
  );
  const [grade, setGrade] = useState<string>(
    initialListing?.qualityGrade ?? "A",
  );
  const appliedAiGrade = useRef<{ manual: string; applied: string } | null>(
    null,
  );
  const invalidateAiGrade = useCallback(() => {
    const previous = appliedAiGrade.current;
    appliedAiGrade.current = null;
    if (previous) {
      setGrade((current) =>
        current === previous.applied ? previous.manual : current,
      );
    }
  }, []);
  const [price, setPrice] = useState(
    initialListing ? String(initialListing.price) : "",
  );
  const [unit, setUnit] = useState<FarmerProductUnit>(
    initialListing?.unit ?? "kg",
  );
  const [quantity, setQuantity] = useState(
    initialListing ? String(initialListing.quantity) : "",
  );
  const [description, setDescription] = useState(
    initialListing?.description ?? "",
  );
  const [savedImages, setSavedImages] = useState(initialListing?.images ?? []);
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photosRef = useRef<PhotoDraft[]>([]);
  photosRef.current = photos;

  const dirty =
    visible !== (initialVisibility === "active") ||
    name !== (initialListing?.name ?? "") ||
    description !== (initialListing?.description ?? "") ||
    price !== (initialListing ? String(initialListing.price) : "") ||
    quantity !== (initialListing ? String(initialListing.quantity) : "") ||
    photos.length > 0 ||
    JSON.stringify(savedImages) !==
      JSON.stringify(initialListing?.images ?? []) ||
    category.toLowerCase() !== (initialListing?.category ?? "vegetables") ||
    grade !== (initialListing?.qualityGrade ?? "A") ||
    unit !== (initialListing?.unit ?? "kg");
  const guard = useDirtyGuard(dirty, (href) => {
    window.location.assign(href);
  });
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(isSubmitting);
  }, [isSubmitting, onBusyChange]);

  // Previews are object URLs; release them when the form goes away.
  useEffect(
    () => () =>
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview)),
    [],
  );

  const addPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError(t("farmer.create.photoInvalid"));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(t("farmer.create.photoTooBig"));
      return;
    }
    setPhotoError("");
    setPhotos((list) =>
      list.length + savedImages.length >= MAX_PHOTOS
        ? list
        : [...list, { file, preview: URL.createObjectURL(file) }],
    );
  };

  const removePhoto = (draft: PhotoDraft) => {
    URL.revokeObjectURL(draft.preview);
    setPhotoError("");
    setPhotos((list) => list.filter((photo) => photo !== draft));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (
      !name.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) < (initialListing ? 0 : 0.1)
    ) {
      setError(t("farmer.create.invalid"));
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      let images: string[] = savedImages;
      if (photos.length && onUploadPhotos) {
        try {
          images = [
            ...savedImages,
            ...(await onUploadPhotos(photos.map((photo) => photo.file))),
          ];
          setSavedImages(images);
          photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
          setPhotos([]);
        } catch (uploadError) {
          throw new Error(
            uploadError instanceof Error && uploadError.message
              ? uploadError.message
              : t("farmer.create.photoUploadFailed"),
          );
        }
      }
      const values = {
        ...(initialListing
          ? { status: visible ? ("active" as const) : ("inactive" as const) }
          : {}),
        name: name.trim(),
        category: category.toLowerCase(),
        ...(description.trim() || initialListing
          ? { description: description.trim() }
          : {}),
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        unit,
        qualityGrade: grade as "A" | "B" | "C",
        ...(images.length || initialListing ? { images } : {}),
      };
      if (initialListing) {
        const changes: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(values)) {
          if (key === "status" && visible === (initialVisibility === "active"))
            continue;
          const original =
            key === "status"
              ? initialVisibility
              : initialListing[key as keyof CreateFarmerProductRequest];
          if (
            JSON.stringify(value) !==
            JSON.stringify(
              original ??
                (key === "images" ? [] : key === "description" ? "" : original),
            )
          )
            changes[key] = value;
        }
        if ("quantity" in changes)
          changes.expectedQuantity = initialListing.quantity;
        await onSubmit(changes);
      } else {
        await onSubmit(values);
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not publish this listing.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in w-full pb-12">
      {/* Page Header */}
      <div className="page-header mb-8 mt-4">
        <h1>
          {t(initialListing ? "farmer.edit.title" : "farmer.create.title")}
        </h1>
        <p className="text-gray-500 text-sm">
          {t(
            initialListing ? "farmer.edit.subtitle" : "farmer.create.subtitle",
          )}
        </p>
      </div>

      {guard.pendingHref ? (
        <div className="flow-notice">
          <p>{t("farmer.edit.unsaved")}</p>
          <button className="btn btn-secondary" onClick={guard.stay}>
            {t("farmer.edit.keep")}
          </button>
          <button
            className="btn btn-danger-solid"
            onClick={() => guard.leave()}
          >
            {t("farmer.edit.discard")}
          </button>
        </div>
      ) : null}
      {/* Two-Column Form Layout */}
      <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="flow-fieldset">
          {error ? (
            <div className="auth-error" role="alert">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col md:flex-row gap-6 w-full items-start">
            {/* Left Column: Produce Specifications */}
            <div className="card shadow-sm flex flex-col gap-6 w-full flex-1 p-6 md:p-8 rounded-xl bg-white border border-gray-100">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Sparkles size={20} className="text-[var(--primary-green)]" />
                <h3 className="text-base font-semibold text-gray-900 m-0">
                  {t("farmer.create.specs")}
                </h3>
              </div>

              {/* Title */}
              <div className="flex flex-col w-full gap-2">
                <label
                  htmlFor="farmer-product-name"
                  className="text-sm font-semibold text-gray-800"
                >
                  {t("farmer.create.itemTitle")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="farmer-product-name"
                  type="text"
                  required
                  placeholder={t("farmer.create.itemTitlePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                />
              </div>

              {/* Category & Grade */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col w-full gap-2">
                  <label
                    htmlFor="farmer-product-category"
                    className="text-sm font-semibold text-gray-800"
                  >
                    {t("farmer.create.category")}
                  </label>
                  <select
                    id="farmer-product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select w-full py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                  >
                    <option value="Vegetables">
                      {t("farmer.create.cat.veg")}
                    </option>
                    <option value="Fruits">
                      {t("farmer.create.cat.fruit")}
                    </option>
                    <option value="Grains">
                      {t("farmer.create.cat.grain")}
                    </option>
                    <option value="Dairy">
                      {t("farmer.create.cat.dairy")}
                    </option>
                  </select>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <label
                    htmlFor="farmer-product-grade"
                    className="text-sm font-semibold text-gray-800"
                  >
                    {t("farmer.create.grade")}
                  </label>
                  <select
                    id="farmer-product-grade"
                    value={grade}
                    onChange={(e) => {
                      appliedAiGrade.current = null;
                      setGrade(e.target.value);
                    }}
                    className="select w-full py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                  >
                    <option value="A">{t("farmer.create.grade.A")}</option>
                    <option value="B">{t("farmer.create.grade.B")}</option>
                    <option value="C">{t("farmer.create.grade.C")}</option>
                  </select>
                </div>
              </div>

              {/* Summary Context */}
              <div className="flex flex-col w-full gap-2">
                <label
                  htmlFor="farmer-product-description"
                  className="text-sm font-semibold text-gray-800"
                >
                  {t("farmer.create.desc")}
                </label>
                <textarea
                  id="farmer-product-description"
                  rows={8}
                  placeholder={t("farmer.create.descPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none font-sans leading-relaxed py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                />
              </div>

              {/* Photos */}
              {onUploadPhotos ? (
                <div className="flex flex-col w-full gap-2">
                  <span
                    id="farmer-product-photos-label"
                    className="text-sm font-semibold text-gray-800"
                  >
                    {t("farmer.create.photos")}
                  </span>
                  <div
                    className="lc-photos"
                    role="group"
                    aria-labelledby="farmer-product-photos-label"
                  >
                    {savedImages.map((url, index) => (
                      <div key={url} className="lc-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveApiUrl(url)}
                          alt={`${name} ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="lc-photo-remove"
                          aria-label={`${t("farmer.create.removePhoto")}: ${index + 1}`}
                          onClick={() =>
                            setSavedImages((current) =>
                              current.filter((image) => image !== url),
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                        {index > 0 ? (
                          <button
                            type="button"
                            className="photo-cover-btn"
                            onClick={() =>
                              setSavedImages((current) => [
                                url,
                                ...current.filter((image) => image !== url),
                              ])
                            }
                          >
                            {t("farmer.edit.cover")}
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {photos.map((photo) => (
                      <div key={photo.preview} className="lc-photo">
                        {/* Local object-URL preview; not optimisable by next/image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.preview} alt={photo.file.name} />
                        <button
                          type="button"
                          className="lc-photo-remove"
                          aria-label={`${t("farmer.create.removePhoto")}: ${photo.file.name}`}
                          onClick={() => removePhoto(photo)}
                          disabled={isSubmitting}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {photos.length + savedImages.length < MAX_PHOTOS ? (
                      <label className="lc-photo-add">
                        <Plus size={20} aria-hidden="true" />
                        <span>{t("farmer.create.addPhoto")}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          aria-label={t("farmer.create.addPhoto")}
                          disabled={isSubmitting}
                          onChange={(event) => {
                            addPhoto(event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 m-0">
                    {t("farmer.create.photosHint")}
                  </p>
                  {photoError ? (
                    <p role="alert" className="text-error m-0">
                      {photoError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Right Column: Pricing & Actions */}
            <div className="w-full md:w-[280px] lg:w-[340px] flex-shrink-0 flex flex-col gap-5">
              {aiClient ? (
                <AiListingAssistant
                  client={aiClient}
                  productName={name}
                  category={category}
                  unit={unit}
                  grade={grade as "A" | "B" | "C"}
                  onApplyPrice={(value) => setPrice(String(value))}
                  onApplyGrade={(value) => {
                    appliedAiGrade.current = {
                      manual: appliedAiGrade.current?.manual ?? grade,
                      applied: value,
                    };
                    setGrade(value);
                  }}
                  onInvalidateGrade={invalidateAiGrade}
                />
              ) : null}

              {/* Pricing & Stock Card */}
              <div className="card shadow-sm flex flex-col gap-5 p-6 rounded-xl bg-white border border-gray-100">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <DollarSign
                    size={20}
                    className="text-[var(--primary-green)]"
                  />
                  <h3 className="text-base font-semibold text-gray-900 m-0">
                    {t("farmer.create.pricingStock")}
                  </h3>
                </div>

                {/* Price */}
                <div className="flex flex-col w-full gap-2">
                  <label
                    htmlFor="farmer-product-price"
                    className="text-sm font-semibold text-gray-800"
                  >
                    {t("farmer.create.price")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="farmer-product-price"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input w-full py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                  />
                </div>

                {/* Selling Unit */}
                <div className="flex flex-col w-full gap-2">
                  <label
                    htmlFor="farmer-product-unit"
                    className="text-sm font-semibold text-gray-800"
                  >
                    {t("farmer.create.sellingUnit")}
                  </label>
                  <select
                    id="farmer-product-unit"
                    value={unit}
                    onChange={(e) =>
                      setUnit(e.target.value as FarmerProductUnit)
                    }
                    className="select w-full py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                  >
                    <option value="kg">{t("farmer.create.unit.kg")}</option>
                    <option value="ton">Ton</option>
                    <option value="litre">
                      {t("farmer.create.unit.liter")}
                    </option>
                    <option value="dozen">
                      {t("farmer.create.unit.dozen")}
                    </option>
                    <option value="piece">Piece</option>
                  </select>
                </div>

                {/* Stock Volume */}
                <div className="flex flex-col w-full gap-2">
                  <label
                    htmlFor="farmer-product-quantity"
                    className="text-sm font-semibold text-gray-800"
                  >
                    {t("farmer.create.stock")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="farmer-product-quantity"
                    type="number"
                    required
                    min={initialListing ? "0" : "0.1"}
                    step="any"
                    placeholder={t("farmer.create.stockPlaceholder")}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input py-3 px-4 text-base rounded-xl border-gray-300 focus:border-[var(--primary-green)] bg-white"
                  />
                </div>
              </div>

              {initialListing ? (
                <label className="listing-visibility">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(event) => setVisible(event.target.checked)}
                  />
                  {t("farmer.edit.show")}
                </label>
              ) : null}
              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  className="btn flex-1 py-3.5 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-bold rounded-xl transition-colors text-base"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {t("farmer.create.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 font-bold shadow-sm hover:shadow-md rounded-xl transition-all text-base border-none bg-[#1F6E43] text-white hover:bg-[#185534]"
                >
                  <PlusCircle size={20} />{" "}
                  {t(
                    isSubmitting
                      ? "farmer.create.saving"
                      : initialListing
                        ? "farmer.edit.save"
                        : "farmer.create.publish",
                  )}
                </button>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
