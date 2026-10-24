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
  onInvalidateGrade?: () => void;
};

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Farmer-facing AI help while creating a listing: a price range from the
 * rule-based estimator and a photo quality check from the grading model.
 * Both are suggestions the farmer applies explicitly; neither is ever
 * presented as certified quality. Only four crops have model support.
 */
export default function AiListingAssistant({
  client,
  productName,
  category,
  unit,
  grade,
  onApplyPrice,
  onApplyGrade,
  onInvalidateGrade,
}: Props) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [price, setPrice] = useState<PriceSuggestion | null>(null);
  const [priceError, setPriceError] = useState("");
  const [pricing, setPricing] = useState(false);
  const [crop, setCrop] = useState<GradableCrop | "other" | "">("");
  const qualityRequest = useRef(0);
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

  // A changed listing needs a fresh, deliberate crop choice and photo.
  useEffect(() => {
    onInvalidateGrade?.();
    qualityRequest.current += 1;
    setCrop("");
    setPhoto(null);
    setQuality(null);
    setQualityError("");
    setGrading(false);
    if (photoInput.current) photoInput.current.value = "";
    return () => { qualityRequest.current += 1; };
  }, [productName, category, onInvalidateGrade]);

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
    if (crop === "other") return;
    const selectedCrop = crop;
    if (!selectedCrop) {
      setQualityError(t("farmer.ai.needCrop"));
      return;
    }
    if (!photo) {
      setQualityError(t("farmer.ai.needPhoto"));
      return;
    }
    const request = ++qualityRequest.current;
    setQuality(null);
    setGrading(true);
    setQualityError("");
    try {
      const result = await client.checkQuality(photo, selectedCrop);
      if (request === qualityRequest.current) setQuality(result);
    } catch (error) {
      if (request !== qualityRequest.current) return;
      setQuality(null);
      setQualityError(errorText(error));
    } finally {
      if (request === qualityRequest.current) setGrading(false);
    }
  };

  const onPhoto = (file: File | undefined) => {
    onInvalidateGrade?.();
    qualityRequest.current += 1;
    setGrading(false);
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
  const observedOn = price
    ? new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${price.observedOn}T00:00:00Z`))
    : "";

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
              <Info size={13} aria-hidden="true" />{" "}
              {price.marketScope === "Punjab"
                ? fill(t("farmer.ai.pricePunjab"), { count: price.marketCount, date: observedOn })
                : fill(t("farmer.ai.priceLocal"), { market: price.marketScope, date: observedOn })}
            </p>
            <p className="ai-note">
              {fill(t("farmer.ai.priceSource"), { commodity: price.commodity })}
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
          value={crop}
          onChange={(event) => {
            onInvalidateGrade?.();
            qualityRequest.current += 1;
            setCrop(event.target.value as GradableCrop | "other" | "");
            setQuality(null);
            setQualityError("");
            setPhoto(null);
            setGrading(false);
            if (photoInput.current) photoInput.current.value = "";
          }}
        >
          <option value="">{t("farmer.ai.cropPlaceholder")}</option>
          {GRADABLE_CROPS.map((option) => (
            <option key={option} value={option}>
              {t(`farmer.ai.crop.${option}`)}
            </option>
          ))}
          <option value="other">{t("farmer.ai.crop.other")}</option>
        </select>
        <p className="ai-note">{t("farmer.ai.advisory")}</p>
        {crop === "other" ? (
          <p className="ai-note" role="status">{t("farmer.ai.noGrading")}</p>
        ) : (
          <>
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
              disabled={grading || !crop || !photo || status?.available === false}
            >
              {grading ? <Loader2 size={14} className="spin" aria-hidden="true" /> : null}
              {grading ? t("farmer.ai.working") : t("farmer.ai.checkQuality")}
            </button>
          </>
        )}
        {qualityError ? (
          <p className="ai-note ai-note--error" role="alert">{qualityError}</p>
        ) : null}
        {quality && (quality.needsReview || quality.modelGrade === null) ? (
          <div className="ai-result" aria-live="polite">
            <div className="ai-result-main">{t("farmer.ai.review.title")}</div>
            <p className="ai-note ai-note--warn">
              {t(`farmer.ai.review.${quality.reviewReason ?? "low_confidence"}`)}
            </p>
            <p className="ai-note">{t("farmer.ai.review.tips")}</p>
            <button
              type="button"
              className="ai-link"
              onClick={() => photoInput.current?.click()}
            >
              {t("farmer.ai.review.retake")}
            </button>
            <p className="ai-note">{t("farmer.ai.review.manual")}</p>
          </div>
        ) : quality?.modelGrade ? (
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
            {quality.cropSupported && quality.suggestedListingGrade ? (
              <button
                type="button"
                className="ai-link"
                onClick={() => onApplyGrade(quality.suggestedListingGrade!)}
              >
                {fill(t("farmer.ai.useGrade"), { grade: quality.suggestedListingGrade })}
              </button>
            ) : quality.modelGrade === "D" ? (
              <p className="ai-note ai-note--warn">{t("farmer.ai.gradeD")}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
