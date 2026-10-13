import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { HOW_IT_WORKS } from "@/lib/content/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: HOW_IT_WORKS.path });

export default function Page() {
  return <ContentPage page={HOW_IT_WORKS} />;
}
