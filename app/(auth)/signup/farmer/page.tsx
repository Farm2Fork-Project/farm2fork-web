import type { Metadata } from "next";
import { Suspense } from "react";
import { FarmerSignup } from "@/components/auth/FarmerSignup";

export const metadata: Metadata = { title: "Create a farmer account" };

export default function FarmerSignupPage() {
  return (
    <Suspense>
      <FarmerSignup />
    </Suspense>
  );
}
