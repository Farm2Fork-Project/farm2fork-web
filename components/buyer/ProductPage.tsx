"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IcGlobe, IcLeaf, IcSearch } from "@/components/icons";
import { ApiClient } from "@/lib/api/client.ts";
import {
  ApiError,
  type ApiAuthUser,
  type BuyerProduct,
} from "@/lib/api/contracts.ts";
import {
  rememberBuyerSession,
  forgetBuyerSession,
} from "@/lib/auth/session-hint.ts";
import { loginPathFor } from "@/lib/auth/role-routes.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import { addCartItem, readSavedCart, type CartItem } from "@/lib/cart/cart.ts";
import { FarmRepository } from "@/lib/farm/farm-repository.ts";
import { productIdFromSlug, productPath } from "@/lib/products/slug.ts";
import { TraceRepository } from "@/lib/trace/trace-repository.ts";
import { LanguageProvider, useLanguage } from "../LanguageContext";
import { BuyerTopbar, buyerTabHref } from "./BuyerTopbar";
import { ProductDetail } from "./ProductDetail";

type Buyer = BuyerSession["user"];

type Who =
  { kind: "checking" } | { kind: "guest" } | { kind: "buyer"; buyer: Buyer };

type Found =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error" }
  | { kind: "ready"; product: BuyerProduct };

const cartKey = (buyerId: string) => `f2f.cart.v1.${buyerId}`;

/**
 * A product's own page, at /product/<name>-<id>. It works for anyone: a buyer
 * gets the usual buyer header and a working cart, a visitor gets the public
 * header and "Sign in to buy" (and lands back here afterwards). Because the
 * address names the product, refresh, back and shared links all behave.
 */
function ProductPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const copy = useBuyerCopy();
  const { language, setLanguage, t } = useLanguage();
  const productId = productIdFromSlug(slug);

  const client = useMemo(() => new ApiClient(), []);
  const buyers = useMemo(() => new BuyerRepository({ client }), [client]);
  const traces = useMemo(() => new TraceRepository({ client }), [client]);
  const farms = useMemo(() => new FarmRepository({ client }), [client]);

  const [who, setWho] = useState<Who>({ kind: "checking" });
  const [found, setFound] = useState<Found>(
    productId ? { kind: "loading" } : { kind: "missing" },
  );
  const [attempt, setAttempt] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    let active = true;
    client
      .request<ApiAuthUser>("/auth/me")
      .then((user) => {
        if (!active) return;
        if (user.role === "buyer") {
          rememberBuyerSession();
          const buyer = user as Buyer;
          setCart(readSavedCart(window.sessionStorage, buyer.id));
          setWho({ kind: "buyer", buyer });
        } else {
          setWho({ kind: "guest" });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401)
          forgetBuyerSession();
        setWho({ kind: "guest" });
      });
    return () => {
      active = false;
    };
  }, [client]);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    buyers
      .getProduct(productId)
      .then((product) => {
        if (active) setFound({ kind: "ready", product });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFound(
          error instanceof ApiError && error.status === 404
            ? { kind: "missing" }
            : { kind: "error" },
        );
      });
    return () => {
      active = false;
    };
  }, [buyers, productId, attempt]);

  // If the name changed since the link was made, move to the current address.
  const readyProduct = found.kind === "ready" ? found.product : null;
  useEffect(() => {
    if (!readyProduct) return;
    const canonical = productPath(readyProduct);
    let current = pathname;
    try {
      current = decodeURIComponent(pathname);
    } catch {
      /* Keep the raw path. */
    }
    if (current !== canonical) router.replace(canonical);
  }, [readyProduct, pathname, router]);

  const goBack = useCallback(() => {
    const sameSiteReferrer =
      document.referrer !== "" &&
      new URL(document.referrer).origin === window.location.origin;
    if (sameSiteReferrer && window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  const addToCart = useCallback(
    (product: BuyerProduct, quantity: number) => {
      if (who.kind !== "buyer") {
        router.push(loginPathFor(pathname));
        return;
      }
      const next = addCartItem(cart, product, quantity);
      setCart(next);
      try {
        window.sessionStorage.setItem(
          cartKey(who.buyer.id),
          JSON.stringify(next),
        );
      } catch {
        /* Storage blocked: the cart still holds for this page. */
      }
    },
    [cart, pathname, router, who],
  );

  const inCart = readyProduct
    ? (cart.find((item) => item.productId === readyProduct.id)?.quantity ?? 0)
    : 0;
  const rtl = language === "ur";

  const body =
    who.kind === "checking" || found.kind === "loading" ? (
      <div className="pdp-loading" role="status">
        <span className="pdp-skel pdp-skel-hero" aria-hidden="true" />
        <span className="pdp-skel pdp-skel-hero" aria-hidden="true" />
        <span className="sr-only">{copy("Loading product details…")}</span>
      </div>
    ) : found.kind === "ready" ? (
      <ProductDetail
        key={found.product.id}
        product={found.product}
        inCart={inCart}
        repository={buyers}
        traceRepository={traces}
        farmRepository={farms}
        onAddToCart={addToCart}
        onBack={goBack}
        onViewCart={() => router.push(buyerTabHref("cart"))}
        addLabel={who.kind === "guest" ? copy("Sign in to buy") : undefined}
      />
    ) : (
      <div
        className="pdp-gone"
        role={found.kind === "error" ? "alert" : undefined}
      >
        <IcSearch size={40} />
        <h1>
          {found.kind === "error"
            ? copy("We couldn't load this product.")
            : copy("We couldn't find this product.")}
        </h1>
        <p>
          {found.kind === "error"
            ? copy("Your connection may have dropped. Try again in a moment.")
            : copy(
                "The farmer may have removed it, or the link may be incomplete.",
              )}
        </p>
        <div className="pdp-gone-actions">
          {found.kind === "error" ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFound({ kind: "loading" });
                setAttempt((value) => value + 1);
              }}
            >
              {copy("Try again")}
            </button>
          ) : null}
          <Link className="btn btn-secondary" href="/">
            {copy("Browse the marketplace")}
          </Link>
        </div>
      </div>
    );

  if (who.kind === "buyer") {
    return (
      <div className="app-shell" dir={rtl ? "rtl" : "ltr"}>
        <div className="app-main">
          <BuyerTopbar
            buyer={who.buyer}
            active={null}
            cartCount={cart.length}
            onSelect={(tab) => router.push(buyerTabHref(tab))}
          />
          <main className="app-content">{body}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-page" dir={rtl ? "rtl" : "ltr"}>
      <header className="trace-page-bar">
        <Link href="/" className="trace-brand">
          <IcLeaf size={22} />
          <span>{t("app.title")}</span>
        </Link>
        <div className="pdp-guest-actions">
          <button
            type="button"
            className="market-language"
            onClick={() => setLanguage(language === "en" ? "ur" : "en")}
            aria-label={t("trace.changeLanguage")}
          >
            <IcGlobe size={17} /> {language === "en" ? "اردو" : "English"}
          </button>
          <Link className="btn btn-outline" href={loginPathFor(pathname)}>
            {t("landing.nav.signIn")}
          </Link>
          <Link className="btn btn-primary" href="/signup">
            {t("landing.getStarted")}
          </Link>
        </div>
      </header>
      <main className="app-content">{body}</main>
    </div>
  );
}

export function ProductPage({ slug }: { slug: string }) {
  return (
    <LanguageProvider>
      <ProductPageContent slug={slug} />
    </LanguageProvider>
  );
}
