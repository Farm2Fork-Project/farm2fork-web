import type { Metadata } from "next";
import { ContactView } from "@/components/site/views/ContactView";
import { buildMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL } from "@/lib/seo/site";

export const metadata: Metadata = CONTACT_EMAIL ? buildMetadata({ path: "/contact", locale: "ur" }) : { robots: { index: false } };

export default function Page() {
  return <ContactView locale="ur" />;
}
