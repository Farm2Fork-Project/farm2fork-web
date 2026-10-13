import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { ApiError, type ApiProfile } from "@/lib/api/contracts.ts";
import { AvatarEditor } from "./AvatarEditor";

// The real cropper needs layout; the editor only needs it to report a crop.
vi.mock("react-easy-crop", async () => {
  const { useEffect } = await import("react");
  return {
    default: function Cropper({ onCropComplete }: { onCropComplete: (a: unknown, b: unknown) => void }) {
      useEffect(() => {
        onCropComplete({}, { x: 10, y: 20, width: 300, height: 300 });
        // Report once, like the real cropper after its first layout.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div data-testid="cropper" />;
    },
  };
});
const crop = vi.hoisted(() => ({
  cropToSquareJpeg: vi.fn(),
  loadImage: vi.fn(),
}));
vi.mock("@/lib/account/avatar.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/account/avatar.ts")>()),
  cropToSquareJpeg: crop.cropToSquareJpeg,
  loadImage: crop.loadImage,
}));

const user: ApiProfile["user"] = { id: "u1", email: "a@example.com", role: "buyer", fullName: "Ayesha Khan", isVerified: true, isActive: true };
const withPhoto = { ...user, avatarUrl: "https://res.cloudinary.com/demo/image/upload/c_fill,w_256,h_256/v1/a" };
const updated: ApiProfile = { user: withPhoto, displayName: "Ayesha Khan", profile: { kind: "buyer" } };
const jpeg = new Blob(["jpeg"], { type: "image/jpeg" });
const picture = (type = "image/png", size = 1000) => new File([new Uint8Array(size)], "me.png", { type });

beforeEach(() => {
  crop.loadImage.mockReset().mockResolvedValue({ width: 900, height: 600 });
  crop.cropToSquareJpeg.mockReset().mockResolvedValue(jpeg);
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup(current: ApiProfile["user"] = user, uploadAvatar = vi.fn().mockResolvedValue(updated)) {
  const repository = { uploadAvatar, removeAvatar: vi.fn().mockResolvedValue({ ...updated, user }) };
  const onUpdated = vi.fn();
  const view = render(
    <LanguageProvider>
      <AvatarEditor user={current} repository={repository} onUpdated={onUpdated} />
    </LanguageProvider>,
  );
  const pick = (file: File) => {
    const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')!;
    return act(async () => {
      await userEvent.upload(input, file, { applyAccept: false });
    });
  };
  return { repository, onUpdated, pick };
}

test("pick a photo, crop it inline (no dialog), and a 512px JPEG is uploaded", async () => {
  const { repository, onUpdated, pick } = setup();
  await pick(picture());

  const panel = await screen.findByRole("group", { name: "Crop your photo" });
  expect(panel).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Zoom")).toBeInTheDocument();

  await userEvent.setup().click(await screen.findByRole("button", { name: "Use this photo" }));

  await waitFor(() => expect(repository.uploadAvatar).toHaveBeenCalledWith(jpeg));
  expect(crop.cropToSquareJpeg).toHaveBeenCalledWith(expect.anything(), { x: 10, y: 20, width: 300, height: 300 });
  expect(onUpdated).toHaveBeenCalledWith(updated);
  expect(await screen.findByText("Photo updated.")).toBeInTheDocument();
  expect(screen.queryByRole("group", { name: "Crop your photo" })).not.toBeInTheDocument();
});

test("a failed upload keeps the crop open and says why", async () => {
  const uploadAvatar = vi.fn().mockRejectedValue(new ApiError(400, "File must be a JPEG, PNG or WebP image"));
  const { onUpdated, pick } = setup(user, uploadAvatar);
  await pick(picture());

  await userEvent.setup().click(await screen.findByRole("button", { name: "Use this photo" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't upload your photo. Please try again.");
  expect(screen.getByRole("group", { name: "Crop your photo" })).toBeInTheDocument();
  expect(onUpdated).not.toHaveBeenCalled();
  // Retry is possible straight away.
  expect(screen.getByRole("button", { name: "Use this photo" })).toBeEnabled();
});

test("the rate limit gets its own message", async () => {
  const uploadAvatar = vi.fn().mockRejectedValue(new ApiError(429, "Too Many Requests"));
  const { pick } = setup(user, uploadAvatar);
  await pick(picture());
  await userEvent.setup().click(await screen.findByRole("button", { name: "Use this photo" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Too many attempts");
});

test("unsupported types and oversize files are refused before anything is shown", async () => {
  const { repository, pick } = setup();

  await pick(picture("image/gif"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Choose a JPEG, PNG or WebP image.");
  expect(screen.queryByRole("group", { name: "Crop your photo" })).not.toBeInTheDocument();

  await pick(picture("image/png", 5 * 1024 * 1024 + 1));
  expect(await screen.findByRole("alert")).toHaveTextContent("over 5 MB");
  expect(repository.uploadAvatar).not.toHaveBeenCalled();
});

test("cancel closes the panel without uploading", async () => {
  const { repository, pick } = setup();
  await pick(picture());
  await userEvent.setup().click(await screen.findByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("group", { name: "Crop your photo" })).not.toBeInTheDocument();
  expect(repository.uploadAvatar).not.toHaveBeenCalled();
});

test("Remove photo needs a second click and then deletes it", async () => {
  const { repository, onUpdated } = setup(withPhoto);
  const ui = userEvent.setup();
  await ui.click(screen.getByRole("button", { name: "Remove photo" }));
  expect(repository.removeAvatar).not.toHaveBeenCalled();
  await ui.click(screen.getByRole("button", { name: "Remove" }));
  await waitFor(() => expect(repository.removeAvatar).toHaveBeenCalledTimes(1));
  expect(onUpdated).toHaveBeenCalled();
  expect(await screen.findByText("Photo removed.")).toBeInTheDocument();
});

test("without a photo the only action is Add photo", () => {
  setup();
  expect(screen.getByRole("button", { name: "Add photo" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Remove photo" })).not.toBeInTheDocument();
});
