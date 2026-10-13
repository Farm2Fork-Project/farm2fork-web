import type { Metadata } from "next";
import { ContactView } from "@/components/site/views/ContactView";
import { buildMetadata } from "@/lib/seo/metadata";
import { CONTACT_EMAIL } from "@/lib/seo/site";

// The registry only lists /contact when NEXT_PUBLIC_CONTACT_EMAIL is set, so
// the metadata lookup must be guarded the same way.
export const metadata: Metadata = CONTACT_EMAIL ? buildMetadata({ path: "/contact" }) : { robots: { index: false } };

export default function ContactPage() {
  return <ContactView />;
}
