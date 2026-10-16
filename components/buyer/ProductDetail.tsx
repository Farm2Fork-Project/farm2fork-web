"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Avatar } from "@/components/account/Avatar";
import {
  IcAlert,
  IcArrowLeft,
  IcBadgeCheck,
  IcCalendar,
  IcCard,
  IcCarrot,
  IcCart,
  IcCheck,
  IcChevronRight,
  IcClock,
  IcCotton,
  IcHourglass,
  IcLeaf,
  IcLock,
  IcMaize,
  IcMango,
  IcMapPin,
  IcMilk,
  IcMinus,
  IcPlus,
  IcQr,
  IcRice,
  IcShield,
  IcSprout,
  IcStore,
  IcSend,
  IcSugarcane,
  IcTruck,
  IcWheat,
} from "@/components/icons";
import type { BuyerProduct } from "@/lib/api/contracts.ts";
import type { BuyerRepository } from "@/lib/buyer/buyer-repository.ts";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";
import type { FarmProfile } from "@/lib/farm/farm-repository.ts";
import { resolveApiUrl } from "@/lib/loans/loan-repository.ts";
import { useReveal } from "@/lib/react/use-reveal";
import type { ProductTrace } from "@/lib/trace/trace-repository.ts";
import { useLanguage } from "../LanguageContext";
import { TraceEventItem, fill, traceOrigin } from "../trace/TraceJourney";
import { farmPlace } from "./farm-label";
import { ProductCard } from "./ProductCard";

type Load<T> =
  { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/**
 * Runs `load` whenever `key` changes (or `retry` is called) and reports
 * loading / error / ready. A stale answer for an older key is never shown.
 */
function useLoad<T>(
  load: () => Promise<T>,
  key: string,
): [Load<T>, () => void] {
  const loadRef = useRef(load);
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{
    key: string;
    attempt: number;
    result: Load<T>;
  } | null>(null);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef
      .current()
      .then((data) => {
        if (!cancelled)
          setSettled({ key, attempt, result: { status: "ready", data } });
      })
      .catch(() => {
        if (!cancelled)
          setSettled({ key, attempt, result: { status: "error" } });
      });
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const current: Load<T> =
    settled && settled.key === key && settled.attempt === attempt
      ? settled.result
      : { status: "loading" };
  return [current, () => setAttempt((value) => value + 1)];
}

type TraceRepositoryPort = {
  getProductTrace(productId: string): Promise<ProductTrace>;
};
type FarmRepositoryPort = {
  getFarmProfile(farmerId: string): Promise<FarmProfile>;
};
type ProductRepositoryPort = Pick<BuyerRepository, "listProducts">;

const CROP_ICONS: Record<string, typeof IcWheat> = {
  wheat: IcWheat,
  rice: IcRice,
  mango: IcMango,
  maize: IcMaize,
  corn: IcMaize,
  cotton: IcCotton,
  sugarcane: IcSugarcane,
  carrot: IcCarrot,
  milk: IcMilk,
  dairy: IcMilk,
};

const MORE_LIMIT = 4;

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function ProductDetail({
  product,
  inCart,
  repository,
  traceRepository,
  farmRepository,
  onAddToCart,
  onBack,
  onViewCart,
  addLabel,
}: {
  product: BuyerProduct;
  /** How many of this product the shopper already holds in their cart. */
  inCart: number;
  repository: ProductRepositoryPort;
  traceRepository: TraceRepositoryPort;
  farmRepository: FarmRepositoryPort;
  onAddToCart: (product: BuyerProduct, quantity: number) => void;
  onBack: () => void;
  onViewCart: () => void;
  /** Replaces "Add to cart" where buying needs something first, e.g. "Sign in to buy". */
  addLabel?: string;
}) {
  const copy = useBuyerCopy();
  const { t, language } = useLanguage();
  const rootRef = useReveal<HTMLDivElement>();
  const locale = language === "ur" ? "ur-PK" : "en-PK";
  const number = new Intl.NumberFormat(locale);
  const longDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const monthYear = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));

  const [trace, retryTrace] = useLoad(
    () => traceRepository.getProductTrace(product.id),
    product.id,
  );
  const [farm] = useLoad(
    () => farmRepository.getFarmProfile(product.farmerId),
    product.farmerId,
  );
  const [more] = useLoad(async () => {
    const [fromFarm, similar] = await Promise.all([
      repository.listProducts({
        farmerId: product.farmerId,
        limit: 12,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
      product.category
        ? repository
            .listProducts({
              category: product.category,
              limit: 12,
              sortBy: "createdAt",
              sortOrder: "desc",
            })
            .catch(() => null)
        : Promise.resolve(null),
    ]);
    const buyable = (candidate: BuyerProduct) =>
      candidate.id !== product.id &&
      candidate.status === "active" &&
      candidate.quantity >= 1;
    const sameFarm = fromFarm.data.filter(buyable).slice(0, MORE_LIMIT);
    const otherFarms = (similar?.data ?? [])
      .filter(
        (candidate) =>
          buyable(candidate) && candidate.farmerId !== product.farmerId,
      )
      .slice(0, MORE_LIMIT);
    return { sameFarm, otherFarms };
  }, `${product.id}`);

  // A new product opens at its top, not wherever the last one was scrolled to.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [product.id]);

  const farmName = product.farmer?.farmName;
  const place = product.farmer ? farmPlace(product.farmer) : "";
  const profile = farm.status === "ready" ? farm.data : null;
  const traceData = trace.status === "ready" ? trace.data : null;
  const origin = traceData ? traceOrigin(traceData) : null;
  const listedAt = traceData?.product.listedAt ?? product.createdAt;
  const categoryLabel = product.category
    ? categoryName(product.category, copy)
    : "";

  return (
    <div className="pdp" ref={rootRef}>
      <nav className="pdp-crumbs" aria-label={copy("Breadcrumb")}>
        <button className="pdp-back" onClick={onBack} type="button">
          <IcArrowLeft size={18} />
          {copy("Back to marketplace")}
        </button>
        <ol>
          <li>
            <button type="button" onClick={onBack}>
              {copy("Marketplace")}
            </button>
          </li>
          {categoryLabel ? (
            <li>
              <IcChevronRight size={14} className="pdp-crumb-sep" />
              <span>{categoryLabel}</span>
            </li>
          ) : null}
          <li aria-current="page">
            <IcChevronRight size={14} className="pdp-crumb-sep" />
            <span>{product.name}</span>
          </li>
        </ol>
      </nav>

      <section className="pdp-top">
        <Gallery product={product} />
        <BuyPanel
          product={product}
          inCart={inCart}
          origin={origin}
          originLoading={trace.status === "loading"}
          place={place}
          farmName={farmName}
          categoryLabel={categoryLabel}
          onAddToCart={onAddToCart}
          onViewCart={onViewCart}
          addLabel={addLabel}
          number={number}
        />
      </section>

      <section
        className="pdp-trust"
        aria-label={copy("Proof at a glance")}
        data-reveal
      >
        <TrustTile
          tone={origin ?? (trace.status === "error" ? "missing" : "loading")}
          icon={originIcon(origin)}
          label={copy("Origin record")}
          value={
            trace.status === "loading"
              ? null
              : trace.status === "error"
                ? copy("Unavailable right now")
                : copy(
                    {
                      verified: "Verified on ledger",
                      pending: "Awaiting ledger",
                      missing: "No ledger record",
                      unverified: "Not verified",
                    }[origin ?? "missing"],
                  )
          }
        />
        <TrustTile
          tone={
            traceData && traceData.summary.confirmedEvents > 0
              ? "verified"
              : "neutral"
          }
          icon={<IcLock size={22} />}
          label={copy("Ledger entries")}
          value={
            trace.status === "loading"
              ? null
              : traceData
                ? fill(t("trace.ledgerProgress"), {
                    confirmed: traceData.summary.confirmedEvents,
                    total: traceData.summary.totalEvents,
                  })
                : copy("Unavailable right now")
          }
        />
        <TrustTile
          tone="neutral"
          icon={<IcCalendar size={22} />}
          label={copy("Listed")}
          value={listedAt ? longDate.format(new Date(listedAt)) : "—"}
        />
        <TrustTile
          tone="neutral"
          icon={<IcMapPin size={22} />}
          label={copy("Grown in")}
          value={place || copy("Location not shared")}
        />
      </section>

      <div className="pdp-columns">
        <section
          className="pdp-card pdp-journey"
          id="pdp-journey"
          aria-labelledby="pdp-journey-title"
          data-reveal
        >
          <header className="pdp-card-head">
            <h2 id="pdp-journey-title">{copy("The journey so far")}</h2>
            <p>
              {copy(
                "Every step is written to a Hyperledger Fabric ledger, so it can be checked and not quietly changed. New steps appear here as this produce is paid for, picked up and delivered.",
              )}
            </p>
          </header>

          {trace.status === "loading" ? (
            <div className="pdp-skeleton-stack" aria-hidden="true">
              <span className="pdp-skel pdp-skel-banner" />
              <span className="pdp-skel pdp-skel-row" />
              <span className="pdp-skel pdp-skel-row" />
            </div>
          ) : null}

          {trace.status === "error" ? (
            <div className="pdp-note" role="alert">
              <IcAlert size={20} />
              <div>
                <strong>{copy("We couldn't load this journey.")}</strong>
                <p>
                  {copy(
                    "Your connection may have dropped. The record itself is not affected.",
                  )}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={retryTrace}
                >
                  {copy("Try again")}
                </button>
              </div>
            </div>
          ) : null}

          {traceData && origin ? (
            <>
              <div
                className={`trace-origin trace-origin--${origin}`}
                role="status"
              >
                <span className="trace-origin-icon" aria-hidden="true">
                  {originIcon(origin)}
                </span>
                <div>
                  <strong>{t(`trace.origin.${origin}`)}</strong>
                  <p>{t(`trace.origin.${origin}Desc`)}</p>
                </div>
              </div>

              {traceData.events.length > 0 ? (
                <ol className="scan-timeline pdp-timeline">
                  {traceData.events.map((event) => (
                    <TraceEventItem
                      key={event.id}
                      event={event}
                      formatDate={formatDate}
                    />
                  ))}
                  <li className="pdp-next" aria-hidden="true">
                    <span className="pdp-next-dot">
                      <IcHourglass size={16} />
                    </span>
                    <div>
                      <strong>{copy("Next: payment and pickup")}</strong>
                      <p>
                        {copy(
                          "These steps are recorded once someone buys this produce.",
                        )}
                      </p>
                    </div>
                  </li>
                </ol>
              ) : (
                <p className="trace-empty">{t("trace.empty")}</p>
              )}
            </>
          ) : null}

          <footer className="pdp-journey-foot">
            <Link href={`/trace/${product.id}`} className="pdp-link">
              <IcQr size={18} />
              {copy("Open the public trace page")}
            </Link>
            <CopyLink path={`/trace/${product.id}`} />
          </footer>
        </section>

        <aside className="pdp-side">
          <section className="pdp-card" data-reveal style={step(1)}>
            <h2 className="pdp-card-title">{copy("About this produce")}</h2>
            <p className="pdp-about">
              {product.description?.trim() ||
                copy("The farmer hasn't added a description yet.")}
            </p>
            <dl className="pdp-facts">
              {categoryLabel ? (
                <div>
                  <dt>{copy("Category")}</dt>
                  <dd>{categoryLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt>{copy("Quality grade")}</dt>
                <dd>
                  {product.qualityGrade
                    ? copy("Grade {grade}", { grade: product.qualityGrade })
                    : copy("Ungraded")}
                  <small>{copy("Set by the farmer when listing")}</small>
                </dd>
              </div>
              <div>
                <dt>{copy("Sold per")}</dt>
                <dd>{product.unit}</dd>
              </div>
              <div>
                <dt>{copy("In stock")}</dt>
                <dd>
                  {number.format(product.quantity)} {product.unit}
                </dd>
              </div>
            </dl>
          </section>

          <section className="pdp-card pdp-how" data-reveal style={step(2)}>
            <h2 className="pdp-card-title">{copy("How buying works")}</h2>
            <ol>
              <li>
                <span>
                  <IcCart size={18} />
                </span>
                {copy("Add it to your cart and place the order.")}
              </li>
              <li>
                <span>
                  <IcCard size={18} />
                </span>
                {copy("Pay to confirm it. Payment is recorded on the ledger.")}
              </li>
              <li>
                <span>
                  <IcTruck size={18} />
                </span>
                {copy(
                  "A transporter collects it from the farm and delivers it.",
                )}
              </li>
            </ol>
          </section>
        </aside>
      </div>

      <FarmSection
        farm={farm}
        fallbackName={farmName}
        fallbackPlace={place}
        monthYear={monthYear}
        number={number}
        longDate={longDate}
      />

      <MoreRows
        more={more}
        farmName={profile?.farmName ?? farmName}
        category={categoryLabel}
        onAddToCart={(candidate) => onAddToCart(candidate, 1)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------- */

function Gallery({ product }: { product: BuyerProduct }) {
  const copy = useBuyerCopy();
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const photos = product.images
    .map(resolveApiUrl)
    .filter((src) => !failed.includes(src));
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="pdp-gallery">
      <div className="pdp-photo">
        {current ? (
          // Photos come from Cloudinary or the API; not optimisable by next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={current}
            alt={product.name}
            onError={() => setFailed((list) => [...list, current])}
          />
        ) : (
          <div className="pdp-photo-empty">
            <IcLeaf size={72} />
            <span>{copy("No photo yet")}</span>
          </div>
        )}
      </div>
      {photos.length > 1 ? (
        <ul className="pdp-thumbs" aria-label={copy("Photos")}>
          {photos.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                aria-label={copy("Show photo {number}", { number: index + 1 })}
                aria-current={src === current}
                className={src === current ? "is-active" : undefined}
                onClick={() => setActive(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function BuyPanel({
  product,
  inCart,
  origin,
  originLoading,
  place,
  farmName,
  categoryLabel,
  onAddToCart,
  onViewCart,
  addLabel,
  number,
}: {
  product: BuyerProduct;
  inCart: number;
  origin: ReturnType<typeof traceOrigin> | null;
  originLoading: boolean;
  place: string;
  farmName?: string;
  categoryLabel: string;
  onAddToCart: (product: BuyerProduct, quantity: number) => void;
  onViewCart: () => void;
  addLabel?: string;
  number: Intl.NumberFormat;
}) {
  const copy = useBuyerCopy();
  const { t } = useLanguage();
  const available = product.status === "active" && product.quantity >= 1;
  const room = Math.max(0, Math.floor(product.quantity) - inCart);
  const [wanted, setWanted] = useState(1);
  const quantity = Math.min(Math.max(1, wanted), Math.max(1, room));
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    if (justAdded === null) return;
    const timer = setTimeout(() => setJustAdded(null), 2600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  // On phones the buy button scrolls away; a slim bar keeps it in reach.
  useEffect(() => {
    const node = actionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const add = useCallback(() => {
    if (!available || room < 1) return;
    onAddToCart(product, quantity);
    setJustAdded(quantity);
    setWanted(1);
  }, [available, room, onAddToCart, product, quantity]);

  const subtotal = product.price * quantity;
  const price = (
    <>
      <strong>{number.format(product.price)}</strong>
      <span>PKR / {product.unit}</span>
    </>
  );

  return (
    <aside className="pdp-buy" aria-label={copy("Buy this produce")}>
      <div className="pdp-eyebrow">
        {categoryLabel ? <span>{categoryLabel}</span> : null}
        <span className="pdp-grade">
          {product.qualityGrade
            ? copy("Grade {grade}", { grade: product.qualityGrade })
            : copy("Ungraded")}
        </span>
      </div>
      <h1>{product.name}</h1>
      {farmName ? (
        <a className="pdp-seller" href="#pdp-farm">
          <IcStore size={18} />
          <span>
            {farmName}
            {place ? <small> · {place}</small> : null}
          </span>
          <IcChevronRight size={14} className="pdp-seller-go" />
        </a>
      ) : null}

      <p className="pdp-price">{price}</p>

      <p className={`pdp-stock${available ? "" : " is-out"}`}>
        <i aria-hidden="true" />
        {available
          ? copy("In stock · {quantity} {unit} available", {
              quantity: number.format(product.quantity),
              unit: product.unit,
            })
          : copy("Not available right now")}
      </p>

      <div className="pdp-action" ref={actionRef}>
        <div className="pdp-qty-row">
          <span id="pdp-qty-label">{copy("Quantity")}</span>
          <div
            className="pdp-stepper"
            role="group"
            aria-labelledby="pdp-qty-label"
          >
            <button
              type="button"
              aria-label={copy("Decrease quantity")}
              disabled={!available || room < 1 || quantity <= 1}
              onClick={() => setWanted(quantity - 1)}
            >
              <IcMinus size={16} />
            </button>
            <input
              inputMode="numeric"
              aria-label={copy("Quantity")}
              disabled={!available || room < 1}
              value={available && room >= 1 ? quantity : 0}
              onChange={(event) => {
                const next = Number.parseInt(event.target.value, 10);
                setWanted(Number.isFinite(next) ? next : 1);
              }}
            />
            <button
              type="button"
              aria-label={copy("Increase quantity")}
              disabled={!available || room < 1 || quantity >= room}
              onClick={() => setWanted(quantity + 1)}
            >
              <IcPlus size={16} />
            </button>
          </div>
          <span className="pdp-subtotal">
            {copy("Subtotal")} <strong>{number.format(subtotal)} PKR</strong>
          </span>
        </div>

        <button
          className="pdp-add"
          type="button"
          disabled={!available || room < 1}
          onClick={add}
        >
          <IcCart size={20} />
          {addLabel ?? copy("Add to cart")}
        </button>

        <p className="pdp-added" role="status">
          {justAdded !== null ? (
            <>
              <IcCheck size={16} />
              {copy("Added {quantity} {unit} to your cart.", {
                quantity: justAdded,
                unit: product.unit,
              })}{" "}
              <button type="button" onClick={onViewCart}>
                {copy("View cart")}
              </button>
            </>
          ) : available && room < 1 ? (
            <>
              {copy("All available stock is already in your cart.")}{" "}
              <button type="button" onClick={onViewCart}>
                {copy("View cart")}
              </button>
            </>
          ) : null}
        </p>
      </div>

      <ul className="pdp-assure">
        <li>
          <span>
            <IcMapPin size={18} />
          </span>
          <div>
            <strong>
              {place
                ? copy("Collected at the farm in {place}", { place })
                : copy("Collected at the farm")}
            </strong>
            <small>
              {copy(
                "A Farm2Fork transporter delivers it. The delivery fee is shown at checkout.",
              )}
            </small>
          </div>
        </li>
        <li>
          <span>{originIcon(origin, 18)}</span>
          <div>
            <strong>
              {originLoading
                ? copy("Checking the ledger…")
                : origin
                  ? t(`trace.origin.${origin}`)
                  : copy("Ledger status unavailable")}
            </strong>
            <small>
              <a href="#pdp-journey">{copy("See the journey")}</a>
            </small>
          </div>
        </li>
        <li>
          <span>
            <IcSprout size={18} />
          </span>
          <div>
            <strong>{copy("Sold directly by the farm")}</strong>
            <small>{copy("You can see who grew it and where.")}</small>
          </div>
        </li>
      </ul>

      <div
        className={`pdp-bar${barVisible ? " is-on" : ""}`}
        aria-hidden={!barVisible}
      >
        <div>
          <strong>{number.format(product.price)} PKR</strong>
          <small>/ {product.unit}</small>
        </div>
        <button
          type="button"
          className="pdp-add"
          tabIndex={barVisible ? 0 : -1}
          disabled={!available || room < 1}
          onClick={add}
        >
          <IcCart size={18} />
          {addLabel ?? copy("Add to cart")}
        </button>
      </div>
    </aside>
  );
}

function TrustTile({
  tone,
  icon,
  label,
  value,
}: {
  tone:
    "verified" | "pending" | "missing" | "unverified" | "neutral" | "loading";
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className={`pdp-tile pdp-tile--${tone}`}>
      <span className="pdp-tile-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <small>{label}</small>
        {value === null ? (
          <span className="pdp-skel pdp-skel-line" aria-label="…" />
        ) : (
          <strong>{value}</strong>
        )}
      </div>
    </div>
  );
}

function FarmSection({
  farm,
  fallbackName,
  fallbackPlace,
  monthYear,
  longDate,
  number,
}: {
  farm: Load<FarmProfile>;
  fallbackName?: string;
  fallbackPlace: string;
  monthYear: Intl.DateTimeFormat;
  longDate: Intl.DateTimeFormat;
  number: Intl.NumberFormat;
}) {
  const copy = useBuyerCopy();
  const profile = farm.status === "ready" ? farm.data : null;
  const name = profile?.farmName ?? fallbackName;
  if (!name) return null;

  const place = profile ? farmPlace(profile) : fallbackPlace;
  const person = profile?.ownerName;

  return (
    <section
      className="pdp-farm"
      id="pdp-farm"
      aria-labelledby="pdp-farm-title"
      data-reveal
    >
      <div className="pdp-farm-id">
        <Avatar
          user={{
            fullName: person ?? name,
            avatarUrl: profile?.avatarUrl,
          }}
          size={84}
          className="pdp-farm-avatar"
        />
        <p className="pdp-kicker">{copy("Meet the farm")}</p>
        <h2 id="pdp-farm-title">{name}</h2>
        {person ? (
          <p className="pdp-farm-owner">
            {copy("Grown by {name}", { name: person })}
          </p>
        ) : null}
        <ul className="pdp-farm-meta">
          {place ? (
            <li>
              <IcMapPin size={16} />
              {place}
            </li>
          ) : null}
          {profile ? (
            <li>
              <IcClock size={16} />
              {copy("On Farm2Fork since {date}", {
                date: monthYear.format(new Date(profile.memberSince)),
              })}
            </li>
          ) : null}
        </ul>
      </div>

      <div className="pdp-farm-body">
        {farm.status === "loading" ? (
          <div className="pdp-skeleton-stack" aria-hidden="true">
            <span className="pdp-skel pdp-skel-row" />
            <span className="pdp-skel pdp-skel-row" />
          </div>
        ) : null}

        {farm.status === "error" ? (
          <p className="pdp-quiet">
            {copy(
              "More about this farm isn't available right now. What you see above is what was listed with the produce.",
            )}
          </p>
        ) : null}

        {profile ? (
          <>
            <dl className="pdp-farm-stats">
              <div>
                <dt>{copy("Listed now")}</dt>
                <dd>{number.format(profile.stats.activeListings)}</dd>
              </div>
              <div>
                <dt>{copy("Orders delivered")}</dt>
                <dd>{number.format(profile.stats.completedOrders)}</dd>
              </div>
              {profile.landSizeAcres ? (
                <div>
                  <dt>{copy("Acres farmed")}</dt>
                  <dd>{number.format(profile.landSizeAcres)}</dd>
                </div>
              ) : null}
            </dl>

            <div className="pdp-farm-block">
              <h3>{copy("What they grow")}</h3>
              {profile.cropTypes.length > 0 ? (
                <ul className="pdp-crops">
                  {profile.cropTypes.map((crop) => {
                    const Icon = CROP_ICONS[crop.toLowerCase()] ?? IcSprout;
                    return (
                      <li key={crop}>
                        <Icon size={18} />
                        {crop}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="pdp-quiet">
                  {copy("This farm hasn't listed its crops yet.")}
                </p>
              )}
            </div>

            <div className="pdp-farm-block">
              <h3>{copy("Certifications")}</h3>
              {profile.certifications.length > 0 ? (
                <ul className="pdp-certs">
                  {profile.certifications.map((cert) => (
                    <li key={`${cert.name}-${cert.issuedDate ?? ""}`}>
                      <span className="pdp-cert-icon" aria-hidden="true">
                        {cert.expired ? (
                          <IcShield size={18} />
                        ) : (
                          <IcBadgeCheck size={18} />
                        )}
                      </span>
                      <div>
                        <strong>{cert.name}</strong>
                        <small>
                          {[
                            cert.issuedBy,
                            cert.expiryDate
                              ? cert.expired
                                ? copy("Expired {date}", {
                                    date: longDate.format(
                                      new Date(cert.expiryDate),
                                    ),
                                  })
                                : copy("Valid until {date}", {
                                    date: longDate.format(
                                      new Date(cert.expiryDate),
                                    ),
                                  })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pdp-quiet">
                  {copy("No certifications on file for this farm yet.")}
                </p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function MoreRows({
  more,
  farmName,
  category,
  onAddToCart,
}: {
  more: Load<{ sameFarm: BuyerProduct[]; otherFarms: BuyerProduct[] }>;
  farmName?: string;
  category: string;
  onAddToCart: (product: BuyerProduct) => void;
}) {
  const copy = useBuyerCopy();

  if (more.status === "loading") {
    return (
      <section className="pdp-more" aria-hidden="true">
        <div className="pdp-more-head">
          <span className="pdp-skel pdp-skel-title" />
        </div>
        <div className="mp-product-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="mp-card pdp-skel pdp-skel-card" />
          ))}
        </div>
      </section>
    );
  }
  if (more.status === "error") return null;

  const { sameFarm, otherFarms } = more.data;
  return (
    <>
      {sameFarm.length > 0 ? (
        <section className="pdp-more" aria-labelledby="pdp-more-farm">
          <div className="pdp-more-head" data-reveal>
            <h2 id="pdp-more-farm">
              {farmName
                ? copy("More from {farm}", { farm: farmName })
                : copy("More from this farm")}
            </h2>
          </div>
          <div className="mp-product-grid">
            {sameFarm.map((candidate, index) => (
              <ProductCard
                key={candidate.id}
                product={candidate}
                onAdd={onAddToCart}
                revealIndex={index}
              />
            ))}
          </div>
        </section>
      ) : null}

      {otherFarms.length > 0 ? (
        <section className="pdp-more" aria-labelledby="pdp-more-similar">
          <div className="pdp-more-head" data-reveal>
            <h2 id="pdp-more-similar">
              {category
                ? copy("More {category} from other farms", { category })
                : copy("More from other farms")}
            </h2>
          </div>
          <div className="mp-product-grid">
            {otherFarms.map((candidate, index) => (
              <ProductCard
                key={candidate.id}
                product={candidate}
                onAdd={onAddToCart}
                revealIndex={index}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function CopyLink({ path }: { path: string }) {
  const copy = useBuyerCopy();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className="pdp-link"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}${path}`,
          );
          setCopied(true);
        } catch {
          /* Clipboard blocked: the public page link above still works. */
        }
      }}
    >
      {copied ? <IcCheck size={18} /> : <IcSend size={18} />}
      {copied ? copy("Link copied") : copy("Copy link to share")}
    </button>
  );
}

function originIcon(origin: ReturnType<typeof traceOrigin> | null, size = 22) {
  if (origin === "verified") return <IcBadgeCheck size={size} />;
  if (origin === "pending") return <IcHourglass size={size} />;
  if (origin === "unverified") return <IcAlert size={size} />;
  return <IcShield size={size} />;
}

function categoryName(
  category: string,
  copy: (text: string) => string,
): string {
  const known: Record<string, string> = {
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    dairy: "Dairy",
  };
  const key = category.toLowerCase();
  if (known[key]) return copy(known[key]);
  return category.charAt(0).toUpperCase() + category.slice(1);
}
