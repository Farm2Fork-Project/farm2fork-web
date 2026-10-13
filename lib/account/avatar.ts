/** Output size of the cropped profile photo, in pixels. */
export const AVATAR_SIZE = 512;
export const AVATAR_QUALITY = 0.85;
/** The API accepts JPEG, PNG and WebP up to 5 MB. */
export const AVATAR_MAX_INPUT_BYTES = 5 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPTED = new Set(AVATAR_ACCEPT.split(","));

export type AvatarFileProblem = "type" | "size";

/** Checks a picked file before it is loaded into the cropper. */
export function checkAvatarFile(file: { type: string; size: number }): AvatarFileProblem | null {
  if (!ACCEPTED.has(file.type)) return "type";
  if (file.size > AVATAR_MAX_INPUT_BYTES) return "size";
  return null;
}

/**
 * The API serves `avatarUrl` at 256px. For another size, swap `w_256,h_256`
 * (Cloudinary). Root-relative local-development paths have no transform and
 * are returned unchanged.
 */
export function avatarUrlAtSize(url: string | undefined, size: number): string | undefined {
  if (!url) return undefined;
  return url.replace("w_256,h_256", `w_${size},h_${size}`);
}

/**
 * The URL to put in an <img>. A root-relative path comes from the API itself
 * (local development), so it is resolved against the API origin, not the web
 * app's.
 */
export function resolveAvatarUrl(url: string | undefined, apiBase = process.env.NEXT_PUBLIC_API_BASE_URL): string | undefined {
  if (!url) return undefined;
  if (!url.startsWith("/")) return url;
  try {
    return apiBase ? `${new URL(apiBase).origin}${url}` : url;
  } catch {
    return url;
  }
}

export function isRemoteAvatar(url: string | undefined): boolean {
  return !!url && /^https?:\/\//.test(url);
}

/** Up to two letters for the initials avatar. */
export function initialsOf(name: string | undefined, email?: string): string {
  const source = (name?.trim() || email?.split("@")[0] || "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return letters.map((p) => Array.from(p)[0]).join("").toUpperCase();
}

export type CropArea = { x: number; y: number; width: number; height: number };

/** Crops `image` to `area` (pixels of the natural image) and returns a 512px square JPEG. */
export async function cropToSquareJpeg(
  image: CanvasImageSource & { width: number; height: number },
  area: CropArea,
  size = AVATAR_SIZE,
  quality = AVATAR_QUALITY,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("avatar.canvas");
  // JPEG has no alpha: paint paper white so transparent PNGs do not turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("avatar.encode"))),
      "image/jpeg",
      quality,
    );
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("avatar.load"));
    image.src = src;
  });
}
