"use client";

import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { Avatar } from "@/components/account/Avatar";
import { IcLeaf } from "@/components/icons";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";

export type BuyerTab = "cart" | "marketplace" | "orders" | "scan" | "feed";

export const BUYER_TABS: readonly BuyerTab[] = [
  "marketplace",
  "cart",
  "orders",
  "scan",
  "feed",
];

/** Where a buyer tab lives. The marketplace is the bare "/", the rest add ?tab=. */
export function buyerTabHref(tab: BuyerTab): string {
  return tab === "marketplace" ? "/" : `/?tab=${tab}`;
}

export function parseBuyerTab(
  value: string | null | undefined,
): BuyerTab | null {
  return BUYER_TABS.find((tab) => tab === value) ?? null;
}

/**
 * The buyer shell's header, shared by the marketplace app and the product
 * page so both look and behave as one product. It only reports which tab was
 * picked; the caller decides how to get there.
 */
export function BuyerTopbar({
  buyer,
  active,
  cartCount,
  disabled = false,
  onSelect,
}: {
  buyer: { fullName?: string; email?: string; avatarUrl?: string };
  /** The tab to highlight, or null on pages (like a product) that are none of them. */
  active: BuyerTab | null;
  cartCount: number;
  disabled?: boolean;
  onSelect: (tab: BuyerTab) => void;
}) {
  const copy = useBuyerCopy();
  const labels: Record<BuyerTab, string> = {
    marketplace: copy("Marketplace"),
    cart: copy("Cart ({count})", { count: cartCount }),
    orders: copy("Orders"),
    scan: copy("Trace"),
    feed: copy("Community"),
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-logo"
          onClick={() => onSelect("marketplace")}
          type="button"
        >
          <IcLeaf size={22} className="logo-icon" />
          <h2>Farm2Fork</h2>
        </button>
      </div>
      <nav className="topbar-nav" aria-label={copy("Buyer navigation")}>
        {BUYER_TABS.map((tab) => (
          <button
            key={tab}
            disabled={disabled}
            className={`topbar-link${active === tab ? " active" : ""}`}
            onClick={() => onSelect(tab)}
            type="button"
          >
            {labels[tab]}
          </button>
        ))}
      </nav>
      <div className="topbar-right">
        <NotificationBell />
        <Link
          className="topbar-user"
          href="/account"
          aria-label={copy("Your account and profile")}
        >
          <Avatar user={buyer} size={36} />
          <span className="topbar-user-info">
            <span className="topbar-user-name">
              {buyer.fullName || "Buyer"}
            </span>
            <span className="topbar-user-role">{buyer.email}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
