import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
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
