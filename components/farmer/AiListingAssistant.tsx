"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Info, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import {
  ApiError,
  GRADABLE_CROPS,
  type AiStatus,
  type FarmerProductUnit,
  type GradableCrop,
  type PriceSuggestion,
  type PriceSuggestionRequest,
  type QualityCheckResult,
} from "@/lib/api/contracts.ts";

export type AiAssistantClient = {
  aiStatus(): Promise<AiStatus>;
  suggestPrice(input: PriceSuggestionRequest): Promise<PriceSuggestion>;
  checkQuality(photo: File, crop: GradableCrop): Promise<QualityCheckResult>;
};

type Props = {
  client: AiAssistantClient;
  productName: string;
  category: string;
  unit: FarmerProductUnit;
  grade: "A" | "B" | "C";
  onApplyPrice: (price: number) => void;
  onApplyGrade: (grade: "A" | "B" | "C") => void;
};

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Best guess of the crop from what the farmer typed, to pre-select it. */
function guessCrop(productName: string): GradableCrop | "" {
  const text = productName.toLowerCase();
  return GRADABLE_CROPS.find((crop) => text.includes(crop)) ?? "";
}

/**
 * Farmer-facing AI help while creating a listing: a price range from the
 * rule-based estimator and a photo quality check from the grading model.
 * Both are suggestions the farmer applies explicitly; neither is ever
 * presented as more certain than it is (rule-based price, untrained model).
 */
export default function AiListingAssistant({
  client,
  productName,
  category,
  unit,
  grade,
  onApplyPrice,
  onApplyGrade,
}: Props) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [price, setPrice] = useState<PriceSuggestion | null>(null);
  const [priceError, setPriceError] = useState("");
  const [pricing, setPricing] = useState(false);
  const [crop, setCrop] = useState<GradableCrop | "">("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityCheckResult | null>(null);
  const [qualityError, setQualityError] = useState("");
  const [grading, setGrading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const money = new Intl.NumberFormat(language === "ur" ? "ur-PK" : "en-PK", {
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    let active = true;
    client
      .aiStatus()
      .then((result) => active && setStatus(result))
      .catch(() => active && setStatus({ available: false }));
    return () => {
      active = false;
    };
  }, [client]);

  const errorText = (error: unknown) =>
    error instanceof ApiError && error.status === 503
      ? t("farmer.ai.unavailable")
      : error instanceof ApiError && error.status === 429
        ? t("farmer.ai.tooMany")
        : error instanceof ApiError && error.message
          ? error.message
          : t("farmer.ai.failed");

  const requestPrice = async () => {
    if (!productName.trim()) {
      setPriceError(t("farmer.ai.needName"));
      return;
    }
    setPricing(true);
    setPriceError("");
    try {
      setPrice(
        await client.suggestPrice({
          productName: productName.trim(),
          category: category.toLowerCase(),
          unit,
          qualityGrade: grade,
        }),
      );
    } catch (error) {
      setPrice(null);
      setPriceError(
        error instanceof ApiError && error.status === 422
          ? t("farmer.ai.priceNoRule")
          : errorText(error),
      );
    } finally {
      setPricing(false);
    }
  };

  const requestQuality = async () => {
    const selectedCrop = crop || guessCrop(productName);
    if (!selectedCrop) {
      setQualityError(t("farmer.ai.needCrop"));
      return;
    }
    if (!photo) {
      setQualityError(t("farmer.ai.needPhoto"));
      return;
    }
    setGrading(true);
    setQualityError("");
    try {
      setQuality(await client.checkQuality(photo, selectedCrop));
    } catch (error) {
      setQuality(null);
      setQualityError(errorText(error));
    } finally {
      setGrading(false);
    }
  };

  const onPhoto = (file: File | undefined) => {
    setQuality(null);
    setQualityError("");
    if (!file) return setPhoto(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhoto(null);
      return setQualityError(t("farmer.ai.photoType"));
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhoto(null);
      return setQualityError(t("farmer.ai.photoSize"));
    }
    setPhoto(file);
  };

  const midpoint = price
    ? Math.round((price.predictedMinPrice + price.predictedMaxPrice) / 2)
    : 0;
  const untrained = status?.qualityModel === "untrained";

  return (
    <section className="card ai-assist" aria-labelledby="ai-assist-title">
      <div className="ai-assist-head">
        <Sparkles size={16} aria-hidden="true" />
        <h3 id="ai-assist-title">{t("farmer.ai.title")}</h3>
      </div>

      {status && !status.available ? (
        <p className="ai-note ai-note--warn" role="status">
          <TriangleAlert size={14} aria-hidden="true" /> {t("farmer.ai.unavailable")}
        </p>
      ) : null}

      {/* Price suggestion */}
      <div className="ai-block">
        <div className="ai-block-title">{t("farmer.ai.priceTitle")}</div>
        <button
          type="button"
          className="btn btn-outline ai-action"
          onClick={() => void requestPrice()}
          disabled={pricing || status?.available === false}
        >
          {pricing ? <Loader2 size={14} className="spin" aria-hidden="true" /> : null}
          {pricing ? t("farmer.ai.working") : t("farmer.ai.suggestPrice")}
        </button>
        {priceError ? (
          <p className="ai-note ai-note--error" role="alert">{priceError}</p>
        ) : null}
        {price ? (
          <div className="ai-result" aria-live="polite">
            <div className="ai-result-main">
              {fill(t("farmer.ai.priceRange"), {
                min: money.format(price.predictedMinPrice),
                max: money.format(price.predictedMaxPrice),
                unit: price.unit,
              })}
            </div>
            <p className="ai-note">
              <Info size={13} aria-hidden="true" /> {t("farmer.ai.priceRuleBased")}
            </p>
            <button
              type="button"
              className="ai-link"
              onClick={() => onApplyPrice(midpoint)}
            >
              {fill(t("farmer.ai.usePrice"), { price: money.format(midpoint) })}
            </button>
          </div>
        ) : null}
      </div>

      {/* Photo quality check */}
      <div className="ai-block">
        <div className="ai-block-title">{t("farmer.ai.qualityTitle")}</div>
        {untrained ? (
          <p className="ai-note ai-note--warn">
            <TriangleAlert size={13} aria-hidden="true" /> {t("farmer.ai.previewModel")}
          </p>
        ) : null}
        <label htmlFor="ai-crop" className="ai-label">{t("farmer.ai.crop")}</label>
        <select
          id="ai-crop"
          className="select ai-input"
          value={crop || guessCrop(productName)}
          onChange={(event) => {
            setCrop(event.target.value as GradableCrop | "");
            setQuality(null);
          }}
        >
          <option value="">{t("farmer.ai.cropPlaceholder")}</option>
          {GRADABLE_CROPS.map((option) => (
            <option key={option} value={option}>
              {t(`farmer.ai.crop.${option}`)}
            </option>
          ))}
        </select>
        <input
          ref={photoInput}
          id="ai-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => onPhoto(event.target.files?.[0])}
        />
        <button
          type="button"
          className="btn btn-outline ai-action"
          onClick={() => photoInput.current?.click()}
        >
          <Camera size={14} aria-hidden="true" />
          {photo ? photo.name : t("farmer.ai.choosePhoto")}
        </button>
        <button
          type="button"
          className="btn btn-outline ai-action"
          onClick={() => void requestQuality()}
          disabled={grading || !photo || status?.available === false}
        >
          {grading ? <Loader2 size={14} className="spin" aria-hidden="true" /> : null}
          {grading ? t("farmer.ai.working") : t("farmer.ai.checkQuality")}
        </button>
        {qualityError ? (
          <p className="ai-note ai-note--error" role="alert">{qualityError}</p>
        ) : null}
        {quality ? (
          <div className="ai-result" aria-live="polite">
            <div className="ai-result-main">
              {fill(t("farmer.ai.gradeResult"), {
                grade: quality.modelGrade,
                confidence: Math.round(quality.confidenceScore * 100),
              })}
            </div>
            {quality.modelStatus === "untrained" ? (
              <p className="ai-note ai-note--warn">{t("farmer.ai.previewResult")}</p>
            ) : null}
            {!quality.cropSupported ? (
              <p className="ai-note ai-note--warn">{t("farmer.ai.cropNotTrained")}</p>
            ) : null}
            {quality.modelStatus === "trained" && quality.lowConfidence ? (
              <p className="ai-note">{t("farmer.ai.lowConfidence")}</p>
            ) : null}
            {quality.suggestedListingGrade ? (
              <button
                type="button"
                className="ai-link"
                onClick={() => onApplyGrade(quality.suggestedListingGrade!)}
              >
                {fill(t("farmer.ai.useGrade"), { grade: quality.suggestedListingGrade })}
              </button>
            ) : (
              <p className="ai-note ai-note--warn">{t("farmer.ai.gradeD")}</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
