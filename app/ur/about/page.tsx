import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { ABOUT_UR } from "@/lib/content/ur/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: ABOUT_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={ABOUT_UR} locale="ur" schemaType="AboutPage" />;
}
