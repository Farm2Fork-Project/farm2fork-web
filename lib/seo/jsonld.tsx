import type { Article, Faq } from "../content/types";
import { type Locale, LOCALE_META, localePath } from "./locale";
import { CONTACT_EMAIL, ORGANIZATION, ORGANIZATION_DESCRIPTION_UR, SITE_DESCRIPTION, SITE_DESCRIPTION_UR, SITE_NAME, absoluteUrl } from "./site";

type JsonObject = Record<string, unknown>;

const ORG_ID = absoluteUrl("/#organization");
const SITE_IDS: Record<Locale, string> = { en: absoluteUrl("/#website"), ur: `${absoluteUrl(localePath("/", "ur"))}#website` };

/** Renders JSON-LD. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: JsonObject | JsonObject[] }) {
  const payload = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationNode(locale: Locale = "en"): JsonObject {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/logo-512.png"),
      width: 512,
      height: 512,
    },
    description: locale === "ur" ? ORGANIZATION_DESCRIPTION_UR : ORGANIZATION.description,
    areaServed: { "@type": "Country", name: "Pakistan" },
    parentOrganization: { "@type": "CollegeOrUniversity", name: ORGANIZATION.institution },
    ...(CONTACT_EMAIL
      ? { contactPoint: { "@type": "ContactPoint", email: CONTACT_EMAIL, contactType: "customer support", availableLanguage: ["en", "ur"] } }
      : {}),
  };
}

export function websiteNode(locale: Locale = "en"): JsonObject {
  return {
    "@type": "WebSite",
    "@id": SITE_IDS[locale],
    url: absoluteUrl(localePath("/", locale)),
    name: SITE_NAME,
    description: locale === "ur" ? SITE_DESCRIPTION_UR : SITE_DESCRIPTION,
    inLanguage: LOCALE_META[locale].lang,
    publisher: { "@id": ORG_ID },
  };
}

export function webPageNode(input: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "FAQPage" | "ContactPage";
  dateModified?: string;
  breadcrumb?: boolean;
  locale?: Locale;
}): JsonObject {
  const locale = input.locale ?? "en";
  const url = absoluteUrl(input.path);
  return {
    "@type": input.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: LOCALE_META[locale].lang,
    isPartOf: { "@id": SITE_IDS[locale] },
    about: { "@id": ORG_ID },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.breadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(path: string, crumbs: Crumb[]): JsonObject {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Strips the tiny inline markup (`[label](url)`, `**bold**`) used in content strings. */
export function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

export function faqNode(path: string, faqs: Faq[]): JsonObject {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: plainText(faq.a) },
    })),
  };
}

export function howToNode(input: { path: string; name: string; description: string; steps: { title: string; text: string }[] }): JsonObject {
  return {
    "@type": "HowTo",
    "@id": `${absoluteUrl(input.path)}#howto`,
    name: input.name,
    description: input.description,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: plainText(step.text),
    })),
  };
}

export function articleNode(article: Article, path: string, imageUrl: string, locale: Locale = "en"): JsonObject {
  const url = absoluteUrl(path);
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: LOCALE_META[locale].lang,
    articleSection: article.category,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export type TermInput = { term: string; definition: string; /** Anchor id; defaults to a slug of `term`. */ id?: string; alternateName?: string };

export function definedTermSetNode(path: string, terms: TermInput[], options: { name?: string; locale?: Locale } = {}): JsonObject {
  const url = absoluteUrl(path);
  const locale = options.locale ?? "en";
  return {
    "@type": "DefinedTermSet",
    "@id": `${url}#terms`,
    name: options.name ?? "Farm2Fork glossary",
    inLanguage: LOCALE_META[locale].lang,
    hasDefinedTerm: terms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      ...(term.alternateName ? { alternateName: term.alternateName } : {}),
      description: term.definition,
      inDefinedTermSet: { "@id": `${url}#terms` },
      url: `${url}#${term.id ?? termId(term.term)}`,
    })),
  };
}

export function itemListNode(path: string, items: { name: string; path: string }[]): JsonObject {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#list`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function termId(term: string): string {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
