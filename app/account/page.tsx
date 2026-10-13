"use client";

import { Suspense } from "react";
import { AccountView } from "@/components/account/AccountView";
import { PortalGate } from "@/components/auth/PortalGate";

export default function AccountPage() {
  return (
    <PortalGate role={null}>
      {() => (
        <Suspense>
          <AccountView />
        </Suspense>
      )}
    </PortalGate>
  );
}
