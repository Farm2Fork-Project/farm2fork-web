import type { Metadata } from "next";
import { GlossaryPageView } from "@/components/site/views/GlossaryPageView";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: "/glossary" });

export default function GlossaryPage() {
  return <GlossaryPageView />;
}
