"use client";

import { useMemo } from "react";
import Select, { type SingleValue } from "react-select";
import { useLanguage } from "@/components/LanguageContext";
import { PAKISTAN_PROVINCES, provinceKey } from "@/lib/farmer/farm-location.ts";
import {
  LOCATIONS_ATTRIBUTION,
  LOCATIONS_SOURCE_URL,
  citiesOfProvince,
} from "@/lib/geo/pakistan-locations.ts";

interface Option {
  value: string;
  label: string;
  /** Extra text matched by the search box (English name beside an Urdu label). */
  search: string;
}

export interface ProvinceCityValue {
  province: string;
  city: string;
}

/**
 * Searchable Province -> City dropdowns backed by the bundled Pakistan city
 * list. Picking a province clears the city; nothing is fetched at runtime.
 */
export default function ProvinceCityFields({
  idPrefix,
  province,
  city,
  onChange,
  disabled = false,
  provinceError,
  cityError,
  onProvinceBlur,
  onCityBlur,
  required = true,
  showAttribution = true,
}: {
  idPrefix: string;
  province: string;
  city: string;
  onChange: (next: ProvinceCityValue) => void;
  disabled?: boolean;
  /** Already translated. */
  provinceError?: string;
  cityError?: string;
  onProvinceBlur?: () => void;
  onCityBlur?: () => void;
  required?: boolean;
  showAttribution?: boolean;
}) {
  const { t, language } = useLanguage();

  const provinceOptions = useMemo<Option[]>(
    () =>
      PAKISTAN_PROVINCES.map((p) => ({
        value: p,
        label: t(provinceKey(p)),
        search: `${p} ${t(provinceKey(p))}`.toLowerCase(),
      })),
    // `t` changes with the language only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  const cityOptions = useMemo<Option[]>(() => {
    const list = citiesOfProvince(province).map((c) => ({
      value: c.name,
      label: c.name,
      search: c.name.toLowerCase(),
    }));
    // A city saved before the list existed stays selectable instead of vanishing.
    const known = list.some((o) => o.value.toLowerCase() === city.trim().toLowerCase());
    if (city.trim() && !known) {
      return [{ value: city, label: city, search: city.toLowerCase() }, ...list];
    }
    return list;
  }, [province, city]);

  const provinceValue = provinceOptions.find((o) => o.value === province) ?? null;
  const cityValue =
    cityOptions.find((o) => o.value.toLowerCase() === city.trim().toLowerCase()) ?? null;

  const filter = (option: { data: Option }, input: string) =>
    option.data.search.includes(input.trim().toLowerCase());

  const common = {
    unstyled: true as const,
    isSearchable: true,
    isDisabled: disabled,
    classNamePrefix: "geo-select",
    menuPlacement: "auto" as const,
    noOptionsMessage: () => t("geo.noOptions"),
    filterOption: filter,
  };

  return (
    <div className="geo-fields">
      <div className={`geo-field${provinceError ? " geo-field--invalid" : ""}`}>
        <label htmlFor={`${idPrefix}-province`}>{t("geo.provinceLabel")}</label>
        <Select<Option, false>
          {...common}
          inputId={`${idPrefix}-province`}
          instanceId={`${idPrefix}-province-select`}
          className="geo-select"
          options={provinceOptions}
          value={provinceValue}
          placeholder={t("geo.provincePlaceholder")}
          required={required}
          aria-invalid={provinceError ? true : undefined}
          aria-describedby={provinceError ? `${idPrefix}-province-error` : undefined}
          onBlur={onProvinceBlur}
          onChange={(option: SingleValue<Option>) => {
            if (option && option.value !== province) onChange({ province: option.value, city: "" });
          }}
        />
        {provinceError ? (
          <p className="geo-error" id={`${idPrefix}-province-error`}>{provinceError}</p>
        ) : null}
      </div>
      <div className={`geo-field${cityError ? " geo-field--invalid" : ""}`}>
        <label htmlFor={`${idPrefix}-city`}>{t("geo.cityLabel")}</label>
        <Select<Option, false>
          {...common}
          // Re-mounting on province change drops stale typed search text.
          key={province}
          inputId={`${idPrefix}-city`}
          instanceId={`${idPrefix}-city-select`}
          className="geo-select"
          options={cityOptions}
          value={cityValue}
          isDisabled={disabled || !province}
          placeholder={province ? t("geo.cityPlaceholder") : t("geo.cityPlaceholderFirst")}
          required={required}
          aria-invalid={cityError ? true : undefined}
          aria-describedby={cityError ? `${idPrefix}-city-error` : undefined}
          onBlur={onCityBlur}
          onChange={(option: SingleValue<Option>) => {
            if (option) onChange({ province, city: option.value });
          }}
        />
        {cityError ? <p className="geo-error" id={`${idPrefix}-city-error`}>{cityError}</p> : null}
      </div>
      {showAttribution ? (
        <p className="geo-attribution">
          {LOCATIONS_ATTRIBUTION.replace(/, https?:\/\/\S+$/, "")}{" "}
          <a href={LOCATIONS_SOURCE_URL} target="_blank" rel="noopener noreferrer">
            {t("map.attributionLink")}
          </a>
        </p>
      ) : null}
    </div>
  );
}
