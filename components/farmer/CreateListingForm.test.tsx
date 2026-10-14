import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import CreateListingForm from "./CreateListingForm";

test("CreateListingForm normalizes its UI values to the product API contract", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <LanguageProvider>
      <CreateListingForm onCancel={vi.fn()} onSubmit={onSubmit} />
    </LanguageProvider>,
  );

  await user.type(screen.getByLabelText(/product title/i), "Roma Tomatoes");
  await user.selectOptions(screen.getByLabelText(/category/i), "Vegetables");
  await user.selectOptions(screen.getByLabelText(/grade \/ quality/i), "A");
  await user.type(screen.getByLabelText(/description/i), "Fresh");
  await user.type(screen.getByLabelText(/price per unit/i), "120");
  await user.selectOptions(screen.getByLabelText(/selling unit/i), "litre");
  await user.type(screen.getByLabelText(/available stock/i), "50");
  await user.click(screen.getByRole("button", { name: /publish listing/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    name: "Roma Tomatoes",
    category: "vegetables",
    description: "Fresh",
    price: 120,
    quantity: 50,
    unit: "litre",
    qualityGrade: "A",
  });
});

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  return (async () => {
    await user.type(screen.getByLabelText(/product title/i), "Roma Tomatoes");
    await user.type(screen.getByLabelText(/price per unit/i), "120");
    await user.type(screen.getByLabelText(/available stock/i), "50");
  })();
}

function photoInput() {
  return document.querySelector(
    '.lc-photo-add input[type="file"]',
  ) as HTMLInputElement;
}

test("CreateListingForm uploads the chosen photos and sends their URLs as images", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onUploadPhotos = vi.fn().mockResolvedValue(["https://cdn.test/a.jpg"]);
  render(
    <LanguageProvider>
      <CreateListingForm
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        onUploadPhotos={onUploadPhotos}
      />
    </LanguageProvider>,
  );

  const photo = new File(["x"], "tomatoes.jpg", { type: "image/jpeg" });
  await user.upload(photoInput(), photo);
  expect(screen.getByAltText("tomatoes.jpg")).toBeInTheDocument();
  await fillRequired(user);
  await user.click(screen.getByRole("button", { name: /publish listing/i }));

  expect(onUploadPhotos).toHaveBeenCalledWith([photo]);
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Roma Tomatoes",
      images: ["https://cdn.test/a.jpg"],
    }),
  );
});

test("CreateListingForm rejects wrong file types and lets a photo be removed", async () => {
  // The picker's accept filter would drop the PDF before the component sees it.
  const user = userEvent.setup({ applyAccept: false });
  render(
    <LanguageProvider>
      <CreateListingForm
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        onUploadPhotos={vi.fn()}
      />
    </LanguageProvider>,
  );

  await user.upload(
    photoInput(),
    new File(["x"], "notes.pdf", { type: "application/pdf" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /JPEG, PNG or WebP/,
  );

  await user.upload(
    photoInput(),
    new File(["x"], "ok.png", { type: "image/png" }),
  );
  await user.click(
    screen.getByRole("button", { name: /remove photo: ok\.png/i }),
  );
  expect(screen.queryByAltText("ok.png")).not.toBeInTheDocument();
});

test("CreateListingForm keeps the form and shows the error when photo upload fails", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(
    <LanguageProvider>
      <CreateListingForm
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        onUploadPhotos={vi
          .fn()
          .mockRejectedValue(
            new Error("Only JPEG, PNG or WebP images are accepted"),
          )}
      />
    </LanguageProvider>,
  );

  await user.upload(
    photoInput(),
    new File(["x"], "a.jpg", { type: "image/jpeg" }),
  );
  await fillRequired(user);
  await user.click(screen.getByRole("button", { name: /publish listing/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /JPEG, PNG or WebP images are accepted/,
  );
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/product title/i)).toHaveValue("Roma Tomatoes");
});

test("Other crops can publish with a manual grade without a quality request", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const aiClient = {
    aiStatus: vi
      .fn()
      .mockResolvedValue({ available: true, qualityModel: "trained" }),
    suggestPrice: vi.fn(),
    checkQuality: vi.fn(),
  };
  render(
    <LanguageProvider>
      <CreateListingForm
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        aiClient={aiClient}
      />
    </LanguageProvider>,
  );
  await fillRequired(user);
  await user.selectOptions(screen.getByLabelText("Crop in the photo"), "other");
  await user.selectOptions(screen.getByLabelText(/grade \/ quality/i), "C");
  await user.click(screen.getByRole("button", { name: /publish listing/i }));
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Roma Tomatoes", qualityGrade: "C" }),
  );
  expect(aiClient.checkQuality).not.toHaveBeenCalled();
});

test.each([false, true])(
  "invalidating an applied AI grade restores manual selection (override=%s)",
  async (manualOverride) => {
    const user = userEvent.setup();
    const aiClient = {
      aiStatus: vi
        .fn()
        .mockResolvedValue({ available: true, qualityModel: "trained" }),
      suggestPrice: vi.fn(),
      checkQuality: vi.fn().mockResolvedValue({
        modelGrade: "B",
        suggestedListingGrade: "B",
        confidenceScore: 0.8,
        crop: "mango",
        cropSupported: true,
        modelStatus: "trained",
        lowConfidence: false,
      }),
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <LanguageProvider>
        <CreateListingForm
          onCancel={vi.fn()}
          onSubmit={onSubmit}
          aiClient={aiClient}
        />
      </LanguageProvider>,
    );
    await fillRequired(user);
    const manualGrade = screen.getByLabelText(/grade \/ quality/i);
    await user.selectOptions(manualGrade, "C");
    await user.selectOptions(
      screen.getByLabelText("Crop in the photo"),
      "mango",
    );
    await user.upload(
      document.getElementById("ai-photo") as HTMLInputElement,
      new File(["x"], "mango.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: "Check quality" }));
    expect(manualGrade).toHaveValue("C");
    await user.click(
      await screen.findByRole("button", { name: "Use grade B" }),
    );
    expect(manualGrade).toHaveValue("B");
    if (manualOverride) await user.selectOptions(manualGrade, "A");
    await user.selectOptions(
      screen.getByLabelText("Crop in the photo"),
      "other",
    );
    expect(manualGrade).toHaveValue(manualOverride ? "A" : "C");
    await user.click(screen.getByRole("button", { name: /publish listing/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ qualityGrade: manualOverride ? "A" : "C" }),
    );
    expect(aiClient.checkQuality).toHaveBeenCalledTimes(1);
  },
);

test("editing can clear photos and description and save zero stock, without creating a new listing", async () => {
  const user = userEvent.setup();
  const onSubmit = vi
    .fn()
    .mockRejectedValueOnce(new Error("Connection interrupted"))
    .mockResolvedValue(undefined);
  render(
    <LanguageProvider>
      <CreateListingForm
        onCancel={vi.fn()}
        onSubmit={onSubmit}
        onUploadPhotos={vi.fn()}
        initialListing={{
          name: "Tomatoes",
          category: "vegetables",
          price: 120,
          quantity: 20,
          unit: "kg",
          qualityGrade: "B",
          description: "Old description",
          images: ["https://cdn.test/a.jpg"],
        }}
      />
    </LanguageProvider>,
  );
  expect(screen.getByRole("heading", { name: "Edit listing" })).toBeVisible();
  await user.clear(screen.getByLabelText(/description/i));
  await user.clear(screen.getByLabelText(/available stock/i));
  await user.type(screen.getByLabelText(/available stock/i), "0");
  await user.click(screen.getByRole("button", { name: /remove photo: 1/i }));
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Connection interrupted",
  );
  expect(screen.getByLabelText(/product title/i)).toHaveValue("Tomatoes");
  expect(onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({
      description: "",
      images: [],
      quantity: 0,
      expectedQuantity: 20,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  expect(onSubmit).toHaveBeenCalledTimes(2);
});

for (const visibility of ["active", "sold_out"] as const) {
  test(`editing a description preserves original stock and ${visibility} visibility`, async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <LanguageProvider>
        <CreateListingForm
          onCancel={vi.fn()}
          onSubmit={onSubmit}
          initialVisibility={visibility}
          initialListing={{
            name: "Tomatoes",
            category: "vegetables",
            price: 120,
            quantity: 10,
            unit: "kg",
            qualityGrade: "A",
            description: "Original",
            images: [],
          }}
        />
      </LanguageProvider>,
    );
    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), "New description");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSubmit).toHaveBeenCalledWith({ description: "New description" });
    await user.clear(screen.getByLabelText(/available stock/i));
    await user.type(screen.getByLabelText(/available stock/i), "12");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    expect(onSubmit).toHaveBeenLastCalledWith({
      description: "New description",
      quantity: 12,
      expectedQuantity: 10,
    });
  });
}
