"use client";

import { useState } from "react";
import { LuArrowLeft, LuTruck } from "react-icons/lu";
import type { RegisterTransporterRequest, TransporterVehicleType } from "@/lib/api/contracts.ts";
import { useLanguage } from "./LanguageContext";

export type TransporterVehicleInput = Pick<
  RegisterTransporterRequest,
  "vehicleType" | "vehicleNumber" | "licenseNumber" | "serviceAreas"
>;

export interface TransporterSignup2ScreenProps {
  onBack: () => void;
  onSubmit: (input: TransporterVehicleInput) => void;
  isSubmitting?: boolean;
  submitError?: string;
}

export default function TransporterSignup2Screen({
  onBack,
  onSubmit,
  isSubmitting = false,
  submitError = "",
}: TransporterSignup2ScreenProps) {
  const { t } = useLanguage();
  const [vehicleType, setVehicleType] = useState<TransporterVehicleType | "">("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");
    const areas = serviceAreas.split(",").map((area) => area.trim()).filter(Boolean);
    if (!vehicleType || !vehicleNumber.trim() || !licenseNumber.trim() || !areas.length) {
      setError("Vehicle type, vehicle number, driving licence number, and a service area are required.");
      return;
    }
    onSubmit({ vehicleType, vehicleNumber: vehicleNumber.trim(), licenseNumber: licenseNumber.trim(), serviceAreas: areas });
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-illustration-side">
          <div className="auth-illustration-content">
            <LuTruck size={64} color="var(--primary-green)" style={{ marginBottom: "24px" }} />
            <h1>{t("tsignup.title1")}<br />{t("tsignup.title2")}</h1>
            <p>{t("tsignup.subtitle")}</p>
          </div>
        </div>
        <div className="auth-form-side" style={{ padding: "48px" }}>
          <button className="back-btn" onClick={onBack} aria-label="Go back" type="button" disabled={isSubmitting}><LuArrowLeft size={24} /></button>
          <h2>{t("tsignup.header")}</h2>
          {error || submitError ? <div className="auth-error" role="alert">{error || submitError}</div> : null}
          <p>{t("tsignup.step2")}</p>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: "100%" }} /></div>
          <div className="auth-form-group">
            <label htmlFor="transporter-vehicle-type">Vehicle type</label>
            <select id="transporter-vehicle-type" className="auth-input select" value={vehicleType} onChange={(event) => setVehicleType(event.target.value as TransporterVehicleType)} disabled={isSubmitting}>
              <option value="" disabled>Select vehicle type</option>
              <option value="bike">Bike</option>
              <option value="rickshaw">Rickshaw</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>
          </div>
          <div className="auth-form-group">
            <label htmlFor="transporter-vehicle-number">Vehicle number</label>
            <input id="transporter-vehicle-number" className="auth-input" value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} disabled={isSubmitting} />
          </div>
          <div className="auth-form-group">
            <label htmlFor="transporter-license-number">Driving licence number</label>
            <input id="transporter-license-number" className="auth-input" value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} disabled={isSubmitting} />
          </div>
          <div className="auth-form-group">
            <label htmlFor="transporter-service-areas">Service areas</label>
            <input id="transporter-service-areas" className="auth-input" placeholder="Lahore, Kasur" value={serviceAreas} onChange={(event) => setServiceAreas(event.target.value)} disabled={isSubmitting} />
          </div>
          <button className="auth-btn" type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
