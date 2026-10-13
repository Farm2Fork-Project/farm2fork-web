import { describe, expect, test } from "vitest";
import { ALL_FAQS, FAQ_GROUPS } from "@/lib/content/faqs";
import { GLOSSARY } from "@/lib/content/glossary";
import { GUIDES, guidePath } from "@/lib/content/guides";
import { PRIVACY, TERMS } from "@/lib/content/legal";
import { articleToMarkdown, pageToMarkdown } from "@/lib/content/markdown";
import { ABOUT, FOR_BUYERS, FOR_FARMERS, FOR_TRANSPORTERS, HOW_IT_WORKS, TRACEABILITY } from "@/lib/content/site-pages";
import { ALL_FAQS_UR, FAQ_GROUPS_UR, HOME_FAQS_UR } from "@/lib/content/ur/faqs";
import { GLOSSARY_UR } from "@/lib/content/ur/glossary";
import { HOME_UR } from "@/lib/content/ur/home";
import { GUIDES_UR } from "@/lib/content/ur/guides";
import { PRIVACY_UR, TERMS_UR } from "@/lib/content/ur/legal";
import { ABOUT_UR, FOR_BUYERS_UR, FOR_FARMERS_UR, FOR_TRANSPORTERS_UR, HOW_IT_WORKS_UR, TRACEABILITY_UR } from "@/lib/content/ur/site-pages";
import { faqNode, plainText, termId, webPageNode, websiteNode } from "@/lib/seo/jsonld";
import { localePath, stripLocalePrefix } from "@/lib/seo/locale";
import { buildMetadata } from "@/lib/seo/metadata";
import { ALL_PAGES, STATIC_PAGES, guidePagesFor, pageFor } from "@/lib/seo/pages";
import { absoluteUrl } from "@/lib/seo/site";
import sitemap from "@/app/sitemap";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import { GET as llmsFullTxt } from "@/app/llms-full.txt/route";

const SUFFIX = " | Farm2Fork".length;
const PAGES = [HOW_IT_WORKS, TRACEABILITY, FOR_FARMERS, FOR_BUYERS, FOR_TRANSPORTERS, ABOUT, PRIVACY, TERMS];

describe("SEO registry", () => {
  test("titles fit a search result once the site suffix is added", () => {
    for (const page of ALL_PAGES) {
      const length = page.path === "/" ? page.title.length : page.title.length + SUFFIX;
      expect(length, `${page.path} title is ${length} chars`).toBeLessThanOrEqual(60);
      expect(page.title.length, `${page.path} title too short`).toBeGreaterThanOrEqual(10);
    }
  });

  test("descriptions are 70-160 characters", () => {
    for (const page of ALL_PAGES) {
      expect(page.description.length, `${page.path} description is ${page.description.length} chars`).toBeGreaterThanOrEqual(70);
      expect(page.description.length, `${page.path} description is ${page.description.length} chars`).toBeLessThanOrEqual(160);
    }
  });

  test("titles, descriptions and paths are unique", () => {
    for (const key of ["title", "description", "path"] as const) {
      const values = ALL_PAGES.map((page) => page[key]);
      expect(new Set(values).size, `duplicate ${key}`).toBe(values.length);
    }
  });

  test("paths are lowercase, hyphenated and shallow", () => {
    for (const page of ALL_PAGES) {
      expect(page.path).toMatch(/^\/[a-z0-9\-/]*$/);
      expect(page.path.split("/").length).toBeLessThanOrEqual(3);
    }
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  test("lists every public page, English then Urdu, with an absolute URL and no private route", () => {
    expect(entries.map((entry) => entry.url)).toEqual([
      ...ALL_PAGES.map((page) => absoluteUrl(page.path)),
      ...ALL_PAGES.map((page) => absoluteUrl(localePath(page.path, "ur"))),
    ]);
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.url).not.toMatch(/\/(admin|farmer|transporter|financial|order|account|login|signup|verify-email|forgot-password)(\/|$)/);
    }
  });

  test("lastModified is a real date, not the build time", () => {
    for (const entry of entries) expect(String(entry.lastModified)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("content", () => {
  const knownPaths = new Set([
    ...ALL_PAGES.map((page) => page.path),
    "/contact",
    "/farmer",
    "/transporter",
    // The sign-up pages are app routes (noindex), linked from the content.
    "/login",
    "/signup",
    "/signup/farmer",
  ]);

  const internalLinks = (value: unknown): string[] => {
    const json = JSON.stringify(value);
    const found = [...json.matchAll(/\]\((\/[^)\s"]*)\)/g)].map((match) => match[1]);
    const hrefs = [...json.matchAll(/"(?:href|more)":"(\/[^"]*)"/g)].map((match) => match[1]);
    const related = [...json.matchAll(/"related":\[([^\]]*)\]/g)].flatMap((match) => [...match[1].matchAll(/"(\/[^"]+)"/g)].map((m) => m[1]));
    return [...found, ...hrefs, ...related].map((link) => link.split(/[?#]/)[0] || "/");
  };

  test("every internal link points at a real page", () => {
    const everything = { PAGES, GUIDES, GLOSSARY, FAQ_GROUPS };
    for (const link of internalLinks(everything)) {
      expect(knownPaths.has(link), `broken internal link: ${link}`).toBe(true);
    }
  });

  test("guide related slugs exist and slugs are unique", () => {
    const slugs = GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const guide of GUIDES) {
      for (const related of guide.related) expect(slugs, `${guide.slug} -> ${related}`).toContain(related);
      expect(guide.related).not.toContain(guide.slug);
    }
  });

  test("guides are answer-first and well structured", () => {
    for (const guide of GUIDES) {
      const words = guide.summary.split(/\s+/).length;
      expect(words, `${guide.slug} summary is ${words} words`).toBeGreaterThanOrEqual(30);
      expect(words, `${guide.slug} summary is ${words} words`).toBeLessThanOrEqual(75);
      expect(guide.takeaways.length).toBeGreaterThanOrEqual(3);
      expect(guide.sections.length).toBeGreaterThanOrEqual(3);
      expect(guide.faqs?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(guide.updatedAt >= guide.publishedAt).toBe(true);
      const ids = guide.sections.map((section) => section.id);
      expect(new Set(ids).size, `${guide.slug} has duplicate section ids`).toBe(ids.length);
    }
  });

  test("marketing pages have a lead, sections and one call to action", () => {
    for (const page of PAGES) {
      expect(page.lead.split(/\s+/).length, `${page.path} lead`).toBeGreaterThanOrEqual(25);
      expect(page.sections.length).toBeGreaterThanOrEqual(2);
      expect(page.cta.primary.href).toMatch(/^\//);
      if (page.howTo) {
        const section = page.sections.find((candidate) => candidate.id === page.howTo?.sectionId);
        expect(section?.blocks.some((block) => block.type === "steps"), `${page.path} howTo needs a steps block`).toBe(true);
      }
    }
  });

  test("glossary terms are unique and alphabetical", () => {
    const terms = GLOSSARY.map((entry) => entry.term);
    expect(new Set(terms).size).toBe(terms.length);
    expect([...terms].sort((a, b) => a.localeCompare(b))).toEqual(terms);
  });

  test("makes no invented social proof or scale claims", () => {
    const text = JSON.stringify({ PAGES, GUIDES, GLOSSARY, FAQ_GROUPS });
    expect(text).not.toMatch(/thousands of|trusted by|\b\d[\d,]* (farmers|buyers|users|customers)\b|#1|best in/i);
  });

  test("statistics quoted from sources stay consistent across pages", () => {
    const text = JSON.stringify({ PAGES, GUIDES });
    // Verified against the Pakistan Economic Survey 2024-25 / 2025-26 and ADB (see guide sources).
    expect(text).not.toMatch(/\b(2[5-9]|3\d)(\.\d+)?% of (Pakistan's )?GDP/);
    expect(text).toContain("20% to 40%");
  });
});

describe("structured data and exports", () => {
  test("FAQ JSON-LD carries every question as plain text", () => {
    const node = faqNode("/faq", ALL_FAQS) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(node.mainEntity).toHaveLength(ALL_FAQS.length);
    for (const item of node.mainEntity) expect(item.acceptedAnswer.text).not.toMatch(/\]\(|\*\*/);
  });

  test("plainText strips link and bold markup", () => {
    expect(plainText("See [how it works](/how-it-works) and **trace** it.")).toBe("See how it works and trace it.");
  });

  test("markdown export uses absolute links", () => {
    const md = pageToMarkdown(HOW_IT_WORKS);
    expect(md).toContain(`](${absoluteUrl("/traceability")})`);
    expect(md).not.toMatch(/\]\(\/[a-z]/);
    expect(articleToMarkdown(GUIDES[0], guidePath(GUIDES[0].slug))).toContain("## Key takeaways");
  });

  test("static registry paths all have a matching route folder", async () => {
    const { existsSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    for (const page of STATIC_PAGES) {
      expect(existsSync(resolve(process.cwd(), "app", page.path.slice(1), "page.tsx")), page.path).toBe(true);
    }
  });
});

describe("Urdu pages", () => {
  const URDU_PAGES = [HOW_IT_WORKS_UR, TRACEABILITY_UR, FOR_FARMERS_UR, FOR_BUYERS_UR, FOR_TRANSPORTERS_UR, ABOUT_UR, PRIVACY_UR, TERMS_UR];
  const ENGLISH_PAGES = [HOW_IT_WORKS, TRACEABILITY, FOR_FARMERS, FOR_BUYERS, FOR_TRANSPORTERS, ABOUT, PRIVACY, TERMS];
  const ARABIC_SCRIPT = /[\u0600-\u06FF]/;
  const SUFFIX_LENGTH = " | Farm2Fork".length;

  /** App routes that stay in English because they are the signed-in app, not content pages. */
  const APP_LINKS = new Set(["/", "/farmer", "/transporter", "/login", "/signup", "/signup/farmer"]);

  const hrefsIn = (value: unknown): string[] => {
    const json = JSON.stringify(value);
    const inline = [...json.matchAll(/\]\((\/[^)\s"]*)\)/g)].map((match) => match[1]);
    const hrefs = [...json.matchAll(/"(?:href|more)":"(\/[^"]*)"/g)].map((match) => match[1]);
    return [...inline, ...hrefs];
  };

  const blockShape = (sections: { id: string; blocks: { type: string }[] }[]) =>
    sections.map((section) => `${section.id}:${section.blocks.map((block) => block.type).join(",")}`);

  test("every English page has an Urdu counterpart with its own metadata", () => {
    for (const page of ALL_PAGES) {
      const ur = pageFor(page.path, "ur");
      expect(ur.path, "the registry key stays the English path").toBe(page.path);
      expect(ur.title, `${page.path} has no Urdu title`).not.toBe(page.title);
      expect(ur.description, `${page.path} has no Urdu description`).not.toBe(page.description);
      for (const text of [ur.title, ur.description, ur.navLabel]) expect(text, `${page.path}: ${text}`).toMatch(ARABIC_SCRIPT);
    }
    expect(guidePagesFor("ur")).toHaveLength(GUIDES.length);
  });

  test("Urdu titles and descriptions fit a search result", () => {
    for (const page of ALL_PAGES) {
      const ur = pageFor(page.path, "ur");
      const length = page.path === "/" ? ur.title.length : ur.title.length + SUFFIX_LENGTH;
      expect(length, `${page.path} Urdu title is ${length} chars`).toBeLessThanOrEqual(60);
      expect(ur.title.length).toBeGreaterThanOrEqual(10);
      expect(ur.description.length, `${page.path} Urdu description is ${ur.description.length} chars`).toBeGreaterThanOrEqual(70);
      expect(ur.description.length, `${page.path} Urdu description is ${ur.description.length} chars`).toBeLessThanOrEqual(160);
    }
    for (const key of ["title", "description"] as const) {
      const values = ALL_PAGES.map((page) => pageFor(page.path, "ur")[key]);
      expect(new Set(values).size, `duplicate Urdu ${key}`).toBe(values.length);
    }
  });

  test("every English route folder has an Urdu one", async () => {
    const { existsSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const routes = [...STATIC_PAGES.map((page) => page.path), "/contact", "/guides"];
    for (const path of routes) {
      expect(existsSync(resolve(process.cwd(), "app", "ur", path.slice(1), "page.tsx")), `app/ur${path}`).toBe(true);
    }
    expect(existsSync(resolve(process.cwd(), "app", "ur", "page.tsx"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "app", "ur", "guides", "[slug]", "page.tsx"))).toBe(true);
  });

  test("marketing and legal pages mirror the English structure", () => {
    expect(URDU_PAGES.map((page) => page.path)).toEqual(ENGLISH_PAGES.map((page) => page.path));
    URDU_PAGES.forEach((ur, index) => {
      const en = ENGLISH_PAGES[index];
      expect(blockShape(ur.sections), `${ur.path} sections`).toEqual(blockShape(en.sections));
      expect(ur.faqs?.length ?? 0, `${ur.path} faqs`).toBe(en.faqs?.length ?? 0);
      expect(ur.howTo?.sectionId, `${ur.path} howTo`).toBe(en.howTo?.sectionId);
      expect(ur.related, `${ur.path} related`).toEqual(en.related);
      expect(ur.cta.primary.href.replace(/^\/ur/, "")).toBe(en.cta.primary.href.replace(/^\/ur/, ""));
      expect(ur.sources ?? [], `${ur.path} sources`).toEqual(en.sources ?? []);
      for (const text of [ur.h1, ur.lead, ur.eyebrow, ur.cta.title, ...ur.sections.map((section) => section.heading)]) {
        expect(text, `${ur.path}: "${text}" is not Urdu`).toMatch(ARABIC_SCRIPT);
      }
      expect(ur.lead.split(/\s+/).length, `${ur.path} lead`).toBeGreaterThanOrEqual(25);
    });
  });

  test("FAQs and glossary mirror the English ones", () => {
    expect(FAQ_GROUPS_UR.map((group) => [group.id, group.faqs.length])).toEqual(FAQ_GROUPS.map((group) => [group.id, group.faqs.length]));
    expect(ALL_FAQS_UR).toHaveLength(ALL_FAQS.length);
    expect(HOME_FAQS_UR).toHaveLength(5);
    for (const faq of ALL_FAQS_UR) expect(faq.q + faq.a).toMatch(ARABIC_SCRIPT);

    expect(GLOSSARY_UR.map((entry) => entry.id).sort()).toEqual(GLOSSARY.map((entry) => termId(entry.term)).sort());
    for (const entry of GLOSSARY_UR) {
      const en = GLOSSARY.find((candidate) => termId(candidate.term) === entry.id);
      expect(entry.english, entry.id).toBe(en?.term);
      expect(entry.term).toMatch(ARABIC_SCRIPT);
      expect(Boolean(entry.more), `${entry.id} link`).toBe(Boolean(en?.more));
      if (en?.more) expect(entry.more).toBe(localePath(en.more, "ur"));
      if (en?.urdu) expect(entry.term, `${entry.id} should use the Urdu term the English page quotes`).toContain(en.urdu);
    }
  });

  test("guides mirror the English ones", () => {
    expect(GUIDES_UR.map((guide) => guide.slug)).toEqual(GUIDES.map((guide) => guide.slug));
    GUIDES_UR.forEach((ur, index) => {
      const en = GUIDES[index];
      expect(ur.category).toBe(en.category);
      expect([ur.publishedAt, ur.updatedAt]).toEqual([en.publishedAt, en.updatedAt]);
      expect(ur.related).toEqual(en.related);
      expect(ur.takeaways.length, `${ur.slug} takeaways`).toBe(en.takeaways.length);
      expect(ur.faqs?.length ?? 0, `${ur.slug} faqs`).toBe(en.faqs?.length ?? 0);
      expect(ur.sources ?? [], `${ur.slug} sources`).toEqual(en.sources ?? []);
      expect(blockShape(ur.sections), `${ur.slug} sections`).toEqual(blockShape(en.sections));
      for (const text of [ur.title, ur.metaTitle, ur.description, ur.summary]) expect(text, `${ur.slug}: ${text}`).toMatch(ARABIC_SCRIPT);
      const words = ur.summary.split(/\s+/).length;
      expect(words, `${ur.slug} Urdu summary is ${words} words`).toBeGreaterThanOrEqual(30);
      expect(words, `${ur.slug} Urdu summary is ${words} words`).toBeLessThanOrEqual(90);
    });
  });

  test("every internal link points at a real Urdu page, or at the app", () => {
    const known = new Set([...ALL_PAGES.map((page) => page.path), "/contact"]);
    const everything = { URDU_PAGES, HOME_UR, GUIDES_UR, GLOSSARY_UR, FAQ_GROUPS_UR };
    for (const link of hrefsIn(everything)) {
      const path = link.split(/[?#]/)[0] || "/";
      if (link.startsWith("/ur")) {
        expect(known.has(stripLocalePrefix(path)), `broken Urdu link: ${link}`).toBe(true);
      } else {
        expect(APP_LINKS.has(path), `Urdu content links to the English page ${link}`).toBe(true);
      }
    }
  });

  test("makes no invented social proof or scale claims", () => {
    const text = JSON.stringify({ URDU_PAGES, HOME_UR, GUIDES_UR, GLOSSARY_UR, FAQ_GROUPS_UR });
    expect(text).not.toMatch(/ہزاروں|لاکھوں|ہزار (کسان|خریدار|صارفین|گاہک)|\d[\d,]* (کسان|خریدار|صارفین|گاہک)|#1|نمبر ?1|مقبول ترین|اعتماد کرتے ہیں/);
  });

  test("statistics match the English pages", () => {
    const text = JSON.stringify({ URDU_PAGES, GUIDES_UR });
    expect(text).toContain("20 سے 40 فیصد");
    expect(text).toContain("23.5 فیصد");
    expect(text).toContain("37 فیصد");
    expect(text).not.toMatch(/(2[5-9]|3\d)(\.\d+)? فیصد (حصہ|تک)/);
  });
});

describe("Urdu structured data, hreflang and exports", () => {
  test("Urdu JSON-LD declares its language", () => {
    expect(websiteNode("ur")).toMatchObject({ inLanguage: "ur", url: absoluteUrl("/ur") });
    expect(websiteNode("en")).toMatchObject({ inLanguage: "en", url: absoluteUrl("/") });
    expect(webPageNode({ path: "/ur/about", name: "x", description: "y", locale: "ur" })).toMatchObject({ inLanguage: "ur" });
    expect(webPageNode({ path: "/about", name: "x", description: "y" })).toMatchObject({ inLanguage: "en" });
  });

  test("every page links its alternates in both directions, with x-default pointing at English", () => {
    for (const page of ALL_PAGES) {
      for (const locale of ["en", "ur"] as const) {
        const meta = buildMetadata({ path: page.path, locale });
        const languages = meta.alternates?.languages as Record<string, string>;
        expect(languages, page.path).toEqual({
          en: absoluteUrl(page.path),
          ur: absoluteUrl(localePath(page.path, "ur")),
          "x-default": absoluteUrl(page.path),
        });
        expect(meta.alternates?.canonical).toBe(absoluteUrl(localePath(page.path, locale)));
      }
    }
  });

  test("sitemap entries carry the same alternates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(ALL_PAGES.length * 2);
    for (const entry of entries) {
      expect(Object.keys(entry.alternates?.languages ?? {}).sort()).toEqual(["en", "ur", "x-default"]);
    }
  });

  test("Urdu markdown uses absolute /ur links and Urdu headings", () => {
    const md = pageToMarkdown(HOW_IT_WORKS_UR, "ur");
    expect(md).toContain(`URL: ${absoluteUrl("/ur/how-it-works")}`);
    expect(md).toContain(`](${absoluteUrl("/ur/traceability")})`);
    expect(md).toContain("## عام سوالات");
    expect(md).not.toMatch(/\]\(\/[a-z]/);
    expect(articleToMarkdown(GUIDES_UR[0], guidePath(GUIDES_UR[0].slug), "ur")).toContain("## اہم نکات");
  });

  test("llms.txt and llms-full.txt include the Urdu pages", async () => {
    const short = await llmsTxt().text();
    for (const page of ALL_PAGES) {
      expect(short, page.path).toContain(absoluteUrl(localePath(page.path, "ur")));
    }
    const full = await llmsFullTxt().text();
    for (const guide of GUIDES_UR) expect(full).toContain(`URL: ${absoluteUrl(`/ur/guides/${guide.slug}`)}`);
    expect(full).toContain(`URL: ${absoluteUrl("/ur/faq")}`);
    expect(full).toContain(`URL: ${absoluteUrl("/ur/glossary")}`);
  });
});
