import type { Metadata } from "next";
import { Suspense } from "react";
import { RoleChooser } from "@/components/auth/RoleChooser";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <Suspense>
      <RoleChooser />
    </Suspense>
  );
}
