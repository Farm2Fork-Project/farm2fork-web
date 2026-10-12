import Link from "next/link";
import { IcLeaf } from "@/components/icons";
import { type Locale, LOCALE_META, localePath } from "@/lib/seo/locale";
import { pagesInGroup } from "@/lib/seo/pages";
import { UI } from "@/lib/seo/ui";

function navFor(locale: Locale) {
  return [
    ...pagesInGroup("product", locale).filter((page) => page.path !== "/for-transporters"),
    ...pagesInGroup("learn", locale).filter((page) => page.path !== "/glossary"),
  ];
}

type Props = {
  locale?: Locale;
  /** Registry path of the current page, used for the language switch link. */
  path?: string;
};

export function SiteHeader({ locale = "en", path = "/" }: Props) {
  const ui = UI[locale];
  const other: Locale = locale === "en" ? "ur" : "en";
  const nav = navFor(locale);
  const switchLink = (
    <Link
      className="site-link-quiet site-lang"
      href={localePath(path, other)}
      lang={LOCALE_META[other].lang}
      hrefLang={LOCALE_META[other].lang}
      aria-label={ui.switchAria}
    >
      {ui.switchLabel}
    </Link>
  );

  return (
    <header className="site-header">
      <Link className="site-brand" href={localePath("/", locale)} aria-label={ui.brandAria}>
        <span className="site-brand-mark">
          <IcLeaf size={20} />
        </span>
        <span>Farm2Fork</span>
      </Link>

      <nav className="site-nav" aria-label={ui.mainNav}>
        {nav.map((page) => (
          <Link key={page.path} href={localePath(page.path, locale)}>
            {page.navLabel}
          </Link>
        ))}
      </nav>

      <div className="site-header-actions">
        {switchLink}
        <Link className="site-link-quiet" href="/?auth=login">
          {ui.signIn}
        </Link>
        <Link className="site-button" href="/?auth=signup">
          {ui.getStarted}
        </Link>
      </div>

      <details className="site-menu">
        <summary aria-label={ui.openMenu}>{ui.menu}</summary>
        <nav aria-label={ui.mobileNav}>
          {nav.map((page) => (
            <Link key={page.path} href={localePath(page.path, locale)}>
              {page.navLabel}
            </Link>
          ))}
          <Link href={localePath(path, other)} lang={LOCALE_META[other].lang} hrefLang={LOCALE_META[other].lang}>
            {ui.switchLabel}
          </Link>
          <Link href="/?auth=login">{ui.signIn}</Link>
          <Link className="site-button" href="/?auth=signup">
            {ui.getStarted}
          </Link>
        </nav>
      </details>
    </header>
  );
}
