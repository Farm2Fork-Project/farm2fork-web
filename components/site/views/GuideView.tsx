import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Sections } from "@/components/site/Blocks";
import { FaqList } from "@/components/site/FaqList";
import { PageShell } from "@/components/site/PageShell";
import { RichText } from "@/components/site/RichText";
import { formatDate } from "@/components/site/format";
import { getGuideFor } from "@/lib/content/locale";
import { guidePath, readingMinutes } from "@/lib/content/guides";
import { absoluteUrl } from "@/lib/seo/site";
import { articleNode, breadcrumbNode, faqNode, webPageNode } from "@/lib/seo/jsonld";
import { type Locale, localePath } from "@/lib/seo/locale";
import { pageFor } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

export function GuideView({ slug, locale = "en" }: { slug: string; locale?: Locale }) {
  const ui = UI[locale];
  const guide = getGuideFor(locale, slug);
  if (!guide) notFound();

  const registryPath = guidePath(guide.slug);
  const urlPath = localePath(registryPath, locale);
  const meta = pageFor(registryPath, locale);
  // Share cards are English-only; Urdu guides reuse the English guide's card.
  const imageUrl = absoluteUrl(`${registryPath}/opengraph-image`);
  const crumbs = [
    { name: ui.home, path: localePath("/", locale) },
    { name: ui.guides.crumb, path: localePath("/guides", locale) },
    { name: guide.metaTitle, path: urlPath },
  ];
  const related = guide.related.flatMap((relatedSlug) => {
    const item = getGuideFor(locale, relatedSlug);
    return item ? [item] : [];
  });

  return (
    <PageShell
      locale={locale}
      path={registryPath}
      jsonLd={[
        webPageNode({ path: urlPath, name: guide.title, description: meta.description, dateModified: guide.updatedAt, breadcrumb: true, locale }),
        articleNode(guide, urlPath, imageUrl, locale),
        breadcrumbNode(urlPath, crumbs),
        ...(guide.faqs?.length ? [faqNode(urlPath, guide.faqs)] : []),
      ]}
    >
      <article className="site-page site-article">
        <header className="site-page-header">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
          <p className="site-eyebrow">{ui.categories[guide.category]}</p>
          <h1>{guide.title}</h1>
          <p className="site-lead">
            <RichText text={guide.summary} />
          </p>
          <p className="site-meta">
            {ui.byTeam} · {ui.minRead(readingMinutes(guide))} · {ui.published}{" "}
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt, locale)}</time>
            {guide.updatedAt !== guide.publishedAt ? (
              <>
                {" "}
                · {ui.updated} <time dateTime={guide.updatedAt}>{formatDate(guide.updatedAt, locale)}</time>
              </>
            ) : null}
          </p>
        </header>

        <div className="site-body site-body-toc">
          <nav className="site-toc" aria-label={ui.onThisPage}>
            <p>{ui.onThisPage}</p>
            <ol>
              {guide.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
              {guide.faqs?.length ? (
                <li>
                  <a href="#questions">{ui.commonQuestions}</a>
                </li>
              ) : null}
            </ol>
          </nav>

          <div className="site-content">
            <aside className="site-takeaways" aria-labelledby="takeaways-heading">
              <h2 id="takeaways-heading">{ui.keyTakeaways}</h2>
              <ul>
                {guide.takeaways.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            </aside>

            <Sections sections={guide.sections} locale={locale} />

            {guide.faqs?.length ? (
              <section id="questions" className="site-section" aria-labelledby="questions-heading">
                <h2 id="questions-heading">{ui.commonQuestions}</h2>
                <FaqList faqs={guide.faqs} />
              </section>
            ) : null}

            {guide.sources?.length ? (
              <section id="sources" className="site-section" aria-labelledby="sources-heading">
                <h2 id="sources-heading">{ui.sources}</h2>
                <ul className="site-sources">
                  {guide.sources.map((source) => (
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
            <h2 id="cta-heading">{ui.guide.ctaTitle}</h2>
            <p>{ui.guide.ctaText}</p>
          </div>
          <div className="site-cta-actions">
            <Link className="site-button" href={localePath("/how-it-works", locale)}>
              {ui.guide.cta1}
            </Link>
            <Link className="site-button site-button-quiet" href="/signup">
              {ui.guide.cta2}
            </Link>
          </div>
        </section>

        {related.length ? (
          <nav className="site-related" aria-label={ui.relatedGuides}>
            <h2>{ui.relatedGuides}</h2>
            <ul>
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={localePath(guidePath(item.slug), locale)}>{item.title}</Link>
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
