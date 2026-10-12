import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageShell } from "@/components/site/PageShell";
import { breadcrumbNode, webPageNode } from "@/lib/seo/jsonld";
import { type Locale, localePath } from "@/lib/seo/locale";
import { CONTACT_EMAIL } from "@/lib/seo/site";
import { pageFor } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

const PATH = "/contact";

export function ContactView({ locale = "en" }: { locale?: Locale }) {
  if (!CONTACT_EMAIL) notFound();
  const ui = UI[locale];
  const meta = pageFor(PATH, locale);
  const urlPath = localePath(PATH, locale);
  const crumbs = [
    { name: ui.home, path: localePath("/", locale) },
    { name: ui.contact.crumb, path: urlPath },
  ];

  return (
    <PageShell
      locale={locale}
      path={PATH}
      jsonLd={[
        webPageNode({ path: urlPath, name: ui.contact.jsonName, description: meta.description, type: "ContactPage", dateModified: meta.lastModified, breadcrumb: true, locale }),
        breadcrumbNode(urlPath, crumbs),
      ]}
    >
      <article className="site-page">
        <header className="site-page-header">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
          <p className="site-eyebrow">{ui.contact.eyebrow}</p>
          <h1>{ui.contact.h1}</h1>
          <p className="site-lead">{ui.contact.lead}</p>
        </header>
        <div className="site-body">
          <div className="site-content">
            <section className="site-section" aria-labelledby="email-heading">
              <h2 id="email-heading">{ui.contact.emailHeading}</h2>
              <p>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
              <h2>{ui.contact.includeHeading}</h2>
              <ul>
                {ui.contact.includeItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{ui.contact.warning}</p>
            </section>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
