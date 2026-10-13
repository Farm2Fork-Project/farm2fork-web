import { ALL_FAQS } from "@/lib/content/faqs";
import { ALL_FAQS_UR } from "@/lib/content/ur/faqs";
import { GLOSSARY_UR } from "@/lib/content/ur/glossary";
import { GUIDES_UR } from "@/lib/content/ur/guides";
import { PRIVACY_UR, TERMS_UR } from "@/lib/content/ur/legal";
import { ABOUT_UR, FOR_BUYERS_UR, FOR_FARMERS_UR, FOR_TRANSPORTERS_UR, HOW_IT_WORKS_UR, TRACEABILITY_UR } from "@/lib/content/ur/site-pages";
import { HOME_UR } from "@/lib/content/ur/home";
import { localePath } from "@/lib/seo/locale";
import { GLOSSARY } from "@/lib/content/glossary";
import { GUIDES, guidePath } from "@/lib/content/guides";
import { PRIVACY, TERMS } from "@/lib/content/legal";
import { articleToMarkdown, pageToMarkdown } from "@/lib/content/markdown";
import { ABOUT, FOR_BUYERS, FOR_FARMERS, FOR_TRANSPORTERS, HOW_IT_WORKS, TRACEABILITY } from "@/lib/content/site-pages";
import { ORGANIZATION, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

/** Every public page as Markdown in one file, for AI assistants that prefer a single fetch. */
export function GET() {
  const faq = [
    "# Farm2Fork frequently asked questions",
    `URL: ${absoluteUrl("/faq")}`,
    ...ALL_FAQS.map((entry) => `**${entry.q}**\n${entry.a}`),
  ].join("\n\n");

  const glossary = [
    "# Farm-to-fork glossary",
    `URL: ${absoluteUrl("/glossary")}`,
    ...GLOSSARY.map((entry) => `**${entry.term}${entry.urdu ? ` (${entry.urdu})` : ""}.** ${entry.definition}`),
  ].join("\n\n");

  const documents = [
    pageToMarkdown(ABOUT),
    pageToMarkdown(HOW_IT_WORKS),
    pageToMarkdown(TRACEABILITY),
    pageToMarkdown(FOR_FARMERS),
    pageToMarkdown(FOR_BUYERS),
    pageToMarkdown(FOR_TRANSPORTERS),
    faq,
    glossary,
    ...GUIDES.map((guide) => articleToMarkdown(guide, guidePath(guide.slug))),
    pageToMarkdown(PRIVACY),
    pageToMarkdown(TERMS),
  ];

  const faqUr = [
    "# Farm2Fork کے بارے میں اکثر پوچھے جانے والے سوالات",
    `URL: ${absoluteUrl(localePath("/faq", "ur"))}`,
    ...ALL_FAQS_UR.map((entry) => `**${entry.q}**\n${entry.a}`),
  ].join("\n\n");

  const glossaryUr = [
    "# کھیت سے دسترخوان تک کی لغت",
    `URL: ${absoluteUrl(localePath("/glossary", "ur"))}`,
    ...GLOSSARY_UR.map((entry) => `**${entry.term}${entry.english ? ` (${entry.english})` : ""}.** ${entry.definition}`),
  ].join("\n\n");

  const urduDocuments = [
    pageToMarkdown(HOME_UR, "ur"),
    pageToMarkdown(ABOUT_UR, "ur"),
    pageToMarkdown(HOW_IT_WORKS_UR, "ur"),
    pageToMarkdown(TRACEABILITY_UR, "ur"),
    pageToMarkdown(FOR_FARMERS_UR, "ur"),
    pageToMarkdown(FOR_BUYERS_UR, "ur"),
    pageToMarkdown(FOR_TRANSPORTERS_UR, "ur"),
    faqUr,
    glossaryUr,
    ...GUIDES_UR.map((guide) => articleToMarkdown(guide, guidePath(guide.slug), "ur")),
    pageToMarkdown(PRIVACY_UR, "ur"),
    pageToMarkdown(TERMS_UR, "ur"),
  ];

  const body =
    [
      `# ${SITE_NAME}: full site content`,
      `> ${ORGANIZATION.description}`,
      ...documents,
      "# Urdu versions (اردو)\n\nThe pages below are the Urdu versions of the pages above. The Urdu text is still awaiting a full native-speaker review, and the English text remains the authoritative version.",
      ...urduDocuments,
    ].join("\n\n---\n\n") + "\n";

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
