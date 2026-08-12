"use client";

import { useState } from "react";
import { LuArrowLeft, LuEyeOff, LuEye, LuTruck } from "react-icons/lu";
import type { RegisterTransporterRequest } from "@/lib/api/contracts.ts";
import { useLanguage } from "./LanguageContext";

export type TransporterPersonalInput = Pick<
  RegisterTransporterRequest,
  "email" | "password" | "phone" | "cnic"
>;

export interface TransporterSignup1ScreenProps {
  onBack: () => void;
  onNext: (input: TransporterPersonalInput) => void;
}

const CNIC_PATTERN = /^\d{5}-?\d{7}-?\d$/;

export default function TransporterSignup1Screen({ onBack, onNext }: TransporterSignup1ScreenProps) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleNext() {
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!CNIC_PATTERN.test(cnic.trim())) {
      setError("Please enter a valid Pakistani CNIC.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    onNext({
      email: email.trim(),
      password,
      cnic: cnic.trim(),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
    });
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
          <button className="back-btn" onClick={onBack} aria-label="Go back" type="button"><LuArrowLeft size={24} /></button>
          <h2>{t("tsignup.header")}</h2>
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          <p>{t("tsignup.step1")}</p>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: "50%" }} /></div>
          <div className="auth-form-group">
            <label htmlFor="transporter-email">Email</label>
            <input id="transporter-email" className="auth-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="auth-form-group">
            <label htmlFor="transporter-phone">Phone (optional)</label>
            <input id="transporter-phone" className="auth-input" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <div className="auth-form-group">
            <label htmlFor="transporter-cnic">CNIC</label>
            <input id="transporter-cnic" className="auth-input" placeholder="35202-1234567-1" value={cnic} onChange={(event) => setCnic(event.target.value)} />
          </div>
          <div className="auth-form-group">
            <label htmlFor="transporter-password">Password</label>
            <div className="auth-input-wrapper">
              <input id="transporter-password" className="auth-input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password visibility">
                {showPassword ? <LuEye size={20} /> : <LuEyeOff size={20} />}
              </button>
            </div>
          </div>
          <button className="auth-btn" type="button" onClick={handleNext}>{t("tsignup.next")}</button>
        </div>
      </div>
    </div>
  );
}
