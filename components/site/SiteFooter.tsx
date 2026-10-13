import Link from "next/link";
import { IcLeaf } from "@/components/icons";
import { type Locale, LOCALE_META, localePath } from "@/lib/seo/locale";
import { guidePagesFor, pagesInGroup } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

type Props = {
  className?: string;
  locale?: Locale;
  /** Registry path of the current page, used for the language switch link. */
  path?: string;
};

/** Server-rendered footer so every public page links to every key page. */
export function SiteFooter({ className = "", locale = "en", path = "/" }: Props) {
  const ui = UI[locale];
  const other: Locale = locale === "en" ? "ur" : "en";
  const columns = [
    { title: ui.footer.product, links: pagesInGroup("product", locale) },
    { title: ui.footer.learn, links: [...pagesInGroup("learn", locale), ...guidePagesFor(locale).slice(0, 3)] },
    { title: ui.footer.company, links: [...pagesInGroup("company", locale), ...pagesInGroup("legal", locale)] },
  ];

  return (
    <footer className={`site-footer ${className}`.trim()}>
      <div className="site-footer-inner">
        <div className="site-footer-about">
          <Link className="site-brand" href={localePath("/", locale)} aria-label={ui.brandAria}>
            <span className="site-brand-mark">
              <IcLeaf size={20} />
            </span>
            <span>Farm2Fork</span>
          </Link>
          <p>{ui.footer.about}</p>
          <p className="site-footer-note">{ui.footer.note}</p>
          <p className="site-footer-lang">
            <Link href={localePath(path, other)} lang={LOCALE_META[other].lang} hrefLang={LOCALE_META[other].lang} aria-label={ui.switchAria}>
              {ui.switchLabel}
            </Link>
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((page) => (
                <li key={page.path}>
                  <Link href={localePath(page.path, locale)}>{page.navLabel}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="site-footer-legal">{ui.footer.legal(new Date().getUTCFullYear())}</p>
    </footer>
  );
}
