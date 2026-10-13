import { type Locale, localePath } from "../seo/locale";
import { absoluteUrl } from "../seo/site";
import type { Article, Block, ContentPageData, Faq, Section } from "./types";

const HEADINGS: Record<Locale, { questions: string; takeaways: string; sources: string; updated: string }> = {
  en: { questions: "Common questions", takeaways: "Key takeaways", sources: "Sources", updated: "Updated" },
  ur: { questions: "عام سوالات", takeaways: "اہم نکات", sources: "حوالہ جات", updated: "تازہ کاری" },
};

/** Resolves relative content links to absolute URLs so exported text stands alone. */
function absolutise(text: string): string {
  return text.replace(/\]\((\/[^)]*)\)/g, (_match, path: string) => `](${absoluteUrl(path)})`);
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    case "p":
      return absolutise(block.text);
    case "callout":
      return `> ${block.title ? `**${block.title}.** ` : ""}${absolutise(block.text)}`;
    case "ul":
      return block.items.map((item) => `- ${absolutise(item)}`).join("\n");
    case "ol":
      return block.items.map((item, index) => `${index + 1}. ${absolutise(item)}`).join("\n");
    case "steps":
      return block.items.map((item, index) => `${index + 1}. **${item.title}.** ${absolutise(item.text)}`).join("\n");
    case "table": {
      const header = `| ${block.headers.join(" | ")} |`;
      const divider = `| ${block.headers.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map((row) => `| ${row.join(" | ")} |`);
      return [block.caption ? `*${block.caption}*\n` : "", header, divider, ...rows].join("\n").trim();
    }
  }
}

function sectionsToMarkdown(sections: Section[]): string {
  return sections
    .map((section) => `## ${section.heading}\n\n${section.blocks.map(blockToMarkdown).join("\n\n")}`)
    .join("\n\n");
}

function faqsToMarkdown(faqs: Faq[] | undefined, locale: Locale): string {
  if (!faqs?.length) return "";
  return `## ${HEADINGS[locale].questions}\n\n${faqs.map((faq) => `**${faq.q}**\n${absolutise(faq.a)}`).join("\n\n")}`;
}

export function pageToMarkdown(page: ContentPageData, locale: Locale = "en"): string {
  return [
    `# ${page.h1}`,
    `URL: ${absoluteUrl(localePath(page.path, locale))}`,
    absolutise(page.lead),
    sectionsToMarkdown(page.sections),
    faqsToMarkdown(page.faqs, locale),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** `path` is the registry path (for example "/guides/some-slug"); it is localised here. */
export function articleToMarkdown(article: Article, path: string, locale: Locale = "en"): string {
  return [
    `# ${article.title}`,
    `URL: ${absoluteUrl(localePath(path, locale))}`,
    `${HEADINGS[locale].updated}: ${article.updatedAt}`,
    absolutise(article.summary),
    `## ${HEADINGS[locale].takeaways}\n\n${article.takeaways.map((item) => `- ${absolutise(item)}`).join("\n")}`,
    sectionsToMarkdown(article.sections),
    faqsToMarkdown(article.faqs, locale),
    article.sources?.length ? `## ${HEADINGS[locale].sources}\n\n${article.sources.map((source) => `- [${source.label}](${source.url})`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
