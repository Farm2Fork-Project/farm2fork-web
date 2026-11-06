import { describe, expect, it } from "vitest";
import { androidAssociation, appleAssociation } from "./associations";

describe("native trace link associations", () => {
  it("does not advertise an unsigned Android identity", () => {
    expect(androidAssociation({})).toEqual([]);
    expect(
      androidAssociation({ ANDROID_APP_SHA256_FINGERPRINTS: "bad" }),
    ).toEqual([]);
  });
  it("publishes only complete certificate fingerprints", () => {
    const fingerprint = Array(32).fill("AB").join(":");
    expect(
      androidAssociation({ ANDROID_APP_SHA256_FINGERPRINTS: fingerprint })[0],
    ).toEqual({
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.farm2fork.app",
        sha256_cert_fingerprints: [fingerprint],
      },
    });
  });
  it("only associates explicit Apple identities and trace paths", () => {
    expect(appleAssociation({}).applinks.details).toEqual([]);
    expect(
      appleAssociation({ IOS_APP_IDS: "bad,C3ZMVSNLSA.com.farm2fork.app" })
        .applinks.details,
    ).toEqual([
      {
        appIDs: ["C3ZMVSNLSA.com.farm2fork.app"],
        components: [{ "/": "/trace/*" }],
      },
    ]);
  });
});
