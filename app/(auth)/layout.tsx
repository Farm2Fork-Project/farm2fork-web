import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LanguageProvider } from "@/components/LanguageContext";

// Sign-in and sign-up pages are for people, never for search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** `eager`: the page ships as real HTML first; a saved Urdu choice applies after hydration. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider eager>
      <AuthShell>{children}</AuthShell>
    </LanguageProvider>
  );
}
