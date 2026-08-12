"use client";

import { useState } from "react";
import { LuArrowLeft, LuEye, LuEyeOff, LuX } from "react-icons/lu";
import type { BuyerBusinessType } from "@/lib/api/contracts.ts";
import { SignUpFormScreenProps } from "./types";

const BUSINESS_TYPES: Array<{ value: BuyerBusinessType; label: string }> = [
  { value: "individual", label: "Individual" },
  { value: "retailer", label: "Retailer" },
  { value: "restaurant", label: "Restaurant" },
  { value: "wholesaler", label: "Wholesaler" },
];

export default function SignUpFormScreen({
  onBack,
  onBackHome,
  onSubmit,
}: SignUpFormScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BuyerBusinessType | "">("");
  const [cnic, setCnic] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp() {
    setError("");
    if (!businessName.trim() || !businessType || !cnic.trim()) {
      setError("Business name, business type, and CNIC are required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        businessName: businessName.trim(),
        businessType,
        cnic: cnic.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="auth-wrapper"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-heading"
      onMouseDown={(event) => event.target === event.currentTarget && onBackHome?.()}
    >
      <div className="auth-card auth-card-narrow">
        <div className="auth-form-side">
          {onBackHome ? (
            <button className="auth-close" onClick={onBackHome} aria-label="Close and return home">
              <LuX size={22} />
            </button>
          ) : null}
          <button className="auth-home-link" onClick={onBackHome}>
            <LuArrowLeft size={16} /> Back to home
          </button>
          <div className="auth-card-narrow-header">
            <button className="back-btn" onClick={onBack} aria-label="Go back">
              <LuArrowLeft size={22} />
            </button>
            <h1 id="signup-heading">Create your buyer account</h1>
          </div>

          {error ? (
            <div className="auth-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="auth-form-group">
            <label htmlFor="signup-business-name">Business name</label>
            <input
              id="signup-business-name"
              className="auth-input"
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-business-type">Business type</label>
            <select
              id="signup-business-type"
              className="auth-input"
              value={businessType}
              onChange={(event) => setBusinessType(event.target.value as BuyerBusinessType)}
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select business type
              </option>
              {BUSINESS_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-cnic">CNIC</label>
            <input
              id="signup-cnic"
              className="auth-input"
              type="text"
              placeholder="35202-1234567-1"
              value={cnic}
              onChange={(event) => setCnic(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-phone">Phone (optional)</label>
            <input
              id="signup-phone"
              className="auth-input"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
              <button
                className="toggle-pw"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <LuEye size={18} /> : <LuEyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-form-group">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              className="auth-input"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSignUp()}
              disabled={isSubmitting}
            />
          </div>

          <button
            className="auth-btn"
            onClick={handleSignUp}
            disabled={isSubmitting}
            id="signup-submit-btn"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
