import Link from "next/link";
import type { ContentPageData } from "@/lib/content/types";
import { breadcrumbNode, faqNode, howToNode, webPageNode } from "@/lib/seo/jsonld";
import { type Locale, localePath } from "@/lib/seo/locale";
import { pageFor } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";
import { Breadcrumbs } from "./Breadcrumbs";
import { FaqList } from "./FaqList";
import { PageShell } from "./PageShell";
import { RichText } from "./RichText";
import { Sections } from "./Blocks";
import { formatDate } from "./format";

type Props = {
  page: ContentPageData;
  schemaType?: "WebPage" | "AboutPage";
  locale?: Locale;
};

/** Renders a standard marketing or legal page and its structured data from one content object. */
export function ContentPage({ page, schemaType = "WebPage", locale = "en" }: Props) {
  const ui = UI[locale];
  const meta = pageFor(page.path, locale);
  const urlPath = localePath(page.path, locale);
  const isHome = page.path === "/";
  const crumbs = isHome
    ? [{ name: ui.home, path: urlPath }]
    : [
        { name: ui.home, path: localePath("/", locale) },
        { name: meta.navLabel, path: urlPath },
      ];

  const howToSection = page.howTo ? page.sections.find((section) => section.id === page.howTo?.sectionId) : undefined;
  const steps = howToSection?.blocks.find((block) => block.type === "steps");

  const jsonLd = [
    webPageNode({
      path: urlPath,
      name: page.h1,
      description: meta.description,
      type: schemaType,
      dateModified: meta.lastModified,
      breadcrumb: !isHome,
      locale,
    }),
    ...(isHome ? [] : [breadcrumbNode(urlPath, crumbs)]),
    ...(page.faqs?.length ? [faqNode(urlPath, page.faqs)] : []),
    ...(page.howTo && steps?.type === "steps"
      ? [howToNode({ path: urlPath, name: page.howTo.name, description: page.howTo.description, steps: steps.items })]
      : []),
  ];

  const toc = page.sections.length >= 4;
  const related = (page.related ?? []).map((path) => pageFor(path, locale));

  return (
    <PageShell jsonLd={jsonLd} locale={locale} path={page.path}>
      <article className="site-page">
        <header className="site-page-header">
          {isHome ? null : <Breadcrumbs crumbs={crumbs} locale={locale} />}
          <p className="site-eyebrow">{page.eyebrow}</p>
          <h1>{page.h1}</h1>
          <p className="site-lead">
            <RichText text={page.lead} />
          </p>
          <p className="site-meta">
            {ui.lastReviewed} <time dateTime={meta.lastModified}>{formatDate(meta.lastModified, locale)}</time>
          </p>
        </header>

        <div className={toc ? "site-body site-body-toc" : "site-body"}>
          {toc ? (
            <nav className="site-toc" aria-label={ui.onThisPage}>
              <p>{ui.onThisPage}</p>
              <ol>
                {page.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
                {page.faqs?.length ? (
                  <li>
                    <a href="#questions">{ui.commonQuestions}</a>
                  </li>
                ) : null}
              </ol>
            </nav>
          ) : null}

          <div className="site-content">
            <Sections sections={page.sections} locale={locale} />

            {page.faqs?.length ? (
              <section id="questions" className="site-section" aria-labelledby="questions-heading">
                <h2 id="questions-heading">{ui.commonQuestions}</h2>
                <FaqList faqs={page.faqs} />
              </section>
            ) : null}

            {page.sources?.length ? (
              <section id="sources" className="site-section" aria-labelledby="sources-heading">
                <h2 id="sources-heading">{ui.sources}</h2>
                <ul className="site-sources">
                  {page.sources.map((source) => (
                    <li key={source.url}>
                      {/* Source titles are the original English publication titles. */}
                      <a href={source.url} rel="noopener noreferrer" target="_blank" {...(locale === "ur" ? { lang: "en", dir: "ltr" } : {})}>
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>

        <section className="site-cta" aria-labelledby="cta-heading">
          <div>
            <h2 id="cta-heading">{page.cta.title}</h2>
            <p>{page.cta.text}</p>
          </div>
          <div className="site-cta-actions">
            <Link className="site-button" href={page.cta.primary.href}>
              {page.cta.primary.label}
            </Link>
            {page.cta.secondary ? (
              <Link className="site-button site-button-quiet" href={page.cta.secondary.href}>
                {page.cta.secondary.label}
              </Link>
            ) : null}
          </div>
        </section>

        {related.length ? (
          <nav className="site-related" aria-label={ui.relatedPages}>
            <h2>{ui.keepReading}</h2>
            <ul>
              {related.map((item) => (
                <li key={item.path}>
                  <Link href={localePath(item.path, locale)}>{item.navLabel}</Link>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </article>
    </PageShell>
  );
}
