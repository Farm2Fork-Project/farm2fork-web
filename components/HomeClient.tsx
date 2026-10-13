"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import LandingScreen from "@/components/LandingScreen";
import { LanguageProvider } from "@/components/LanguageContext";
import { BuyerApp } from "@/components/buyer/BuyerApp";
import { ApiClient } from "@/lib/api/client.ts";
import type { ApiAuthUser } from "@/lib/api/contracts.ts";
import { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import { portalPathForRole } from "@/lib/auth/role-routes.ts";
import { type BuyerSession } from "@/lib/auth/web-session.ts";
import { useSignOut } from "@/lib/auth/use-sign-out.ts";

type HomeSlots = { seoContent?: ReactNode; footerContent?: ReactNode };

function HomeContent({ seoContent, footerContent }: HomeSlots) {
  const searchParams = useSearchParams();
  const signOut = useSignOut();
  const repository = useMemo(
    () => new BuyerRepository({ client: new ApiClient() }),
    [],
  );
  const [session, setSession] = useState<BuyerSession | null>(null);
  const [portalHref, setPortalHref] = useState<string | undefined>();

  // Signing in is a page of its own (/login), so "/" only has to notice who
  // is already signed in: buyers get the marketplace, other roles a way back
  // to their own portal.
  useEffect(() => {
    let active = true;
    new ApiClient()
      .request<ApiAuthUser>("/auth/me")
      .then((user) => {
        if (!active) return;
        if (user.role === "buyer") setSession({ user: user as BuyerSession["user"] });
        else setPortalHref(portalPathForRole(user.role));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (session) {
    const paymentReturn = searchParams.get("payment_return");
    return (
      <BuyerApp
        onLogout={signOut}
        repository={repository}
        session={session}
        paymentReturn={paymentReturn === "complete" || paymentReturn === "cancel" ? paymentReturn : undefined}
      />
    );
  }

  return <LandingScreen portalHref={portalHref} seoContent={seoContent} footerContent={footerContent} />;
}

/**
 * The landing page is the public front door, so it is server-rendered: the
 * Suspense fallback is the real landing screen (not a spinner) and the
 * language provider renders eagerly, so crawlers and no-JS visitors get the
 * full page. Buyers who are already signed in swap to the marketplace once the
 * session check finishes.
 */
export default function HomeClient({ seoContent, footerContent }: HomeSlots) {
  return (
    <LanguageProvider eager>
      <Suspense
        fallback={<LandingScreen seoContent={seoContent} footerContent={footerContent} />}
      >
        <HomeContent seoContent={seoContent} footerContent={footerContent} />
      </Suspense>
    </LanguageProvider>
  );
}
