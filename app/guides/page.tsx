import type { Metadata } from "next";
import { GuidesIndexView } from "@/components/site/views/GuidesIndexView";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: "/guides" });

export default function GuidesPage() {
  return <GuidesIndexView />;
}
