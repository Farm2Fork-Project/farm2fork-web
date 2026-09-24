import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import ScanScreen from "./ScanScreen";

const ID = "6a2fe77bb77795516febc287";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test/api");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function search(value: string) {
  render(
    <LanguageProvider>
      <ScanScreen />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Product ID or QR link"), value);
  await user.click(screen.getByRole("button", { name: "Search" }));
}

test("rejects input that is not a product id without calling the API", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  await search("DEMO-1001");

  expect(await screen.findByText(/isn't a Farm2Fork product ID/)).toBeTruthy();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("resolves a pasted QR link to the product's real journey", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    jsonResponse(200, {
      product: {
        id: ID,
        name: "Chaunsa Mangoes",
        category: "fruits",
        unit: "kg",
        status: "active",
        listedAt: "2026-08-11T11:00:00.000Z",
      },
      farmer: null,
      events: [],
      summary: { totalEvents: 0, confirmedEvents: 0, originVerified: false },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await search(`https://farm2fork.com/trace/${ID}`);

  expect(await screen.findByText("Chaunsa Mangoes")).toBeTruthy();
  expect(fetchMock.mock.calls[0][0]).toBe(`http://api.test/api/trace/products/${ID}`);
});

test("distinguishes an unknown product from a failed request, and can retry", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse(404, { message: "Product not found" }))
    .mockResolvedValueOnce(jsonResponse(503, { message: "down" }))
    .mockResolvedValueOnce(jsonResponse(503, { message: "down" }));
  vi.stubGlobal("fetch", fetchMock);

  await search(ID);
  expect(await screen.findByText("No product found for this code")).toBeTruthy();

  await userEvent.setup().click(screen.getByRole("button", { name: "Search" }));
  expect(await screen.findByText("Couldn't load the journey")).toBeTruthy();

  await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
});
