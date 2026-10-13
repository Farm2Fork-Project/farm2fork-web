import type { Metadata } from "next";
import { FaqPageView } from "@/components/site/views/FaqPageView";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ path: "/faq" });

export default function FaqPage() {
  return <FaqPageView />;
}
