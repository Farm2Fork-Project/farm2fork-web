import { androidAssociation } from "@/lib/links/associations";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    androidAssociation({
      ANDROID_APP_SHA256_FINGERPRINTS:
        process.env.ANDROID_APP_SHA256_FINGERPRINTS,
    }),
    {
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
