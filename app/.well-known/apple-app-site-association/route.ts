import { appleAssociation } from "@/lib/links/associations";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    appleAssociation({ IOS_APP_IDS: process.env.IOS_APP_IDS }),
    {
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
