import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { FOR_FARMERS_UR } from "@/lib/content/ur/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: FOR_FARMERS_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={FOR_FARMERS_UR} locale="ur" />;
}
