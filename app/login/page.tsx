"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginScreen from "@/components/LoginScreen";
import { LanguageProvider } from "@/components/LanguageContext";

const USERS = [
  { email: "buyer@test.com", password: "test1234", role: "buyer" },
  { email: "farmer@test.com", password: "test1234", role: "farmer" },
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
    } else if (user.role === "farmer") {
      localStorage.setItem("role", "farmer");
      router.push("/farmer");
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
    <LoginScreen
      onLogin={handleLogin}
      loginError={loginError}
      onGoSignup={() => {
        router.push("/?auth=signup");
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginPageContent />
    </LanguageProvider>
  );
}
