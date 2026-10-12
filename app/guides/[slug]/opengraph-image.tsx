import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/content/guides";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Farm2Fork guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return renderOgImage({ kicker: `Guide · ${guide.category}`, title: guide.title });
}
