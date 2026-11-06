type AssociationEnvironment = {
  ANDROID_APP_SHA256_FINGERPRINTS?: string;
  IOS_APP_IDS?: string;
};

/** Signing identities come from the release pipeline, never guessed certificates. */
export function androidAssociation(env: AssociationEnvironment) {
  const fingerprints = [
    ...new Set(
      (env.ANDROID_APP_SHA256_FINGERPRINTS ?? "")
        .split(",")
        .map((value) => value.trim().toUpperCase())
        .filter((value) => /^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(value)),
    ),
  ];
  if (!fingerprints.length) return [];
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.farm2fork.app",
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];
}

export function appleAssociation(env: AssociationEnvironment) {
  const appIDs = [
    ...new Set(
      (env.IOS_APP_IDS ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => /^[A-Z0-9]{10}\.com\.farm2fork\.app$/.test(value)),
    ),
  ];
  return {
    applinks: {
      apps: [],
      details: appIDs.length
        ? [{ appIDs, components: [{ "/": "/trace/*" }] }]
        : [],
    },
  };
}
