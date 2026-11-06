"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { parseTraceLink, type TraceLink } from "@/lib/trace/trace-repository";
import { useLanguage } from "../LanguageContext";

/** Mount only after an explicit camera action; each mount owns its stream. */
export default function TraceCamera({
  onAccept,
  onStop,
}: {
  onAccept: (target: TraceLink) => void;
  onStop: () => void;
}) {
  const { language } = useLanguage();
  const copy = (en: string, ur: string) => (language === "ur" ? ur : en);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | undefined>(undefined);
  const accept = useRef(onAccept);
  const [error, setError] = useState(false);
  const [torch, setTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  useEffect(() => {
    accept.current = onAccept;
  }, [onAccept]);
  useEffect(() => {
    let active = true;
    let accepted = false;
    const element = video.current;
    const stop = () => {
      controls.current?.stop();
      const stream = element?.srcObject;
      if (typeof MediaStream !== "undefined" && stream instanceof MediaStream)
        stream.getTracks().forEach((track) => track.stop());
      if (element) element.srcObject = null;
    };
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !element)
          throw new Error("unsupported");
        const reader = new BrowserQRCodeReader();
        const scanner = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          element,
          (result, _error, scannerControls) => {
            if (!active || accepted || !result) return;
            const target = parseTraceLink(result.getText());
            if (!target) return;
            accepted = true;
            scannerControls.stop();
            stop();
            accept.current(target);
          },
        );
        controls.current = scanner;
        if (!active || accepted) {
          stop();
          return;
        }
        setTorch(Boolean(scanner.switchTorch));
      } catch {
        if (active) setError(true);
        stop();
      }
    };
    void start();
    return () => {
      active = false;
      stop();
    };
  }, []);
  const toggleTorch = async () => {
    try {
      await controls.current?.switchTorch?.(!torchOn);
      setTorchOn(!torchOn);
    } catch {
      setTorch(false);
    }
  };
  return (
    <div className="trace-camera">
      {error ? (
        <p role="alert">
          {copy(
            "Camera unavailable or permission denied. Allow camera access and retry, or paste a Farm2Fork link below.",
            "کیمرہ دستیاب نہیں یا اجازت نہیں ملی۔ کیمرے کی اجازت دے کر دوبارہ کوشش کریں، یا نیچے فارم ٹو فورک کا لنک درج کریں۔",
          )}
        </p>
      ) : (
        <>
          <p role="status">
            {copy(
              "Point the camera at a Farm2Fork QR code.",
              "کیمرہ فارم ٹو فورک کے کیو آر کوڈ کی طرف کریں۔",
            )}
          </p>
          <video
            ref={video}
            muted
            playsInline
            aria-label={copy("QR camera preview", "کیو آر کیمرے کا منظر")}
          />
          {torch ? (
            <button
              className="btn btn-outline"
              onClick={() => void toggleTorch()}
            >
              {torchOn
                ? copy("Turn torch off", "ٹارچ بند کریں")
                : copy("Turn torch on", "ٹارچ چلائیں")}
            </button>
          ) : null}
        </>
      )}
      <button className="btn btn-outline" type="button" onClick={onStop}>
        {copy("Stop camera", "کیمرہ بند کریں")}
      </button>
    </div>
  );
}
