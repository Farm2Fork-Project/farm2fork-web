import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { TRACEABILITY } from "@/lib/content/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: TRACEABILITY.path });

export default function Page() {
  return <ContentPage page={TRACEABILITY} />;
}
