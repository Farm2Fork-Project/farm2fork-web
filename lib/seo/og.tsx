import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Brand-coloured share card. Satori needs explicit `display: flex` on every container. */
export async function renderOgImage({ kicker, title }: { kicker: string; title: string }) {
  const long = title.length > 70;
  const mark = await readFile(join(process.cwd(), "public", "brand", "mark.png"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0d402a",
          color: "#f5f0e5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs an inline image. */}
          <img src={`data:image/png;base64,${mark.toString("base64")}`} width={56} height={56} alt="" />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Farm2Fork</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#e0b58f" }}>{kicker}</div>
          <div style={{ fontSize: long ? 56 : 68, lineHeight: 1.1, fontWeight: 700, letterSpacing: -1.5, maxWidth: 1000 }}>{title}</div>
        </div>

        <div style={{ fontSize: 26, color: "rgba(245,240,229,0.72)" }}>Fresh produce, direct from Pakistani farmers</div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
