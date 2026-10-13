import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Public marketing pages are open to every crawler, including AI search and
 * answer engines, so the site can be cited. The signed-in portals are kept out
 * of the index with a noindex tag in their layouts instead of a Disallow rule:
 * a blocked URL cannot be crawled, so a crawler would never see its noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/__/", "/firebase-messaging-sw"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
