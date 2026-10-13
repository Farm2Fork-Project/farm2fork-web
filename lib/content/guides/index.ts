import type { Article } from "../types";
import { BUY_DIRECT, STORE_PRODUCE } from "./buying-and-storing";
import { SELL_ONLINE, SEASONAL } from "./farming";
import { MIDDLEMEN, POST_HARVEST } from "./supply-chain";
import { HOW_BLOCKCHAIN_WORKS, WHAT_IS_TRACEABILITY } from "./traceability";

/** Newest first. */
export const GUIDES: Article[] = [
  BUY_DIRECT,
  WHAT_IS_TRACEABILITY,
  HOW_BLOCKCHAIN_WORKS,
  MIDDLEMEN,
  POST_HARVEST,
  SEASONAL,
  SELL_ONLINE,
  STORE_PRODUCE,
];

export function getGuide(slug: string): Article | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guidePath(slug: string): string {
  return `/guides/${slug}`;
}

/** Approximate reading time from the visible text of an article. */
export function readingMinutes(article: Article): number {
  const text = [
    article.summary,
    ...article.takeaways,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap((block) => {
        switch (block.type) {
          case "p":
          case "callout":
            return [block.text];
          case "ul":
          case "ol":
            return block.items;
          case "steps":
            return block.items.flatMap((item) => [item.title, item.text]);
          case "table":
            return [...block.headers, ...block.rows.flat()];
        }
      }),
    ]),
    ...(article.faqs ?? []).flatMap((faq) => [faq.q, faq.a]),
  ].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
