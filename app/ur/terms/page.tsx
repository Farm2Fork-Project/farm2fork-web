import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { TERMS_UR } from "@/lib/content/ur/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: TERMS_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={TERMS_UR} locale="ur" />;
}
