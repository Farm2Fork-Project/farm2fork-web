"use client";

import FarmerDashboard from "@/components/farmer/FarmerDashboard";
import { PortalGate } from "@/components/auth/PortalGate";
import { LanguageProvider } from "@/components/LanguageContext";

/**
 * Signed-in farmer portal. Signing in and signing up live at /login and
 * /signup/farmer; a visitor who is not a signed-in farmer is sent there.
 */
function FarmerPortal() {
  return (
    <PortalGate role="farmer">
      {(user) => <FarmerDashboard email={user.email} user={user} />}
    </PortalGate>
  );
}

export default function FarmerPage() {
  return (
    <LanguageProvider>
      <FarmerPortal />
    </LanguageProvider>
  );
}
