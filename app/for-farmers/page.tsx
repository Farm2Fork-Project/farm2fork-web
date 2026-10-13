import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { FOR_FARMERS } from "@/lib/content/site-pages";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: FOR_FARMERS.path });

export default function Page() {
  return <ContentPage page={FOR_FARMERS} />;
}
