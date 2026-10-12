import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Brand-coloured share card. Satori needs explicit `display: flex` on every container. */
export function renderOgImage({ kicker, title }: { kicker: string; title: string }) {
  const long = title.length > 70;
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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f5f0e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#155c3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 18.5C5 10.5 10 5 18.5 5.2c.3 8.3-5 13.8-13 13.3Z" />
              <path d="M5 19l8-8" />
            </svg>
          </div>
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
