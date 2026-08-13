"use client";

import React, { useState } from "react";
import { LuLeaf, LuArrowLeft, LuEye, LuEyeOff, LuCheck } from "react-icons/lu";
import type { RegisterFarmerRequest } from "@/lib/api/contracts.ts";
import { useLanguage } from "./LanguageContext";

interface FarmerSignupProps {
  onSubmit: (input: RegisterFarmerRequest) => Promise<void>;
  onBack?: () => void;
  identityEmail?: string;
}

const CNIC_PATTERN = /^\d{5}-?\d{7}-?\d$/;
const cropOptions = ["wheat", "rice", "cotton", "sugarcane", "maize", "vegetables"];

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
    farmLocation: "",
  });
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  function updateField(event: React.ChangeEvent<HTMLInputElement>) {
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

    setIsSubmitting(true);
    try {
      await onSubmit({
        email: identityEmail ?? formData.email.trim(),
        password: formData.password,
        cnic: formData.cnic.trim(),
        farmName: formData.farmName.trim(),
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
        ...(formData.farmLocation.trim()
          ? { farmLocation: { address: formData.farmLocation.trim() } }
          : {}),
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
            <LuLeaf size={64} color="var(--primary-green)" style={{ marginBottom: "24px" }} />
            <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px", lineHeight: 1.2 }}>
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
              <LuArrowLeft size={24} color="var(--text-dark)" />
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginLeft: "16px", color: "var(--text-dark)" }}>
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
                    {showPassword ? <LuEye size={20} /> : <LuEyeOff size={20} />}
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
              <div className="auth-form-group">
                <label htmlFor="farmer-location">Farm location</label>
                <input id="farmer-location" name="farmLocation" className="auth-input" value={formData.farmLocation} onChange={updateField} disabled={isSubmitting} />
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginBottom: "12px" }}>
                  {t("farmerSignup.selectCrops")}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {cropOptions.map((crop) => {
                    const isSelected = selectedCrops.includes(crop);
                    return (
                      <button key={crop} type="button" aria-pressed={isSelected} onClick={() => toggleCrop(crop)} disabled={isSubmitting}>
                        {isSelected ? <LuCheck size={16} /> : null}
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
