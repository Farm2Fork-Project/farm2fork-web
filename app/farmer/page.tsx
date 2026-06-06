"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FarmerDashboard from "@/components/farmer/FarmerDashboard";
import FarmerSignup from "@/components/farmer/FarmerSignup2";
import { LanguageProvider } from "@/components/LanguageContext";

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsAuthenticated(false);
    } else if (typeof window !== "undefined" && localStorage.getItem("role") === "farmer") {
      setIsAuthenticated(true);
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  if (!isAuthenticated) {
    if (searchParams.get("signup") !== "true") return null; // Avoid flashing signup before redirect
    return (
      <FarmerSignup 
        onBack={() => router.push("/login")}
        onComplete={() => {
          localStorage.setItem("role", "farmer");
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return <FarmerDashboard onLogout={() => {
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    router.push("/login");
  }} />;
}

export default function FarmerPage() {
  return (
    <LanguageProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <MainApp />
      </Suspense>
    </LanguageProvider>
  );
}
