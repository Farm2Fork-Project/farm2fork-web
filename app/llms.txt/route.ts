import { localePath } from "@/lib/seo/locale";
import { GUIDE_PAGES, HOME_PAGE, STATIC_PAGES, guidePagesFor, pageFor } from "@/lib/seo/pages";
import { ORGANIZATION, ORGANIZATION_DESCRIPTION_UR, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

const line = (page: { path: string; navLabel: string; description: string }) =>
  `- [${page.navLabel}](${absoluteUrl(page.path)}): ${page.description}`;

const urduLine = (page: { path: string; navLabel: string; description: string }) =>
  `- [${page.navLabel}](${absoluteUrl(localePath(page.path, "ur"))}): ${page.description}`;

/**
 * llms.txt: a short, curated map of the site for AI assistants and answer
 * engines (https://llmstxt.org). The full text lives at /llms-full.txt.
 */
export function GET() {
  const product = STATIC_PAGES.filter((page) => page.group === "product");
  const learn = STATIC_PAGES.filter((page) => page.group === "learn");
  const company = STATIC_PAGES.filter((page) => page.group === "company" || page.group === "legal");

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${ORGANIZATION.description}`,
    "",
    "Farm2Fork is a pilot platform for Pakistani farmers, buyers, transport partners and financial partners. Farmers list produce at their own price, buyers order from a named farm, transport partners deliver, and each step is recorded on a Hyperledger Fabric ledger and viewable by QR code. It is in pilot: payments and the AI price advisor are still being tested or trained, and it does not publish user counts or testimonials.",
    "",
    "## Product",
    line({ ...HOME_PAGE, navLabel: "Home" }),
    ...product.map(line),
    "",
    "## Learn",
    ...learn.map(line),
    "",
    "## Guides",
    ...GUIDE_PAGES.map((page) => line({ ...page, navLabel: page.title })),
    "",
    "## Company and legal",
    ...company.map(line),
    "",
    "## Urdu (اردو)",
    "",
    `Every page above also exists in Urdu under ${absoluteUrl("/ur")}, as a translation. The Urdu text is still awaiting a full native-speaker review, and the English pages remain the authoritative version.`,
    "",
    `> ${ORGANIZATION_DESCRIPTION_UR}`,
    "",
    urduLine(pageFor("/", "ur")),
    ...STATIC_PAGES.map((page) => urduLine(pageFor(page.path, "ur"))),
    ...guidePagesFor("ur").map((page) => urduLine({ ...page, navLabel: page.title })),
    "",
    "## Optional",
    `- [Full text of every page](${absoluteUrl("/llms-full.txt")}): all public content as Markdown in one file, English then Urdu`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): XML list of every public URL`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
