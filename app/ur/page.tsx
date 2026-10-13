import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { HOME_UR } from "@/lib/content/ur/home";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: "/", locale: "ur" });

export default function Page() {
  return <ContentPage page={HOME_UR} locale="ur" />;
}
