"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Cropper from "react-easy-crop";
import { Avatar } from "@/components/account/Avatar";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { useLanguage } from "@/components/LanguageContext";
import { IcCamera } from "@/components/icons";
import { ApiError, type ApiProfile } from "@/lib/api/contracts.ts";
import type { AccountRepository } from "@/lib/account/account-repository.ts";
import {
  AVATAR_ACCEPT,
  checkAvatarFile,
  cropToSquareJpeg,
  loadImage,
  type CropArea,
} from "@/lib/account/avatar.ts";

type Phase =
  | { name: "idle" }
  | { name: "crop"; src: string }
  | { name: "saving"; src: string };

/**
 * Profile photo, edited inline on the page (not in a dialog): pick a file,
 * frame it in a square, and it is uploaded as a 512px JPEG. The photo saves on
 * its own; it is not part of the form's Save button.
 */
export function AvatarEditor({
  user,
  repository,
  onUpdated,
}: {
  user: ApiProfile["user"];
  repository: Pick<AccountRepository, "uploadAvatar" | "removeAvatar">;
  onUpdated: (profile: ApiProfile) => void;
}) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const wasCropping = useRef(false);

  const cropping = phase.name !== "idle";
  const src = phase.name === "idle" ? null : phase.src;

  // Free the object URL when the panel closes.
  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  useEffect(() => {
    if (cropping) {
      panelRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView?.({ block: "nearest" });
    } else if (wasCropping.current) {
      changeRef.current?.focus({ preventScroll: true });
    }
    wasCropping.current = cropping;
  }, [cropping]);

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setNotice("");
    const problem = checkAvatarFile(file);
    if (problem) {
      setError(t(problem === "type" ? "account.photo.errType" : "account.photo.errSize"));
      return;
    }
    setError("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    setPhase({ name: "crop", src: URL.createObjectURL(file) });
  }

  function close() {
    setPhase({ name: "idle" });
  }

  async function save() {
    if (phase.name !== "crop" || !area) return;
    setError("");
    setPhase({ name: "saving", src: phase.src });
    try {
      const image = await loadImage(phase.src);
      const blob = await cropToSquareJpeg(image, area);
      const profile = await repository.uploadAvatar(blob);
      onUpdated(profile);
      setNotice(t("account.photo.saved"));
      close();
    } catch (e) {
      setPhase({ name: "crop", src: phase.src });
      setError(t(e instanceof ApiError && e.status === 429 ? "authError.tooManyRequests" : "account.photo.errUpload"));
    }
  }

  async function remove() {
    setError("");
    setNotice("");
    setRemoving(true);
    try {
      onUpdated(await repository.removeAvatar());
      setNotice(t("account.photo.removed"));
    } catch {
      setError(t("account.photo.errRemove"));
    } finally {
      setRemoving(false);
    }
  }

  const saving = phase.name === "saving";

  return (
    <section className="ac-card" aria-labelledby="ac-photo">
      <h2 id="ac-photo">{t("account.photo.title")}</h2>
      <div className="ac-photo-row">
        <Avatar user={user} size={88} />
        <div className="ac-photo-actions">
          <input ref={inputRef} type="file" accept={AVATAR_ACCEPT} className="ac-file" onChange={onPick} tabIndex={-1} aria-hidden="true" />
          <button ref={changeRef} type="button" className="btn btn-outline" onClick={() => inputRef.current?.click()} disabled={cropping || removing}>
            <IcCamera size={16} /> {user.avatarUrl ? t("account.photo.change") : t("account.photo.add")}
          </button>
          {user.avatarUrl && !cropping ? (
            <InlineConfirm
              label={t("account.photo.remove")}
              prompt={t("account.photo.removePrompt")}
              confirmLabel={t("account.photo.removeConfirm")}
              onConfirm={remove}
              busy={removing}
              triggerClassName="btn btn-ghost"
            />
          ) : null}
          <p className="ac-sub">{t("account.photo.hint")}</p>
        </div>
      </div>

      {cropping ? (
        <div className="ac-crop-panel" ref={panelRef} tabIndex={-1} role="group" aria-label={t("account.photo.cropLabel")}>
          <div className="ac-crop">
            <Cropper
              image={src ?? undefined}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          </div>
          <label className="ac-zoom">
            <span>{t("account.photo.zoom")}</span>
            <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} disabled={saving} />
          </label>
          <p className="ac-sub">{t("account.photo.cropHint")}</p>
          <div className="ac-crop-actions">
            <button type="button" className="btn btn-outline" onClick={close} disabled={saving}>{t("confirm.cancel")}</button>
            <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={saving || !area}>
              {saving ? t("account.photo.uploading") : t("account.photo.use")}
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="ac-error" role="alert">{error}</p> : null}
      {notice ? <p className="ac-ok" role="status">{notice}</p> : null}
    </section>
  );
}
