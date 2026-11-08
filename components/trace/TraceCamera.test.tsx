import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TraceCamera from "./TraceCamera";
const decode = vi.hoisted(() => vi.fn());
vi.mock("@zxing/browser", () => ({
  BrowserQRCodeReader: class {
    decodeFromConstraints = decode;
  },
}));
vi.mock("../LanguageContext", () => ({
  useLanguage: () => ({ language: "en" }),
}));
beforeEach(() => {
  decode.mockReset();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
  vi.stubGlobal("MediaStream", class {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("camera lifecycle", () => {
  it("shows a manual-link fallback when camera permission fails", async () => {
    decode.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    render(<TraceCamera onAccept={vi.fn()} onStop={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "paste a Farm2Fork link",
    );
  });
  it("ignores foreign QR, accepts once, and stops on unmount", async () => {
    const stop = vi.fn();
    decode.mockResolvedValue({ stop });
    const accept = vi.fn();
    const { unmount } = render(
      <TraceCamera onAccept={accept} onStop={vi.fn()} />,
    );
    await waitFor(() => expect(decode).toHaveBeenCalled());
    const callback = decode.mock.calls[0][2];
    const id = "6a2fe77bb77795516febc287";
    callback({ getText: () => `https://evil.test/trace/${id}` }, undefined, {
      stop,
    });
    expect(accept).not.toHaveBeenCalled();
    callback(
      { getText: () => `https://farm2fork.tech/trace/orders/${id}` },
      undefined,
      { stop },
    );
    callback(
      { getText: () => `https://farm2fork.tech/trace/orders/${id}` },
      undefined,
      { stop },
    );
    expect(accept).toHaveBeenCalledExactlyOnceWith({ kind: "order", id });
    unmount();
    expect(stop).toHaveBeenCalled();
  });
  it("stops a delayed camera initialization after unmount", async () => {
    let resolve!: (value: { stop: () => void }) => void;
    decode.mockReturnValue(
      new Promise((value) => {
        resolve = value;
      }),
    );
    const { unmount } = render(
      <TraceCamera onAccept={vi.fn()} onStop={vi.fn()} />,
    );
    unmount();
    const stop = vi.fn();
    resolve({ stop });
    await waitFor(() => expect(stop).toHaveBeenCalled());
  });
});
