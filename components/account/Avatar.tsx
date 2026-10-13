"use client";

import Image from "next/image";
import { useState } from "react";
import { avatarUrlAtSize, initialsOf, resolveAvatarUrl } from "@/lib/account/avatar.ts";

/**
 * The person's photo, or their initials when there is none (or it fails to
 * load). The API serves 256px; we ask Cloudinary for twice the displayed size
 * so it stays sharp on dense screens.
 */
export function Avatar({
  user,
  size = 40,
  className = "",
}: {
  user: { fullName?: string; email?: string; avatarUrl?: string };
  size?: number;
  className?: string;
}) {
  const source = resolveAvatarUrl(avatarUrlAtSize(user.avatarUrl, Math.min(512, size * 2)));
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = !!source && failed !== source;
  const style = { "--ac-avatar-size": `${size}px` } as React.CSSProperties;

  return (
    <span className={`ac-avatar ${className}`.trim()} style={style} aria-hidden="true">
      {showImage ? (
        // Cloudinary already serves a resized, auto-format image, so the Next.js optimizer is skipped.
        <Image src={source} alt="" width={size} height={size} unoptimized onError={() => setFailed(source)} />
      ) : (
        <span className="ac-avatar-initials">{initialsOf(user.fullName, user.email)}</span>
      )}
    </span>
  );
}
