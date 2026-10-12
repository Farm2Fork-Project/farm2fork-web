import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { FOR_TRANSPORTERS_UR } from "@/lib/content/ur/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: FOR_TRANSPORTERS_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={FOR_TRANSPORTERS_UR} locale="ur" />;
}
