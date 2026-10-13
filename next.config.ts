import type { NextConfig } from "next";
import { firebaseAuthRedirectRewrites } from "./lib/firebase/auth-redirect-proxy.ts";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    // Profile photos are served by the Cloudinary CDN (the API builds the URL).
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  turbopack: {
    root: __dirname,
  },
  // Sign-in and sign-up used to be overlays on "/" and a mode of "/farmer".
  // Old links, bookmarks and emails keep working.
  async redirects() {
    return [
      { source: "/", has: [{ type: "query", key: "auth", value: "login" }], destination: "/login", permanent: false },
      { source: "/", has: [{ type: "query", key: "auth", value: "signup" }], destination: "/signup", permanent: false },
      { source: "/farmer", has: [{ type: "query", key: "signup", value: "true" }], destination: "/signup/farmer", permanent: false },
      // Staff sign in with everyone else; their role routes them to /admin.
      { source: "/admin/login", destination: "/login?next=%2Fadmin%2Fdashboard", permanent: false },
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
    ];
  },
  async rewrites() {
    return firebaseAuthRedirectRewrites(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    );
  },
};

export default nextConfig;
