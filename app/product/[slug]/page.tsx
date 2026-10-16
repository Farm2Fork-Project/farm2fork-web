import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductPage } from "@/components/buyer/ProductPage";
import type { ApiProduct } from "@/lib/api/contracts.ts";
import { productIdFromSlug, productPath } from "@/lib/products/slug.ts";
import { JsonLd } from "@/lib/seo/jsonld";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";

type Params = { params: Promise<{ slug: string }> };

/**
 * `null` = the API says there is no such product; `"unavailable"` = we could
 * not ask (API down or unconfigured), in which case the page still renders
 * and the client reports the problem.
 */
async function loadProduct(
  id: string,
): Promise<ApiProduct | null | "unavailable"> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return "unavailable";
  try {
    const response = await fetch(`${base}/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (response.status === 404) return null;
    if (!response.ok) return "unavailable";
    return (await response.json()) as ApiProduct;
  } catch {
    return "unavailable";
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const id = productIdFromSlug(slug);
  const product = id ? await loadProduct(id) : null;
  if (!product || product === "unavailable") {
    return { title: "Product", robots: { index: false, follow: true } };
  }

  const place = [product.farmer?.city, product.farmer?.province]
    .filter(Boolean)
    .join(", ");
  const from = product.farmer?.farmName
    ? ` from ${product.farmer.farmName}`
    : "";
  const title = `${product.name}${from}`;
  const description =
    product.description?.trim() ||
    `Buy ${product.name}${from}${place ? ` in ${place}` : ""} directly from the farm, with its origin recorded on a ledger you can check.`;
  const url = absoluteUrl(productPath(product));
  const image = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: product.status === "active", follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductRoute({ params }: Params) {
  const { slug } = await params;
  const id = productIdFromSlug(slug);
  if (!id) notFound();

  const product = await loadProduct(id);
  if (product === null) notFound();

  // Old or hand-typed words in the address: send people (and crawlers) to the
  // one current address for this product.
  if (product !== "unavailable") {
    const canonical = productPath(product);
    let current = slug;
    try {
      current = decodeURIComponent(slug);
    } catch {
      /* Compared as-is below. */
    }
    if (`/product/${current}` !== canonical) permanentRedirect(canonical);
  }

  return (
    <>
      <ProductPage slug={slug} />
      {product !== "unavailable" ? (
        <JsonLd
          data={{
            "@type": "Product",
            name: product.name,
            description: product.description || undefined,
            image: product.images.length > 0 ? product.images : undefined,
            sku: product.id,
            category: product.category,
            url: absoluteUrl(productPath(product)),
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "PKR",
              availability:
                product.status === "active" && product.quantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              seller: product.farmer?.farmName
                ? { "@type": "Organization", name: product.farmer.farmName }
                : undefined,
            },
          }}
        />
      ) : null}
    </>
  );
}
