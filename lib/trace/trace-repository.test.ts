import { describe, expect, it, vi } from "vitest";
import {
  TraceRepository,
  parseTraceProductId,
  shortenTxHash,
} from "./trace-repository.ts";

const ID = "6a2fe77bb77795516febc287";

describe("parseTraceProductId", () => {
  it("accepts a bare id, normalizing case and whitespace", () => {
    expect(parseTraceProductId(`  ${ID.toUpperCase()} `)).toBe(ID);
  });

  it("extracts the id from a scanned QR trace URL", () => {
    expect(parseTraceProductId(`https://farm2fork.com/trace/${ID}`)).toBe(ID);
    expect(parseTraceProductId(`http://localhost:3001/trace/${ID}/`)).toBe(ID);
    expect(parseTraceProductId(`https://x.pk/trace/${ID}?src=qr#top`)).toBe(ID);
  });

  it("rejects input that cannot be a product id", () => {
    expect(parseTraceProductId("")).toBeNull();
    expect(parseTraceProductId("DEMO-1001")).toBeNull();
    expect(parseTraceProductId("https://farm2fork.com/trace/")).toBeNull();
    expect(parseTraceProductId(`${ID}00`)).toBeNull();
  });
});

describe("TraceRepository", () => {
  it("reads the public trace endpoint for a product", async () => {
    const request = vi.fn().mockResolvedValue({ events: [] });
    const repository = new TraceRepository({ client: { request } });

    await repository.getProductTrace(ID);

    expect(request).toHaveBeenCalledWith(`/trace/products/${ID}`);
  });
});

describe("shortenTxHash", () => {
  it("keeps short hashes and elides long ones", () => {
    expect(shortenTxHash("abc123")).toBe("abc123");
    expect(shortenTxHash("0123456789abcdefghijklmnopqrstuvwxyz")).toBe(
      "0123456789…stuvwxyz",
    );
  });
});
