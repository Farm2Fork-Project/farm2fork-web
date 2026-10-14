import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ApiError, type QualityCheckResult } from "@/lib/api/contracts.ts";
import { LanguageProvider } from "../LanguageContext";
import AiListingAssistant, { type AiAssistantClient } from "./AiListingAssistant";

afterEach(() => { cleanup(); localStorage.clear(); });

function renderAssistant(client: AiAssistantClient, overrides: Partial<{ productName: string }> = {}) {
  const onApplyPrice = vi.fn();
  const onApplyGrade = vi.fn();
  const view = render(
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
  return { onApplyPrice, onApplyGrade, ...view };
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

test("requires a deliberate crop choice and applies a grade only on confirmation", async () => {
  const user = userEvent.setup();
  const client: AiAssistantClient = {
    aiStatus: vi.fn().mockResolvedValue({ available: true, qualityModel: "untrained" }),
    suggestPrice: vi.fn(),
    checkQuality: vi.fn().mockResolvedValue(quality()),
  };
  const { onApplyGrade } = renderAssistant(client);

  expect(await screen.findByText(/grading model isn't trained yet/)).toBeTruthy();
  expect(screen.getByLabelText("Crop in the photo")).toHaveValue("");
  await user.selectOptions(screen.getByLabelText("Crop in the photo"), "mango");
  const photo = new File([new Uint8Array([1])], "mango.jpg", { type: "image/jpeg" });
  await user.upload(document.getElementById("ai-photo") as HTMLInputElement, photo);
  await user.click(screen.getByRole("button", { name: "Check quality" }));

  expect(client.checkQuality).toHaveBeenCalledWith(photo, "mango");
  expect(await screen.findByText("Suggested grade B · 26% model confidence")).toBeTruthy();
  expect(screen.getByText(/Preview only/)).toBeTruthy();
  expect(onApplyGrade).not.toHaveBeenCalled();
  expect(screen.getByText(/does not certify quality/)).toBeInTheDocument();
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

  await user.selectOptions(screen.getByLabelText("Crop in the photo"), "rice");
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

function gradingClient(checkQuality = vi.fn().mockResolvedValue(quality())): AiAssistantClient {
  return {
    aiStatus: vi.fn().mockResolvedValue({ available: true, qualityModel: "trained" }),
    suggestPrice: vi.fn(),
    checkQuality,
  };
}

test("Other skips grading and keeps an unsupported crop out of requests", async () => {
  const user = userEvent.setup();
  const client = gradingClient();
  renderAssistant(client, { productName: "Cotton" });
  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(screen.getAllByRole("option").map((option) => option.getAttribute("value")))
    .toEqual(["", "wheat", "rice", "mango", "maize", "other"]);
  await user.selectOptions(screen.getByRole("combobox"), "other");
  expect(screen.getByText(/AI grading is not available for this crop/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Choose a photo" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Check quality" })).not.toBeInTheDocument();
  expect(document.getElementById("ai-photo")).toBeNull();
  expect(client.checkQuality).not.toHaveBeenCalled();
});

test.each(["other", "rice"])("discards an in-flight grade after switching crop to %s", async (nextCrop) => {
  const user = userEvent.setup();
  let resolve!: (result: QualityCheckResult) => void;
  const client = gradingClient(vi.fn(() => new Promise<QualityCheckResult>((done) => { resolve = done; })));
  const { onApplyGrade } = renderAssistant(client);
  await user.selectOptions(screen.getByRole("combobox"), "mango");
  await user.upload(document.getElementById("ai-photo") as HTMLInputElement,
    new File(["x"], "mango.jpg", { type: "image/jpeg" }));
  await user.click(screen.getByRole("button", { name: "Check quality" }));
  await user.selectOptions(screen.getByRole("combobox"), nextCrop);
  await act(async () => { resolve(quality()); });
  expect(screen.queryByText(/Suggested grade/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Use grade B" })).not.toBeInTheDocument();
  expect(onApplyGrade).not.toHaveBeenCalled();
  expect(client.checkQuality).toHaveBeenCalledTimes(1);
  if (nextCrop === "rice") {
    expect(screen.getByRole("button", { name: "Check quality" })).toBeDisabled();
    await user.upload(document.getElementById("ai-photo") as HTMLInputElement,
      new File(["y"], "rice.jpg", { type: "image/jpeg" }));
    await user.click(screen.getByRole("button", { name: "Check quality" }));
    await act(async () => { resolve(quality({ crop: "rice" })); });
    expect(await screen.findByRole("button", { name: "Use grade B" })).toBeInTheDocument();
  }
});

test("switching to Other clears a completed suggestion immediately", async () => {
  const user = userEvent.setup();
  const { onApplyGrade } = renderAssistant(gradingClient());
  await user.selectOptions(screen.getByRole("combobox"), "mango");
  await user.upload(document.getElementById("ai-photo") as HTMLInputElement,
    new File(["x"], "mango.jpg", { type: "image/jpeg" }));
  await user.click(screen.getByRole("button", { name: "Check quality" }));
  expect(await screen.findByRole("button", { name: "Use grade B" })).toBeInTheDocument();
  await user.selectOptions(screen.getByRole("combobox"), "other");
  expect(screen.queryByRole("button", { name: "Use grade B" })).not.toBeInTheDocument();
  expect(onApplyGrade).not.toHaveBeenCalled();
});

test("changing the product invalidates the pending grade and requires a fresh crop choice", async () => {
  const user = userEvent.setup();
  let resolve!: (result: QualityCheckResult) => void;
  const client = gradingClient(vi.fn(() => new Promise<QualityCheckResult>((done) => { resolve = done; })));
  const { rerender, onApplyGrade, onApplyPrice } = renderAssistant(client);
  await user.selectOptions(screen.getByRole("combobox"), "mango");
  await user.upload(document.getElementById("ai-photo") as HTMLInputElement,
    new File(["x"], "mango.jpg", { type: "image/jpeg" }));
  await user.click(screen.getByRole("button", { name: "Check quality" }));
  rerender(<LanguageProvider><AiListingAssistant client={client} productName="Rice"
    category="Grains" unit="kg" grade="A" onApplyGrade={onApplyGrade} onApplyPrice={onApplyPrice} /></LanguageProvider>);
  await act(async () => { resolve(quality()); });
  expect(screen.getByRole("combobox")).toHaveValue("");
  expect(screen.queryByText(/Suggested grade/)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Check quality" })).toBeDisabled();
});


test("a crop name in the title never authorizes a quality request", async () => {
  const user = userEvent.setup();
  const client = gradingClient();
  renderAssistant(client);
  await user.upload(document.getElementById("ai-photo") as HTMLInputElement,
    new File(["x"], "mango.jpg", { type: "image/jpeg" }));
  const check = screen.getByRole("button", { name: "Check quality" });
  expect(check).toBeDisabled();
  await user.click(check);
  expect(client.checkQuality).not.toHaveBeenCalled();
});

test("Other crop and unavailable grading guidance are localized in Urdu", async () => {
  localStorage.setItem("app_lang", "ur");
  const user = userEvent.setup();
  const client = gradingClient();
  renderAssistant(client);
  await user.selectOptions(screen.getByRole("combobox"), "other");
  expect(screen.getByRole("option", { name: "دیگر فصل" })).toBeInTheDocument();
  expect(screen.getByText(/اس فصل کے لیے اے آئی گریڈنگ دستیاب نہیں ہے/)).toBeInTheDocument();
  expect(client.checkQuality).not.toHaveBeenCalled();
});
