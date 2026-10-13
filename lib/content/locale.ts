import type { Locale } from "../seo/locale";
import { FAQ_GROUPS, type FaqGroup } from "./faqs";
import { GLOSSARY } from "./glossary";
import { GUIDES, getGuide } from "./guides";
import { termId } from "../seo/jsonld";
import type { Article } from "./types";
import { FAQ_GROUPS_UR } from "./ur/faqs";
import { GLOSSARY_UR } from "./ur/glossary";
import { GUIDES_UR } from "./ur/guides";

/** Locale-neutral glossary entry, ready to render. */
export type GlossaryEntry = {
  id: string;
  term: string;
  /** The same term in the other language, shown beside the term. */
  alternate?: { text: string; lang: "ur" | "en" };
  definition: string;
  /** Internal link target (already localised). */
  more?: string;
};

export function faqGroupsFor(locale: Locale): FaqGroup[] {
  return locale === "ur" ? FAQ_GROUPS_UR : FAQ_GROUPS;
}

export function guidesFor(locale: Locale): Article[] {
  return locale === "ur" ? GUIDES_UR : GUIDES;
}

export function getGuideFor(locale: Locale, slug: string): Article | undefined {
  return locale === "ur" ? GUIDES_UR.find((guide) => guide.slug === slug) : getGuide(slug);
}

export function glossaryFor(locale: Locale): GlossaryEntry[] {
  if (locale === "ur") {
    const collator = new Intl.Collator("ur");
    return [...GLOSSARY_UR]
      .sort((a, b) => collator.compare(a.term, b.term))
      .map((entry) => ({
        id: entry.id,
        term: entry.term,
        alternate: entry.english ? { text: entry.english, lang: "en" as const } : undefined,
        definition: entry.definition,
        more: entry.more,
      }));
  }
  return GLOSSARY.map((entry) => ({
    id: termId(entry.term),
    term: entry.term,
    alternate: entry.urdu ? { text: entry.urdu, lang: "ur" as const } : undefined,
    definition: entry.definition,
    more: entry.more,
  }));
}
