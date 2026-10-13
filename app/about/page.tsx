import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { ABOUT } from "@/lib/content/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: ABOUT.path });

export default function Page() {
  return <ContentPage page={ABOUT} schemaType="AboutPage" />;
}
