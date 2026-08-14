type Rewrite = { source: string; destination: string };

/**
 * Firebase redirects must use the app origin as authDomain. Next proxies only
 * the helper assets to Firebase so the browser never follows a cross-origin
 * helper redirect or depends on third-party storage.
 */
export function firebaseAuthRedirectRewrites(projectId: string | undefined): Rewrite[] {
  const normalizedProjectId = projectId?.trim();
  if (!normalizedProjectId) return [];

  return [
    {
      source: "/__/auth/:path*",
      destination: `https://${normalizedProjectId}.firebaseapp.com/__/auth/:path*`,
    },
  ];
}
