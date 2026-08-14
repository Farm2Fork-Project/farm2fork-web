import type { NextConfig } from "next";
import { firebaseAuthRedirectRewrites } from "./lib/firebase/auth-redirect-proxy.ts";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return firebaseAuthRedirectRewrites(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    );
  },
};

export default nextConfig;
