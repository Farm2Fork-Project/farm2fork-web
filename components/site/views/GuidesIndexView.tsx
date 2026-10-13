import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageShell } from "@/components/site/PageShell";
import { formatDate } from "@/components/site/format";
import { guidesFor } from "@/lib/content/locale";
import { guidePath, readingMinutes } from "@/lib/content/guides";
import { breadcrumbNode, itemListNode, webPageNode } from "@/lib/seo/jsonld";
import { type Locale, localePath } from "@/lib/seo/locale";
import { pageFor } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

const PATH = "/guides";

export function GuidesIndexView({ locale = "en" }: { locale?: Locale }) {
  const ui = UI[locale];
  const guides = guidesFor(locale);
  const meta = pageFor(PATH, locale);
  const urlPath = localePath(PATH, locale);
  const crumbs = [
    { name: ui.home, path: localePath("/", locale) },
    { name: ui.guides.crumb, path: urlPath },
  ];

  return (
    <PageShell
      locale={locale}
      path={PATH}
      jsonLd={[
        webPageNode({ path: urlPath, name: ui.guides.jsonName, description: meta.description, type: "CollectionPage", dateModified: meta.lastModified, breadcrumb: true, locale }),
        breadcrumbNode(urlPath, crumbs),
        itemListNode(urlPath, guides.map((guide) => ({ name: guide.title, path: localePath(guidePath(guide.slug), locale) }))),
      ]}
    >
      <article className="site-page">
        <header className="site-page-header">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
          <p className="site-eyebrow">{ui.guides.eyebrow}</p>
          <h1>{ui.guides.h1}</h1>
          <p className="site-lead">{ui.guides.lead}</p>
        </header>

        <div className="site-body">
          <ul className="site-guide-list">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <article>
                  <p className="site-card-meta">
                    {ui.categories[guide.category]} · {ui.minRead(readingMinutes(guide))} ·{" "}
                    <time dateTime={guide.updatedAt}>
                      {ui.updated} {formatDate(guide.updatedAt, locale)}
                    </time>
                  </p>
                  <h2>
                    <Link href={localePath(guidePath(guide.slug), locale)}>{guide.title}</Link>
                  </h2>
                  <p>{guide.description}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </PageShell>
  );
}
