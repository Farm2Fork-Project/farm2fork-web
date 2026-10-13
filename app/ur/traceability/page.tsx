import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { TRACEABILITY_UR } from "@/lib/content/ur/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: TRACEABILITY_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={TRACEABILITY_UR} locale="ur" />;
}
