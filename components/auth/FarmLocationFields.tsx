"use client";

import MapPinPicker from "@/components/maps/MapPinPicker";
import { SelectField, TextField } from "@/components/auth/fields";
import { useLanguage } from "@/components/LanguageContext";
import { PAKISTAN_PROVINCES, provinceKey } from "@/lib/farmer/farm-location.ts";

type Names = "address" | "city" | "province" | "lat" | "lng" | "location";

/** Address, city, province and the map pin for a farm, shared by sign-up and profile edit. */
export function FarmLocationFields({
  idPrefix,
  text,
  setValue,
  blur,
  error,
  disabled,
}: {
  idPrefix: string;
  text: (name: Names) => string;
  setValue: (name: Names, value: string) => void;
  blur: (name: Names) => void;
  error: (name: Names) => string | undefined;
  disabled: boolean;
}) {
  const { t } = useLanguage();
  const lat = Number(text("lat"));
  const lng = Number(text("lng"));
  const pinned = !!text("lat") && !!text("lng") && Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <>
      <TextField
        id={`${idPrefix}-address`}
        label={t("signup.address")}
        autoComplete="street-address"
        maxLength={200}
        value={text("address")}
        onChange={(e) => setValue("address", e.target.value)}
        onBlur={() => blur("address")}
        error={error("address")}
        disabled={disabled}
      />
      <div className="af-row">
        <TextField
          id={`${idPrefix}-city`}
          label={t("signup.city")}
          autoComplete="address-level2"
          maxLength={80}
          value={text("city")}
          onChange={(e) => setValue("city", e.target.value)}
          onBlur={() => blur("city")}
          error={error("city")}
          disabled={disabled}
        />
        <SelectField
          id={`${idPrefix}-province`}
          label={t("signup.province")}
          value={text("province")}
          onChange={(e) => setValue("province", e.target.value)}
          onBlur={() => blur("province")}
          error={error("province")}
          disabled={disabled}
        >
          <option value="">{t("signup.selectProvince")}</option>
          {PAKISTAN_PROVINCES.map((p) => (
            <option key={p} value={p}>{t(provinceKey(p))}</option>
          ))}
        </SelectField>
      </div>
      <div className="af-location" data-invalid={error("location") ? "true" : undefined} tabIndex={-1}>
        <MapPinPicker
          purpose="farm"
          disabled={disabled}
          value={pinned ? { lat, lng } : null}
          onChange={(point) => {
            setValue("lat", point.lat.toFixed(6));
            setValue("lng", point.lng.toFixed(6));
            blur("location");
          }}
        />
        {error("location") ? <p className="af-error">{error("location")}</p> : null}
        <details className="af-details">
          <summary>{t("signup.enterCoordinates")}</summary>
          <div className="af-row">
            <TextField
              id={`${idPrefix}-lat`}
              label={t("signup.latitude")}
              type="number"
              step="any"
              dir="ltr"
              placeholder="30.1575"
              value={text("lat")}
              onChange={(e) => setValue("lat", e.target.value)}
              onBlur={() => blur("location")}
              disabled={disabled}
            />
            <TextField
              id={`${idPrefix}-lng`}
              label={t("signup.longitude")}
              type="number"
              step="any"
              dir="ltr"
              placeholder="71.5249"
              value={text("lng")}
              onChange={(e) => setValue("lng", e.target.value)}
              onBlur={() => blur("location")}
              disabled={disabled}
            />
          </div>
        </details>
      </div>
    </>
  );
}
