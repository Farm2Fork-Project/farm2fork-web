import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyerSignup } from "@/components/auth/BuyerSignup";

export const metadata: Metadata = { title: "Create a buyer account" };

export default function BuyerSignupPage() {
  return (
    <Suspense>
      <BuyerSignup />
    </Suspense>
  );
}
