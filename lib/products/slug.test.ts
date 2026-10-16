import { describe, expect, it } from "vitest";
import { productIdFromSlug, productPath, productSlug } from "./slug.ts";

const ID = "6acf31a55ab403729542ef2c";

describe("productSlug", () => {
  it("puts readable words in front of the id", () => {
    expect(productSlug({ id: ID, name: "Organic Tomato" })).toBe(`organic-tomato-${ID}`);
    expect(productPath({ id: ID, name: "Chaunsa Mangoes (Grade A)!" })).toBe(
      `/product/chaunsa-mangoes-grade-a-${ID}`,
    );
  });

  it("falls back to the bare id when the name has no latin letters", () => {
    expect(productSlug({ id: ID, name: "آم" })).toBe(ID);
  });

  it("strips accents and keeps very long names short", () => {
    expect(productSlug({ id: ID, name: "Crème Fraîche" })).toBe(`creme-fraiche-${ID}`);
    expect(productSlug({ id: ID, name: "a".repeat(200) }).length).toBeLessThanOrEqual(60 + 1 + 24);
  });
});

describe("productIdFromSlug", () => {
  it("reads the id from a slug, whatever the words say", () => {
    expect(productIdFromSlug(`organic-tomato-${ID}`)).toBe(ID);
    expect(productIdFromSlug(`old-name-before-rename-${ID}`)).toBe(ID);
    expect(productIdFromSlug(ID.toUpperCase())).toBe(ID);
  });

  it("rejects anything without a trailing 24-character id", () => {
    expect(productIdFromSlug("organic-tomato")).toBeNull();
    expect(productIdFromSlug(`${ID}0`)).toBeNull();
    expect(productIdFromSlug(`tomato-${ID}-x`)).toBeNull();
    expect(productIdFromSlug("")).toBeNull();
  });
});
