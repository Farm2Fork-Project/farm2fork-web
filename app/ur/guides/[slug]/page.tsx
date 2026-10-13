import type { Metadata } from "next";
import { GuideView } from "@/components/site/views/GuideView";
import { GUIDES_UR } from "@/lib/content/ur/guides";
import { guidePath } from "@/lib/content/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return GUIDES_UR.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES_UR.find((candidate) => candidate.slug === slug);
  if (!guide) return {};
  return buildMetadata({
    path: guidePath(slug),
    locale: "ur",
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
    // Share cards are rendered in English only, so Urdu guides reuse the English guide's card.
    image: { url: absoluteUrl(`${guidePath(slug)}/opengraph-image`), alt: guide.title },
  });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <GuideView slug={slug} locale="ur" />;
}
