"use client";

import MapPinPicker from "@/components/maps/MapPinPicker";
import { TextField } from "@/components/auth/fields";
import ProvinceCityFields from "@/components/maps/ProvinceCityFields";
import { cityTarget } from "@/lib/geo/pakistan-locations.ts";
import { useLanguage } from "@/components/LanguageContext";

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
      <ProvinceCityFields
        idPrefix={idPrefix}
        province={text("province")}
        city={text("city")}
        disabled={disabled}
        onChange={({ province, city }) => {
          setValue("province", province);
          setValue("city", city);
        }}
        provinceError={error("province")}
        cityError={error("city")}
        onProvinceBlur={() => blur("province")}
        onCityBlur={() => blur("city")}
      />
      <div className="af-location" data-invalid={error("location") ? "true" : undefined} tabIndex={-1}>
        <MapPinPicker
          purpose="farm"
          disabled={disabled}
          city={cityTarget(text("province"), text("city"))}
          value={pinned ? { lat, lng } : null}
          onChange={(point) => {
            setValue("lat", point.lat.toFixed(6));
            setValue("lng", point.lng.toFixed(6));
            blur("location");
          }}
        />
        {error("location") ? <p className="af-error">{error("location")}</p> : null}
      </div>
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
    </>
  );
}
