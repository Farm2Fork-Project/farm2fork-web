import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
