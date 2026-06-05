"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginScreen from "@/components/LoginScreen";
import { LanguageProvider } from "@/components/LanguageContext";

const USERS = [
  { email: "buyer@test.com", password: "test1234", role: "buyer" },
  { email: "transporter@test.com", password: "test1234", role: "transporter" },
  { email: "admin@test.com", password: "test1234", role: "admin" },
];

function LoginPageContent() {
  const router = useRouter();
  const [loginError, setLoginError] = useState("");

  const handleLogin = (email: string, password: string) => {
    setLoginError("");
    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    const user = USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    if (!user) {
      setLoginError("Invalid email or password.");
      return;
    }
    if (user.role === "transporter") {
      localStorage.setItem("role", "transporter");
      router.push("/transporter");
    } else if (user.role === "admin") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("userName", "Admin User");
      router.push("/admin/dashboard");
    } else {
      localStorage.setItem("role", "buyer");
      router.push("/");
    }
  };

  return (
    <div className="app-shell">
      <div className="app-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <LoginScreen
          onLogin={handleLogin}
          loginError={loginError}
          onGoSignup={() => {
            router.push("/");
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginPageContent />
    </LanguageProvider>
  );
}
