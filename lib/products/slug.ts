const OBJECT_ID = /^[a-f0-9]{24}$/i;
const SLUG_ID = /(?:^|-)([a-f0-9]{24})$/i;
const MAX_WORDS_LENGTH = 60;

/** Lower-case latin words joined by dashes; empty when the name has none (e.g. Urdu). */
function slugWords(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_WORDS_LENGTH)
    .replace(/-+$/, "");
}

/**
 * `organic-tomato-6acf31a55ab403729542ef2c`: readable words for people and
 * search engines, the product id on the end as the part that actually
 * resolves. A renamed product keeps working because only the id is read.
 */
export function productSlug(product: { id: string; name: string }): string {
  const words = slugWords(product.name);
  return words ? `${words}-${product.id}` : product.id;
}

export function productPath(product: { id: string; name: string }): string {
  return `/product/${productSlug(product)}`;
}

/** The product id inside a slug (or a bare id), or null when there isn't one. */
export function productIdFromSlug(slug: string): string | null {
  let value = slug;
  try {
    value = decodeURIComponent(slug);
  } catch {
    /* Malformed escapes: fall through and fail the id check below. */
  }
  if (OBJECT_ID.test(value)) return value.toLowerCase();
  const match = SLUG_ID.exec(value);
  return match ? match[1].toLowerCase() : null;
}
