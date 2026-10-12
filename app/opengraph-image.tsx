import { OG_SIZE, renderOgImage } from "@/lib/seo/og";

export const alt = "Farm2Fork: fresh produce direct from Pakistani farmers";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ kicker: "Farm to fork, traceable", title: "A fairer produce market starts at the farm." });
}
