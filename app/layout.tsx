import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Young_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "Farm2Fork",
  description:
    "Buy fresh produce directly from farmers. Scan QR codes, trace supply chains, and track your orders with blockchain verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${urdu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
