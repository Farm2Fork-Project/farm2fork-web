import { afterEach, describe, expect, test, vi } from "vitest";
import {
  AVATAR_SIZE,
  avatarUrlAtSize,
  checkAvatarFile,
  cropToSquareJpeg,
  initialsOf,
  resolveAvatarUrl,
} from "./avatar.ts";

afterEach(() => vi.restoreAllMocks());

test("only JPEG, PNG and WebP up to 5 MB are accepted", () => {
  expect(checkAvatarFile({ type: "image/jpeg", size: 1000 })).toBeNull();
  expect(checkAvatarFile({ type: "image/png", size: 5 * 1024 * 1024 })).toBeNull();
  expect(checkAvatarFile({ type: "image/webp", size: 10 })).toBeNull();
  expect(checkAvatarFile({ type: "image/gif", size: 10 })).toBe("type");
  expect(checkAvatarFile({ type: "application/pdf", size: 10 })).toBe("type");
  expect(checkAvatarFile({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 })).toBe("size");
});

describe("avatar URLs", () => {
  const cdn = "https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_256,h_256,f_auto,q_auto/v1700/farm2fork/avatars/u1";

  test("the size segment is swapped for another size", () => {
    expect(avatarUrlAtSize(cdn, 96)).toContain("w_96,h_96");
    expect(avatarUrlAtSize(cdn, 96)).not.toContain("w_256");
    expect(avatarUrlAtSize(undefined, 96)).toBeUndefined();
  });

  test("a root-relative local path resolves against the API origin, a CDN URL is left alone", () => {
    expect(resolveAvatarUrl("/api/files/public/a.jpg", "http://localhost:3000/api")).toBe("http://localhost:3000/api/files/public/a.jpg");
    expect(resolveAvatarUrl(cdn, "http://localhost:3000/api")).toBe(cdn);
    expect(resolveAvatarUrl(undefined)).toBeUndefined();
  });
});

describe("initials", () => {
  test("first and last name, else the email name (dots and dashes split words)", () => {
    expect(initialsOf("Ayesha Khan")).toBe("AK");
    expect(initialsOf("Tariq")).toBe("T");
    expect(initialsOf("Muhammad Qaim Raza")).toBe("MR");
    expect(initialsOf(undefined, "green.valley@example.com")).toBe("GV");
    expect(initialsOf(undefined, undefined)).toBe("?");
  });
});

describe("cropToSquareJpeg", () => {
  test("draws the chosen area onto a 512px canvas and encodes JPEG at about 0.85", async () => {
    const drawImage = vi.fn();
    const context = { fillRect: vi.fn(), drawImage, imageSmoothingQuality: "low", fillStyle: "" };
    const toBlob = vi.fn((callback: (b: Blob | null) => void) => callback(new Blob(["x"], { type: "image/jpeg" })));
    const canvas = { width: 0, height: 0, getContext: () => context, toBlob };
    vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLElement);

    const image = { width: 900, height: 600 } as unknown as HTMLImageElement;
    const blob = await cropToSquareJpeg(image, { x: 150, y: 0, width: 600, height: 600 });

    expect(canvas.width).toBe(AVATAR_SIZE);
    expect(canvas.height).toBe(AVATAR_SIZE);
    expect(drawImage).toHaveBeenCalledWith(image, 150, 0, 600, 600, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), "image/jpeg", 0.85);
    expect(blob.type).toBe("image/jpeg");
  });

  test("rejects when the browser cannot encode", async () => {
    const canvas = { getContext: () => ({ fillRect() {}, drawImage() {} }), toBlob: (cb: (b: Blob | null) => void) => cb(null) };
    vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLElement);
    await expect(cropToSquareJpeg({ width: 1, height: 1 } as HTMLImageElement, { x: 0, y: 0, width: 1, height: 1 })).rejects.toThrow("avatar.encode");
  });
});
