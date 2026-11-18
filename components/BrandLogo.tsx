import Image from "next/image";

/** Compact logo for surfaces that already display the app name. */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      className={className}
      unoptimized
      style={{ flexShrink: 0 }}
    />
  );
}

export function BrandWordmark({ width = 180, alt = "Farm2Fork" }: { width?: number; alt?: string }) {
  return (
    <Image
      src="/brand/wordmark.png"
      alt={alt}
      width={width}
      height={Math.round(width * 203 / 768)}
      unoptimized
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
