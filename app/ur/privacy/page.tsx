import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { PRIVACY_UR } from "@/lib/content/ur/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: PRIVACY_UR.path, locale: "ur" });

export default function Page() {
  return <ContentPage page={PRIVACY_UR} locale="ur" />;
}
