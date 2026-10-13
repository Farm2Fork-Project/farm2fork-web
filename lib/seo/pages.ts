import { GUIDES, guidePath } from "../content/guides";
import type { Locale } from "./locale";
import { URDU_PAGE_META } from "./pages-ur";
import { CONTACT_EMAIL, CONTENT_REVIEWED } from "./site";

export type PageGroup = "product" | "learn" | "company" | "legal";

export type SitePage = {
  path: string;
  /** <title> without the site suffix (the root layout template adds it). */
  title: string;
  description: string;
  navLabel: string;
  group: PageGroup;
  lastModified: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

/**
 * Single source of truth for public, indexable pages. The sitemap, header and
 * footer navigation, llms.txt and the content tests all read this list.
 * Guides are appended from the content modules.
 */
export const STATIC_PAGES: SitePage[] = [
  {
    path: "/how-it-works",
    title: "How It Works: From Farm Listing to Delivery",
    description:
      "See how Farm2Fork works: farmers list produce, buyers order from a named farm, transport partners deliver, and each step is recorded and traceable by QR code.",
    navLabel: "How it works",
    group: "product",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/traceability",
    title: "Food Traceability with QR Codes and Blockchain",
    description:
      "How Farm2Fork traces produce from farm to buyer with a Hyperledger Fabric ledger and QR codes, what is recorded at each step, and what blockchain cannot prove.",
    navLabel: "Traceability",
    group: "product",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    path: "/for-farmers",
    title: "Sell Produce Directly to Buyers in Pakistan",
    description:
      "Farmers can list produce at their own price, receive direct orders, hand delivery to transport partners and apply for financing on Farm2Fork. See how to start.",
    navLabel: "For farmers",
    group: "product",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/for-buyers",
    title: "Buy Fresh Produce Direct from Pakistani Farms",
    description:
      "Order fresh produce straight from named Pakistani farms. See the farm, grade and price up front, get a delivery quote before paying, and trace it by QR code.",
    navLabel: "For buyers",
    group: "product",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/for-transporters",
    title: "Delivery Work for Transport Partners",
    description:
      "Transport partners on Farm2Fork claim open deliveries, collect produce from farms and update each shipment step. See how delivery work and fees are set.",
    navLabel: "For transport partners",
    group: "product",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/guides",
    title: "Farm-to-Table Guides for Pakistan",
    description:
      "Practical, sourced guides on buying direct from farmers, seasonal produce, post-harvest losses, traceability and selling produce online in Pakistan.",
    navLabel: "Guides",
    group: "learn",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/faq",
    title: "FAQ: Buying, Selling and Tracing Produce",
    description:
      "Answers to common questions about Farm2Fork: how to buy and sell produce, delivery and fees, payment, QR traceability, blockchain and privacy.",
    navLabel: "FAQ",
    group: "learn",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/glossary",
    title: "Farm Glossary: Mandi, Arhti, Traceability",
    description:
      "Plain definitions of Pakistani agriculture and food traceability terms, including mandi, arhti, kharif, rabi, blockchain and post-harvest loss.",
    navLabel: "Glossary",
    group: "learn",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/about",
    title: "About Farm2Fork",
    description:
      "Farm2Fork is a student-built platform from the University of Central Punjab linking Pakistani farmers directly to buyers through traceable supply chains.",
    navLabel: "About",
    group: "company",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  ...(CONTACT_EMAIL
    ? [
        {
          path: "/contact",
          title: "Contact Farm2Fork",
          description:
            "Contact the Farm2Fork team about the platform, partnerships or press. Find the email address and what to include so we can help quickly.",
          navLabel: "Contact",
          group: "company" as const,
          lastModified: CONTENT_REVIEWED,
          changeFrequency: "yearly" as const,
          priority: 0.5,
        },
      ]
    : []),
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How Farm2Fork collects, uses and shares personal information, including account, farm and delivery details, and the choices you have over your data.",
    navLabel: "Privacy",
    group: "legal",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    title: "Terms of Use",
    description:
      "The rules for using Farm2Fork, a pilot marketplace connecting Pakistani farmers, buyers and transport partners: accounts, listings, orders and deliveries.",
    navLabel: "Terms",
    group: "legal",
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export const GUIDE_PAGES: SitePage[] = GUIDES.map((guide) => ({
  path: guidePath(guide.slug),
  title: guide.metaTitle,
  description: guide.description,
  navLabel: guide.metaTitle,
  group: "learn" as const,
  lastModified: guide.updatedAt,
  changeFrequency: "monthly" as const,
  priority: 0.7,
}));

export const HOME_PAGE: SitePage = {
  path: "/",
  title: "Farm2Fork: Fresh Produce Direct from Pakistani Farmers",
  description:
    "Farm2Fork connects Pakistani farmers directly to buyers. See the farm, price and quality first, get delivery arranged, and trace every order with a QR code.",
  navLabel: "Home",
  group: "product",
  lastModified: CONTENT_REVIEWED,
  changeFrequency: "weekly",
  priority: 1,
};

export const ALL_PAGES: SitePage[] = [HOME_PAGE, ...STATIC_PAGES, ...GUIDE_PAGES];

/**
 * Looks a page up by its registry (English) path. With `locale: "ur"` the title,
 * description and nav label are the Urdu ones; `path` stays the registry key.
 */
export function pageFor(path: string, locale: Locale = "en"): SitePage {
  const page = ALL_PAGES.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`No SEO registry entry for ${path}`);
  if (locale === "en") return page;
  const translated = URDU_PAGE_META[path];
  if (!translated) throw new Error(`No Urdu SEO registry entry for ${path}`);
  return { ...page, ...translated };
}

export function pagesInGroup(group: PageGroup, locale: Locale = "en"): SitePage[] {
  return STATIC_PAGES.filter((page) => page.group === group).map((page) => pageFor(page.path, locale));
}

export function guidePagesFor(locale: Locale = "en"): SitePage[] {
  return GUIDE_PAGES.map((page) => pageFor(page.path, locale));
}
