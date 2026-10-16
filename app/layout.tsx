import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Young_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./site.css";
import "./auth.css";
import "./account.css";
import "./motion.css";
import "./product.css";
import "./buyer.css";
import PushRuntime from "@/components/PushRuntime";
import { SESSION_HINT_SCRIPT } from "@/lib/auth/session-hint";
import { HOME_PAGE } from "@/lib/seo/pages";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";

const HOME_TITLE = HOME_PAGE.title;

// Body and interface: designed for legibility on mid-range screens in bright light.
const sans = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--font-sans-loaded",
  display: "swap",
});

// Display headings. Single weight: never ask for bold, it would be synthesised.
const display = Young_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-display-loaded",
  display: "swap",
});

// Urdu (Nastaliq), self-hosted from the project's licensed font files.
const urdu = localFont({
  src: "./fonts/NotoNastaliqUrdu-VariableFont_wght.ttf",
  weight: "400 700",
  variable: "--font-urdu-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: `${SITE_NAME} team`, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "agriculture",
  keywords: [
    "buy vegetables directly from farmers Pakistan",
    "farm to fork Pakistan",
    "fresh produce delivery Pakistan",
    "food traceability",
    "blockchain food traceability",
    "sell produce online Pakistan",
    "farmer marketplace Pakistan",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_PK" },
  twitter: { card: "summary_large_image" },
  // Set these to the codes Search Console and Bing Webmaster Tools give you.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#155c3c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${urdu.variable}`}
      // The inline script below may add data-f2f-buyer before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SESSION_HINT_SCRIPT }} />
      </head>
      <body>
        <PushRuntime />
        {children}
      </body>
    </html>
  );
}
