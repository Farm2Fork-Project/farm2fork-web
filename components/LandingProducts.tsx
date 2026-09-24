"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LuLeaf, LuScanLine } from "react-icons/lu";
import { ApiClient } from "@/lib/api/client.ts";
import type { BuyerProduct } from "@/lib/api/contracts.ts";
import { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import { useLanguage } from "./LanguageContext";

const PREVIEW_SIZE = 4;

type PreviewState =
  | { kind: "loading" }
  | { kind: "hidden" }
  | { kind: "loaded"; products: BuyerProduct[] };

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/**
 * Live listings on the public landing page, now that browsing needs no
 * account. Buying still requires sign-in; tracing a product's origin does
 * not. If the API is unreachable or there are no listings, the section
 * disappears rather than advertising an error or empty shelf to a visitor.
 */
export default function LandingProducts({ onSignIn }: { onSignIn: () => void }) {
  const { t, language } = useLanguage();
  const repository = useMemo(
    () => new BuyerRepository({ client: new ApiClient() }),
    [],
  );
  const [state, setState] = useState<PreviewState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    repository
      .listProducts({ limit: PREVIEW_SIZE * 2, sortBy: "createdAt", sortOrder: "desc" })
      .then((page) => {
        const products = page.data
          .filter((product) => product.status === "active" && product.quantity > 0)
          .slice(0, PREVIEW_SIZE);
        if (!cancelled) {
          setState(products.length > 0 ? { kind: "loaded", products } : { kind: "hidden" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "hidden" });
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  if (state.kind === "hidden") return null;

  const price = new Intl.NumberFormat(language === "ur" ? "ur-PK" : "en-PK");

  return (
    <section id="fresh" className="market-fresh market-section" aria-busy={state.kind === "loading"}>
      <div className="market-section-heading">
        <p>{t("landing.fresh.pretitle")}</p>
        <h2>
          {t("landing.fresh.title1")} <em>{t("landing.fresh.title2")}</em>
        </h2>
      </div>

      <div className="mp-product-grid">
        {state.kind === "loading"
          ? Array.from({ length: PREVIEW_SIZE }, (_, index) => (
              <div key={index} className="mp-card market-fresh-skeleton" aria-hidden="true" />
            ))
          : state.products.map((product) => (
              <article className="mp-card market-fresh-card" key={product.id}>
                <div className="mp-card-img">
                  {product.images[0] ? (
                    // Listing images are arbitrary external URLs.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt="" className="market-fresh-img" />
                  ) : (
                    <LuLeaf className="leaf" size={56} aria-hidden="true" />
                  )}
                  {product.qualityGrade ? (
                    <span className="mp-card-grade">
                      {fill(t("trace.gradeValue"), { grade: product.qualityGrade })}
                    </span>
                  ) : null}
                </div>
                <div className="mp-card-body">
                  <h3 className="mp-card-name">{product.name}</h3>
                  {product.farmer ? (
                    <div className="mp-card-farm">
                      {[
                        product.farmer.farmName,
                        [product.farmer.city, product.farmer.province].filter(Boolean).join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                  <div className="mp-card-price">
                    {fill(t("landing.fresh.price"), {
                      price: price.format(product.price),
                      unit: product.unit,
                    })}
                  </div>
                  <div className="market-fresh-actions">
                    <button type="button" className="btn btn-primary" onClick={onSignIn}>
                      {t("landing.fresh.signInToBuy")}
                    </button>
                    <Link href={`/trace/${product.id}`} className="btn btn-outline">
                      <LuScanLine size={15} aria-hidden="true" /> {t("landing.fresh.trace")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
