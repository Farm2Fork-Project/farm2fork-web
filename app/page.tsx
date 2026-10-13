import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { HomeSections } from "@/components/site/HomeSections";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HOME_FAQS } from "@/lib/content/faqs";
import { JsonLd, faqNode, organizationNode, webPageNode, websiteNode } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { HOME_PAGE } from "@/lib/seo/pages";

export const metadata: Metadata = buildMetadata({ path: "/" });

/**
 * Server entry for "/". The page is interactive (auth overlays, the buyer
 * marketplace once signed in), so that part lives in HomeClient; this wrapper
 * adds the metadata, structured data and server-rendered content around it.
 */
export default function Home() {
  return (
    <>
      <HomeClient seoContent={<HomeSections />} footerContent={<SiteFooter />} />
      <JsonLd
        data={[
          organizationNode(),
          websiteNode(),
          webPageNode({
            path: "/",
            name: HOME_PAGE.title,
            description: HOME_PAGE.description,
            dateModified: HOME_PAGE.lastModified,
          }),
          faqNode("/", HOME_FAQS),
        ]}
      />
    </>
  );
}
