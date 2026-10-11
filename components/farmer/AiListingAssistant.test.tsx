import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ApiError, type QualityCheckResult } from "@/lib/api/contracts.ts";
import { LanguageProvider } from "../LanguageContext";
import AiListingAssistant, { type AiAssistantClient } from "./AiListingAssistant";

afterEach(cleanup);

function renderAssistant(client: AiAssistantClient, overrides: Partial<{ productName: string }> = {}) {
  const onApplyPrice = vi.fn();
  const onApplyGrade = vi.fn();
  render(
    <LanguageProvider>
      <AiListingAssistant
        client={client}
        productName={overrides.productName ?? "Chaunsa Mangoes"}
        category="Fruits"
        unit="kg"
        grade="A"
        onApplyPrice={onApplyPrice}
        onApplyGrade={onApplyGrade}
      />
    </LanguageProvider>,
  );
  return { onApplyPrice, onApplyGrade };
}

const quality = (overrides: Partial<QualityCheckResult> = {}): QualityCheckResult => ({
  predictionId: "p1",
  modelGrade: "B",
  suggestedListingGrade: "B",
  confidenceScore: 0.26,
  probabilities: { A: 0.25, B: 0.26, C: 0.24, D: 0.25 },
  crop: "mango",
  cropSupported: true,
  lowConfidence: true,
  modelStatus: "untrained",
  modelVersion: "grade-cond-efficientnet_b0-untrained",
  ...overrides,
});

test("labels the rule-based price and lets the farmer apply the midpoint", async () => {
  const user = userEvent.setup();
  const client: AiAssistantClient = {
    aiStatus: vi.fn().mockResolvedValue({ available: true, qualityModel: "trained" }),
    suggestPrice: vi.fn().mockResolvedValue({
      predictionId: "x",
      predictedMinPrice: 154,
      predictedMaxPrice: 352,
      unit: "kg",
      confidenceScore: 0.45,
      method: "rule_based",
      basis: "crop",
      modelVersion: "price-rules-v1",
    }),
    checkQuality: vi.fn(),
  };
  const { onApplyPrice } = renderAssistant(client);

  await user.click(await screen.findByRole("button", { name: "Suggest a price" }));

  expect(await screen.findByText("Rs 154 – 352 per kg")).toBeTruthy();
  expect(screen.getByText(/not live market data/)).toBeTruthy();
  expect(client.suggestPrice).toHaveBeenCalledWith({
    productName: "Chaunsa Mangoes",
    category: "fruits",
    unit: "kg",
    qualityGrade: "A",
  });
  await user.click(screen.getByRole("button", { name: "Use Rs 253" }));
  expect(onApplyPrice).toHaveBeenCalledWith(253);
});

test("marks untrained grades as a preview and pre-selects the crop from the title", async () => {
  const user = userEvent.setup();
  const client: AiAssistantClient = {
    aiStatus: vi.fn().mockResolvedValue({ available: true, qualityModel: "untrained" }),
    suggestPrice: vi.fn(),
    checkQuality: vi.fn().mockResolvedValue(quality()),
  };
  const { onApplyGrade } = renderAssistant(client);

  expect(await screen.findByText(/grading model isn't trained yet/)).toBeTruthy();
  const photo = new File([new Uint8Array([1])], "mango.jpg", { type: "image/jpeg" });
  await user.upload(document.getElementById("ai-photo") as HTMLInputElement, photo);
  await user.click(screen.getByRole("button", { name: "Check quality" }));

  expect(client.checkQuality).toHaveBeenCalledWith(photo, "mango");
  expect(await screen.findByText("Grade B · 26% confidence")).toBeTruthy();
  expect(screen.getByText(/Preview only/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Use grade B" }));
  expect(onApplyGrade).toHaveBeenCalledWith("B");
});

test("offers no listing grade for a D", async () => {
  const user = userEvent.setup();
  const client: AiAssistantClient = {
    aiStatus: vi.fn().mockResolvedValue({ available: true, qualityModel: "trained" }),
    suggestPrice: vi.fn(),
    checkQuality: vi.fn().mockResolvedValue(
      quality({ modelGrade: "D", suggestedListingGrade: null, modelStatus: "trained" }),
    ),
  };
  renderAssistant(client);

  await user.upload(
    document.getElementById("ai-photo") as HTMLInputElement,
    new File([new Uint8Array([1])], "rice.jpg", { type: "image/jpeg" }),
  );
  await user.click(screen.getByRole("button", { name: "Check quality" }));

  expect(await screen.findByText(/Below listing grades/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Use grade/ })).toBeNull();
});

test("says so when the AI service is down instead of failing silently", async () => {
  const user = userEvent.setup();
  const client: AiAssistantClient = {
    aiStatus: vi.fn().mockResolvedValue({ available: true }),
    suggestPrice: vi.fn().mockRejectedValue(new ApiError(503, "down")),
    checkQuality: vi.fn(),
  };
  renderAssistant(client);

  await user.click(await screen.findByRole("button", { name: "Suggest a price" }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toMatch(/AI service isn't reachable/),
  );
});
