import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { FOR_BUYERS_UR } from "@/lib/content/ur/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: FOR_BUYERS_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={FOR_BUYERS_UR} locale="ur" />;
}
