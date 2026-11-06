import { describe, expect, it, vi } from "vitest";
import {
  TraceRepository,
  parseTraceProductId,
  parseTraceLink,
  shortenTxHash,
} from "./trace-repository.ts";

const ID = "6a2fe77bb77795516febc287";

describe("parseTraceProductId", () => {
  it("accepts a bare id, normalizing case and whitespace", () => {
    expect(parseTraceProductId(`  ${ID.toUpperCase()} `)).toBe(ID);
  });

  it("extracts the id from a scanned QR trace URL", () => {
    expect(parseTraceProductId(`https://farm2fork.tech/trace/${ID}`)).toBe(ID);
    expect(parseTraceProductId(`https://farm2fork.com/trace/${ID}`)).toBe(ID);
    expect(
      parseTraceProductId(`https://farm2fork.tech/trace/products/${ID}`),
    ).toBe(ID);
    expect(
      parseTraceLink(`https://preview.test/trace/orders/${ID}`, {
        currentOrigin: "https://preview.test",
      }),
    ).toEqual({ kind: "order", id: ID });
    expect(parseTraceLink(`farm2fork://app/trace/orders/${ID}`)).toEqual({
      kind: "order",
      id: ID,
    });
    expect(parseTraceProductId(`https://x.pk/trace/${ID}?src=qr`)).toBeNull();
    expect(parseTraceLink(`https://farm2fork.tech/arbitrary/${ID}`)).toBeNull();
    expect(parseTraceLink(`javascript://app/trace/${ID}`)).toBeNull();
    expect(
      parseTraceLink(`https://farm2fork.tech.evil.test/trace/${ID}`),
    ).toBeNull();
    expect(
      parseTraceProductId(`farm2fork://app/trace/orders/${ID}`),
    ).toBeNull();
  });

  it("rejects input that cannot be a product id", () => {
    expect(parseTraceProductId("")).toBeNull();
    expect(parseTraceProductId("DEMO-1001")).toBeNull();
    expect(parseTraceProductId("https://farm2fork.com/trace/")).toBeNull();
    expect(parseTraceProductId(`${ID}00`)).toBeNull();
  });
});

describe("TraceRepository", () => {
  it("reads order trace and authenticated QR endpoints", async () => {
    const request = vi.fn().mockResolvedValue({ events: [] });
    const repository = new TraceRepository({ client: { request } });
    await repository.getOrderTrace(ID);
    await repository.getOrderQr(ID);
    expect(request).toHaveBeenNthCalledWith(1, `/trace/orders/${ID}`);
    expect(request).toHaveBeenNthCalledWith(2, `/orders/${ID}/qr`);
  });
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
