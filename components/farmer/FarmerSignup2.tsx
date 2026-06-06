"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { LuLeaf, LuArrowLeft, LuEye, LuEyeOff, LuCheck } from "react-icons/lu";

interface FarmerSignupProps {
  onComplete: () => void;
  onBack?: () => void;
}

export default function FarmerSignup({ onComplete, onBack }: FarmerSignupProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    farmName: "",
    farmSize: "",
    farmLocation: "",
    certifications: "",
  });

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const cropOptions = ["wheat", "rice", "cotton", "sugarcane", "maize", "vegetables"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const handleNext = () => {
    setError("");
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    setError("");
    if (!formData.farmName.trim()) {
      setError("Farm name is required.");
      return;
    }
    if (!formData.farmLocation.trim()) {
      setError("Farm location is required.");
      return;
    }
    onComplete();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* Left Side: Illustration */}
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

        {/* Right Side: Form */}
        <div className="auth-form-side" style={{ padding: "48px" }}>
          
          <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
            <button className="back-btn" onClick={handleBack} aria-label="Go back" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <LuArrowLeft size={24} color="var(--text-dark)" />
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginLeft: "16px", color: "var(--text-dark)" }}>
              {t("farmerSignup.title")}
            </h2>
          </div>

          {error && (
            <div style={{ color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", border: "1px solid #ffcdd2" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, color: "var(--primary-green)", marginBottom: "12px" }}>
              <span>{step === 1 ? t("farmerSignup.step1") : t("farmerSignup.step2")}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: step === 1 ? "50%" : "100%" }}></div>
            </div>
          </div>

          {step === 1 ? (
            <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "-4px" }}>
                {t("farmerSignup.personalInfo") || "Personal Information"}
              </h3>
              
              <div style={{ display: "flex", gap: "16px" }}>
                <input
                  type="text"
                  name="firstName"
                  className="auth-input"
                  placeholder="First Name"
                  style={{ flex: 1 }}
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="lastName"
                  className="auth-input"
                  placeholder="Last Name"
                  style={{ flex: 1 }}
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              
              <input
                type="text"
                name="email"
                className="auth-input"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
              />
              
              <input
                type="text"
                name="phone"
                className="auth-input"
                dir="auto"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />
              
              <div className="auth-input-wrapper">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  className="auth-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <LuEye size={20} /> : <LuEyeOff size={20} />}
                </button>
              </div>

              <button 
                className="auth-btn" 
                style={{ marginTop: "16px" }}
                onClick={handleNext}
              >
                Next Step &rarr;
              </button>
            </div>
          ) : (
            <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)" }}>{t("farmerSignup.farmInfo")}</h3>
              
              <div style={{ display: "flex", gap: "16px" }}>
                <input
                  type="text"
                  name="farmName"
                  className="auth-input"
                  placeholder={t("farmerSignup.farmName")}
                  style={{ flex: 1 }}
                  value={formData.farmName}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="farmSize"
                  className="auth-input"
                  placeholder={t("farmerSignup.farmSize")}
                  style={{ flex: 1 }}
                  value={formData.farmSize}
                  onChange={handleInputChange}
                />
              </div>
              
              <input
                type="text"
                name="farmLocation"
                className="auth-input"
                placeholder={t("farmerSignup.farmLocation")}
                value={formData.farmLocation}
                onChange={handleInputChange}
              />
              
              <input
                type="text"
                name="certifications"
                className="auth-input"
                placeholder={t("farmerSignup.certifications")}
                value={formData.certifications}
                onChange={handleInputChange}
              />

              <div style={{ marginTop: "8px" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginBottom: "12px" }}>
                  {t("farmerSignup.selectCrops")}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {cropOptions.map((crop) => {
                    const isSelected = selectedCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          border: isSelected ? "2px solid var(--primary-green)" : "1px solid var(--border-medium)",
                          backgroundColor: isSelected ? "var(--primary-green-soft)" : "white",
                          color: isSelected ? "var(--primary-green)" : "var(--text-medium)",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {isSelected && <LuCheck size={16} />}
                        {t(`crops.${crop}`) || crop}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <button 
                  className="auth-guest-btn" 
                  style={{ flex: 1, borderColor: "var(--border-medium)" }}
                  onClick={handleBack}
                >
                  {t("farmerSignup.back")}
                </button>
                <button 
                  className="auth-btn" 
                  style={{ flex: 1, margin: 0 }}
                  onClick={handleSubmit}
                >
                  {t("signupForm.create")}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
