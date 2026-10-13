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
  return document.querySelector('.lc-photo-add input[type="file"]') as HTMLInputElement;
}

test("CreateListingForm uploads the chosen photos and sends their URLs as images", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onUploadPhotos = vi.fn().mockResolvedValue(["https://cdn.test/a.jpg"]);
  render(
    <LanguageProvider>
      <CreateListingForm onCancel={vi.fn()} onSubmit={onSubmit} onUploadPhotos={onUploadPhotos} />
    </LanguageProvider>,
  );

  const photo = new File(["x"], "tomatoes.jpg", { type: "image/jpeg" });
  await user.upload(photoInput(), photo);
  expect(screen.getByAltText("tomatoes.jpg")).toBeInTheDocument();
  await fillRequired(user);
  await user.click(screen.getByRole("button", { name: /publish listing/i }));

  expect(onUploadPhotos).toHaveBeenCalledWith([photo]);
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Roma Tomatoes", images: ["https://cdn.test/a.jpg"] }),
  );
});

test("CreateListingForm rejects wrong file types and lets a photo be removed", async () => {
  // The picker's accept filter would drop the PDF before the component sees it.
  const user = userEvent.setup({ applyAccept: false });
  render(
    <LanguageProvider>
      <CreateListingForm onCancel={vi.fn()} onSubmit={vi.fn()} onUploadPhotos={vi.fn()} />
    </LanguageProvider>,
  );

  await user.upload(photoInput(), new File(["x"], "notes.pdf", { type: "application/pdf" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/JPEG, PNG or WebP/);

  await user.upload(photoInput(), new File(["x"], "ok.png", { type: "image/png" }));
  await user.click(screen.getByRole("button", { name: /remove photo: ok\.png/i }));
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
        onUploadPhotos={vi.fn().mockRejectedValue(new Error("Only JPEG, PNG or WebP images are accepted"))}
      />
    </LanguageProvider>,
  );

  await user.upload(photoInput(), new File(["x"], "a.jpg", { type: "image/jpeg" }));
  await fillRequired(user);
  await user.click(screen.getByRole("button", { name: /publish listing/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/JPEG, PNG or WebP images are accepted/);
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/product title/i)).toHaveValue("Roma Tomatoes");
});
