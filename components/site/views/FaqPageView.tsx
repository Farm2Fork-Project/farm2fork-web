import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FaqList } from "@/components/site/FaqList";
import { PageShell } from "@/components/site/PageShell";
import { formatDate } from "@/components/site/format";
import { faqGroupsFor } from "@/lib/content/locale";
import { breadcrumbNode, faqNode, webPageNode } from "@/lib/seo/jsonld";
import { type Locale, localePath } from "@/lib/seo/locale";
import { pageFor } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

const PATH = "/faq";

export function FaqPageView({ locale = "en" }: { locale?: Locale }) {
  const ui = UI[locale];
  const groups = faqGroupsFor(locale);
  const meta = pageFor(PATH, locale);
  const urlPath = localePath(PATH, locale);
  const crumbs = [
    { name: ui.home, path: localePath("/", locale) },
    { name: ui.faq.crumb, path: urlPath },
  ];

  return (
    <PageShell
      locale={locale}
      path={PATH}
      jsonLd={[
        webPageNode({ path: urlPath, name: ui.faq.jsonName, description: meta.description, dateModified: meta.lastModified, breadcrumb: true, locale }),
        breadcrumbNode(urlPath, crumbs),
        faqNode(urlPath, groups.flatMap((group) => group.faqs)),
      ]}
    >
      <article className="site-page">
        <header className="site-page-header">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
          <p className="site-eyebrow">{ui.faq.eyebrow}</p>
          <h1>{ui.faq.h1}</h1>
          <p className="site-lead">{ui.faq.lead}</p>
          <p className="site-meta">
            {ui.lastReviewed} <time dateTime={meta.lastModified}>{formatDate(meta.lastModified, locale)}</time>
          </p>
        </header>

        <div className="site-body site-body-toc">
          <nav className="site-toc" aria-label={ui.onThisPage}>
            <p>{ui.onThisPage}</p>
            <ol>
              {groups.map((group) => (
                <li key={group.id}>
                  <a href={`#${group.id}`}>{group.title}</a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="site-content">
            {groups.map((group) => (
              <section key={group.id} id={group.id} className="site-section" aria-labelledby={`${group.id}-heading`}>
                <h2 id={`${group.id}-heading`}>{group.title}</h2>
                <FaqList faqs={group.faqs} />
              </section>
            ))}
          </div>
        </div>

        <section className="site-cta" aria-labelledby="cta-heading">
          <div>
            <h2 id="cta-heading">{ui.faq.ctaTitle}</h2>
            <p>{ui.faq.ctaText}</p>
          </div>
          <div className="site-cta-actions">
            <Link className="site-button" href={localePath("/how-it-works", locale)}>
              {ui.faq.cta1}
            </Link>
            <Link className="site-button site-button-quiet" href={localePath("/glossary", locale)}>
              {ui.faq.cta2}
            </Link>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
