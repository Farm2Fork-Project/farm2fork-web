import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { FarmLocationFields } from "@/components/auth/FarmLocationFields";
import { CheckoutPanel } from "@/components/buyer/CheckoutPanel";
import FarmLocationPrompt from "@/components/farmer/FarmLocationPrompt";
import { FarmPickupLocation } from "@/components/farmer/FarmPickupLocation";
import { TransporterAvailability } from "@/components/transporter/TransporterAvailability";
import { LanguageProvider } from "../LanguageContext";
import MapPinPicker from "./MapPinPicker";

afterEach(cleanup);

/** Nobody types latitude/longitude: lat/lng are internal values only. */
function expectNoCoordinateInputs(container: HTMLElement) {
  for (const input of container.querySelectorAll("input")) {
    expect(input.type, "number inputs are how coordinates get typed").not.toBe("number");
    expect(input.getAttribute("inputmode")).not.toBe("decimal");
  }
  expect(screen.queryByLabelText(/latitude|longitude|عرض بلد|طول بلد/i)).toBeNull();
  expect(container.textContent ?? "").not.toMatch(/latitude|longitude|enter coordinates/i);
}

test("every location input is free of coordinate entry", async () => {
  const farm = {
    getFarmLocation: vi.fn().mockResolvedValue({ complete: false }),
    updateFarmLocation: vi.fn(),
  };
  const transporter = {
    getTransporterStatus: vi.fn().mockResolvedValue({ online: false, locationFresh: false, radiusKm: 20 }),
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  };
  const values: Record<string, string> = {};
  const { container } = render(
    <LanguageProvider>
      <MapPinPicker purpose="farm" value={null} onChange={vi.fn()} />
      <FarmLocationFields idPrefix="a" text={(n) => values[n] ?? ""} setValue={vi.fn()} blur={vi.fn()} error={() => undefined} disabled={false} />
      <FarmLocationPrompt client={farm} />
      <FarmPickupLocation repository={farm} />
      <TransporterAvailability repository={transporter} revision={0} onRefresh={vi.fn()} />
      <CheckoutPanel
        groups={[]}
        repository={{ quoteOrder: vi.fn(), createOrder: vi.fn(), startPayment: vi.fn() } as never}
        onConfirmedFarmers={vi.fn()}
        onViewOrders={vi.fn()}
      />
    </LanguageProvider>,
  );
  await screen.findByText("Offline");
  expectNoCoordinateInputs(container);
});

test("the location screens stay off Google Maps and coordinate copy", () => {
  const files = [
    "components/maps/MapPinPicker.tsx",
    "components/maps/DeliveryMap.tsx",
    "components/maps/PinMapCanvas.tsx",
    "components/maps/DeliveryMapCanvas.tsx",
    "components/auth/FarmLocationFields.tsx",
    "components/farmer/FarmLocationPrompt.tsx",
    "components/farmer/FarmPickupLocation.tsx",
    "components/transporter/TransporterAvailability.tsx",
    "components/buyer/CheckoutPanel.tsx",
  ];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    expect(source, file).not.toMatch(/react-google-maps|GOOGLE_MAPS_API_KEY/);
    expect(source, file).not.toMatch(/type=["']number["']/);
    expect(source, file).not.toMatch(/map\.(enterCoordinates|latitude|longitude|setCoordinates|noKey)|signup\.(latitude|longitude)/);
  }
});
