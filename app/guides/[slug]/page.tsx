import type { Metadata } from "next";
import { GuideView } from "@/components/site/views/GuideView";
import { GUIDES, getGuide, guidePath } from "@/lib/content/guides";
import { absoluteUrl } from "@/lib/seo/site";
import { buildMetadata } from "@/lib/seo/metadata";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return buildMetadata({
    path: guidePath(slug),
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
    image: { url: absoluteUrl(`${guidePath(slug)}/opengraph-image`), alt: guide.title },
  });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <GuideView slug={slug} />;
}
