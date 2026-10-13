import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { TERMS } from "@/lib/content/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: TERMS.path });

export default function Page() {
  return <ContentPage page={TERMS} />;
}
