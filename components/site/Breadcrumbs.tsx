import Link from "next/link";
import type { Crumb } from "@/lib/seo/jsonld";
import type { Locale } from "@/lib/seo/locale";
import { UI } from "@/lib/seo/ui";

export function Breadcrumbs({ crumbs, locale = "en" }: { crumbs: Crumb[]; locale?: Locale }) {
  return (
    <nav className="site-breadcrumbs" aria-label={UI[locale].breadcrumb}>
      <ol>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path}>
              {isLast ? <span aria-current="page">{crumb.name}</span> : <Link href={crumb.path}>{crumb.name}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
