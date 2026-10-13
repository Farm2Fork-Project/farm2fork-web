import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageShell } from "@/components/site/PageShell";
import { formatDate } from "@/components/site/format";
import { glossaryFor } from "@/lib/content/locale";
import { breadcrumbNode, definedTermSetNode, webPageNode } from "@/lib/seo/jsonld";
import { type Locale, localePath } from "@/lib/seo/locale";
import { pageFor } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

const PATH = "/glossary";

export function GlossaryPageView({ locale = "en" }: { locale?: Locale }) {
  const ui = UI[locale];
  const entries = glossaryFor(locale);
  const meta = pageFor(PATH, locale);
  const urlPath = localePath(PATH, locale);
  const crumbs = [
    { name: ui.home, path: localePath("/", locale) },
    { name: ui.glossary.crumb, path: urlPath },
  ];

  return (
    <PageShell
      locale={locale}
      path={PATH}
      jsonLd={[
        webPageNode({
          path: urlPath,
          name: ui.glossary.jsonName,
          description: meta.description,
          type: "CollectionPage",
          dateModified: meta.lastModified,
          breadcrumb: true,
          locale,
        }),
        breadcrumbNode(urlPath, crumbs),
        definedTermSetNode(
          urlPath,
          entries.map((entry) => ({ term: entry.term, id: entry.id, definition: entry.definition, alternateName: locale === "ur" ? entry.alternate?.text : undefined })),
          { name: locale === "ur" ? ui.glossary.jsonName : undefined, locale },
        ),
      ]}
    >
      <article className="site-page">
        <header className="site-page-header">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
          <p className="site-eyebrow">{ui.glossary.eyebrow}</p>
          <h1>{ui.glossary.h1}</h1>
          <p className="site-lead">{ui.glossary.lead}</p>
          <p className="site-meta">
            {ui.lastReviewed} <time dateTime={meta.lastModified}>{formatDate(meta.lastModified, locale)}</time>
          </p>
        </header>

        <div className="site-body">
          <dl className="site-glossary">
            {entries.map((entry) => (
              <div key={entry.id} id={entry.id} className="site-term">
                <dt>
                  {entry.term}
                  {entry.alternate ? (
                    <span className={entry.alternate.lang === "ur" ? "site-urdu" : "site-latin"} lang={entry.alternate.lang} dir={entry.alternate.lang === "ur" ? "rtl" : "ltr"}>
                      {entry.alternate.text}
                    </span>
                  ) : null}
                </dt>
                <dd>
                  {entry.definition}
                  {entry.more ? (
                    <>
                      {" "}
                      <Link href={entry.more}>{ui.readMore}</Link>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </PageShell>
  );
}
