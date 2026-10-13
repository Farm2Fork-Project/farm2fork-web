/**
 * Inline text supports `[label](/path)` links and `**bold**`. Nothing else, so
 * content stays easy to review and safe to render.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "callout"; title?: string; text: string };

export type Section = {
  id: string;
  heading: string;
  blocks: Block[];
};

export type Faq = { q: string; a: string };

export type Source = { label: string; url: string };

export type CtaLink = { label: string; href: string };

/** A standard marketing page: H1, answer-first lead, sections, FAQ, call to action. */
export type ContentPageData = {
  /** Registry path, for example "/how-it-works". */
  path: string;
  eyebrow: string;
  h1: string;
  /** Answer-first summary. Keep it a self-contained 40-60 word definition. */
  lead: string;
  sections: Section[];
  faqs?: Faq[];
  sources?: Source[];
  /** Marks a `steps` block as a HowTo so the same steps are exposed as structured data. */
  howTo?: { sectionId: string; name: string; description: string };
  cta: { title: string; text: string; primary: CtaLink; secondary?: CtaLink };
  related?: string[];
};

export type Article = {
  slug: string;
  /** H1 shown on the page. */
  title: string;
  /** <title> without the site suffix. */
  metaTitle: string;
  description: string;
  category: "Buying" | "Traceability" | "Farming" | "Supply chain";
  publishedAt: string;
  updatedAt: string;
  /** Answer-first summary shown under the title and used as the lead. */
  summary: string;
  takeaways: string[];
  sections: Section[];
  faqs?: Faq[];
  sources?: Source[];
  related: string[];
};

export type GlossaryTerm = {
  term: string;
  urdu?: string;
  definition: string;
  /** Registry path or guide slug path to read more. */
  more?: string;
};
