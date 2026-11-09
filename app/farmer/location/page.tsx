"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalGate } from "@/components/auth/PortalGate";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import { FarmPickupLocation } from "@/components/farmer/FarmPickupLocation";
import { ApiClient } from "@/lib/api/client.ts";
import { FarmerRepository } from "@/lib/farmer/farmer-repository.ts";

function LocationScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const repository = useMemo(() => new FarmerRepository({ client: new ApiClient() }), []);
  return (
    <main className="page-shell" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <Link href="/farmer" className="pickup-summary-edit">
        {language === "ur" ? "← ڈیش بورڈ" : "← Back to dashboard"}
      </Link>
      <FarmPickupLocation repository={repository} variant="form" onSaved={() => router.push("/farmer")} />
    </main>
  );
}

export default function FarmerLocationPage() {
  return (
    <LanguageProvider>
      <PortalGate role="farmer">{() => <LocationScreen />}</PortalGate>
    </LanguageProvider>
  );
}
