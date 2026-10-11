"use client";

import React, { useState } from "react";
import type { RegisterFarmerRequest } from "@/lib/api/contracts.ts";
import { useLanguage } from "./LanguageContext";
import { IcArrowLeft, IcCheck, IcEye, IcEyeOff, IcLeaf } from "@/components/icons";

interface FarmerSignupProps {
  onSubmit: (input: RegisterFarmerRequest) => Promise<void>;
  onBack?: () => void;
  identityEmail?: string;
}

const CNIC_PATTERN = /^\d{5}-?\d{7}-?\d$/;
const cropOptions = ["wheat", "rice", "cotton", "sugarcane", "maize", "vegetables"];
const provinces = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu and Kashmir",
  "Islamabad Capital Territory",
];
// Mirrors PAKISTAN_BOUNDS in farm2fork-backend/src/common/geo/geo.ts.
const LAT_RANGE = { min: 23.5, max: 37.2 };
const LNG_RANGE = { min: 60.5, max: 77.9 };

export default function FarmerSignup({ onSubmit, onBack, identityEmail }: FarmerSignupProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    cnic: "",
    password: "",
    confirmation: "",
    farmName: "",
    farmSize: "",
    address: "",
    city: "",
    province: "",
    lat: "",
    lng: "",
  });
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  function updateField(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function toggleCrop(crop: string) {
    setSelectedCrops((current) =>
      current.includes(crop) ? current.filter((item) => item !== crop) : [...current, crop],
    );
  }

  function handleNext() {
    setError("");
    const email = identityEmail ?? formData.email.trim();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!CNIC_PATTERN.test(formData.cnic.trim())) {
      setError("Please enter a valid Pakistani CNIC.");
      return;
    }
    if (!identityEmail && formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!identityEmail && formData.password !== formData.confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit() {
    setError("");
    if (!formData.farmName.trim()) {
      setError("Farm name is required.");
      return;
    }

    const landSizeAcres = formData.farmSize.trim()
      ? Number(formData.farmSize)
      : undefined;
    if (landSizeAcres !== undefined && (!Number.isFinite(landSizeAcres) || landSizeAcres < 0)) {
      setError("Farm size must be a non-negative number.");
      return;
    }

    const address = formData.address.trim();
    const city = formData.city.trim();
    if (!address || !city || !formData.province) {
      setError("Farm address, city and province are required.");
      return;
    }
    const lat = formData.lat.trim() === "" ? Number.NaN : Number(formData.lat);
    const lng = formData.lng.trim() === "" ? Number.NaN : Number(formData.lng);
    if (
      !Number.isFinite(lat) || lat < LAT_RANGE.min || lat > LAT_RANGE.max ||
      !Number.isFinite(lng) || lng < LNG_RANGE.min || lng > LNG_RANGE.max
    ) {
      setError("Enter farm coordinates inside Pakistan (latitude 23.5–37.2, longitude 60.5–77.9).");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        email: identityEmail ?? formData.email.trim(),
        password: formData.password,
        cnic: formData.cnic.trim(),
        farmName: formData.farmName.trim(),
        farmLocation: { address, city, province: formData.province, lat, lng },
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
        ...(selectedCrops.length ? { cropTypes: selectedCrops } : {}),
        ...(landSizeAcres === undefined ? {} : { landSizeAcres }),
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not create your farmer account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (isSubmitting) return;
    if (step === 2) {
      setStep(1);
    } else {
      onBack?.();
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-illustration-side">
          <div className="auth-illustration-content">
            <IcLeaf size={64} color="var(--primary-green)" style={{ marginBottom: "24px" }} />
            <h1>
              {t("app.title")} <br /> {t("landing.title2")}
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.9, lineHeight: 1.6, maxWidth: "320px" }}>
              {t("landing.subtitle")}
            </p>
          </div>
        </div>

        <div className="auth-form-side" style={{ padding: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
            <button className="back-btn" onClick={handleBack} aria-label="Go back" type="button" disabled={isSubmitting}>
              <IcArrowLeft size={24} color="var(--text-dark)" />
            </button>
            <h2 style={{ marginLeft: "16px" }}>
              {t("farmerSignup.title")}
            </h2>
          </div>

          {error ? <div className="auth-error" role="alert">{error}</div> : null}

          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, color: "var(--primary-green)", marginBottom: "12px" }}>
              <span>{step === 1 ? t("farmerSignup.step1") : t("farmerSignup.step2")}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
            </div>
          </div>

          {step === 1 ? (
            <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "-4px" }}>
                Personal information
              </h3>
              {identityEmail ? (
                <p>Signed in with Google as <strong>{identityEmail}</strong></p>
              ) : (
                <div className="auth-form-group">
                <label htmlFor="farmer-email">Email</label>
                <input id="farmer-email" name="email" className="auth-input" type="email" value={formData.email} onChange={updateField} disabled={isSubmitting} />
                </div>
              )}
              <div className="auth-form-group">
                <label htmlFor="farmer-phone">Phone (optional)</label>
                <input id="farmer-phone" name="phone" className="auth-input" type="tel" value={formData.phone} onChange={updateField} disabled={isSubmitting} />
              </div>
              <div className="auth-form-group">
                <label htmlFor="farmer-cnic">CNIC</label>
                <input id="farmer-cnic" name="cnic" className="auth-input" placeholder="35202-1234567-1" value={formData.cnic} onChange={updateField} disabled={isSubmitting} />
              </div>
              {!identityEmail ? (
                <div className="auth-form-group">
                <label htmlFor="farmer-password">Password</label>
                <div className="auth-input-wrapper">
                  <input id="farmer-password" name="password" className="auth-input" type={showPassword ? "text" : "password"} value={formData.password} onChange={updateField} disabled={isSubmitting} />
                  <button type="button" className="toggle-pw" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password visibility">
                    {showPassword ? <IcEye size={20} /> : <IcEyeOff size={20} />}
                  </button>
                </div>
                </div>
              ) : null}
              {!identityEmail ? (
                <div className="auth-form-group">
                <label htmlFor="farmer-confirmation">Confirm password</label>
                <input id="farmer-confirmation" name="confirmation" className="auth-input" type="password" value={formData.confirmation} onChange={updateField} disabled={isSubmitting} />
                </div>
              ) : null}
              <button className="auth-btn" type="button" style={{ marginTop: "16px" }} onClick={handleNext} disabled={isSubmitting}>
                Next Step →
              </button>
            </div>
          ) : (
            <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)" }}>{t("farmerSignup.farmInfo")}</h3>
              <div className="auth-form-group">
                <label htmlFor="farmer-farm-name">Farm name</label>
                <input id="farmer-farm-name" name="farmName" className="auth-input" value={formData.farmName} onChange={updateField} disabled={isSubmitting} />
              </div>
              <div className="auth-form-group">
                <label htmlFor="farmer-farm-size">Farm size (acres)</label>
                <input id="farmer-farm-size" name="farmSize" className="auth-input" type="number" min="0" step="any" value={formData.farmSize} onChange={updateField} disabled={isSubmitting} />
              </div>
              <p>{t("farmerSignup.pickupAfterSignup")}</p>
              <div className="auth-form-group">
                <label htmlFor="farmer-address">Street or village</label>
                <input id="farmer-address" name="address" className="auth-input" maxLength={200} value={formData.address} onChange={updateField} disabled={isSubmitting} />
              </div>
              <div className="auth-form-group">
                <label htmlFor="farmer-city">Farm city</label>
                <input id="farmer-city" name="city" className="auth-input" maxLength={80} value={formData.city} onChange={updateField} disabled={isSubmitting} />
              </div>
              <div className="auth-form-group">
                <label htmlFor="farmer-province">Farm province</label>
                <select id="farmer-province" name="province" className="auth-input" value={formData.province} onChange={updateField} disabled={isSubmitting}>
                  <option value="">Select province</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              <div className="auth-form-group">
                <label htmlFor="farmer-lat">Farm latitude</label>
                <input id="farmer-lat" name="lat" className="auth-input" type="number" step="any" min={LAT_RANGE.min} max={LAT_RANGE.max} placeholder="30.1575" value={formData.lat} onChange={updateField} disabled={isSubmitting} />
              </div>
              <div className="auth-form-group">
                <label htmlFor="farmer-lng">Farm longitude</label>
                <input id="farmer-lng" name="lng" className="auth-input" type="number" step="any" min={LNG_RANGE.min} max={LNG_RANGE.max} placeholder="71.5249" value={formData.lng} onChange={updateField} disabled={isSubmitting} />
              </div>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>Copy your farm coordinates from your map app.</p>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginBottom: "12px" }}>
                  {t("farmerSignup.selectCrops")}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {cropOptions.map((crop) => {
                    const isSelected = selectedCrops.includes(crop);
                    return (
                      <button key={crop} type="button" aria-pressed={isSelected} onClick={() => toggleCrop(crop)} disabled={isSubmitting}>
                        {isSelected ? <IcCheck size={16} /> : null}
                        {crop}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <button className="auth-guest-btn" type="button" style={{ flex: 1 }} onClick={handleBack} disabled={isSubmitting}>
                  {t("farmerSignup.back")}
                </button>
                <button className="auth-btn" type="button" style={{ flex: 1, margin: 0 }} onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Creating account…" : "Create Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
