import type { Metadata } from "next";
import type { ReactNode } from "react";

// Signed-in portal: useful to its users, never useful in search results.
export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
