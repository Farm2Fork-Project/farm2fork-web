import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { PRIVACY } from "@/lib/content/legal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: PRIVACY.path });

export default function Page() {
  return <ContentPage page={PRIVACY} />;
}
