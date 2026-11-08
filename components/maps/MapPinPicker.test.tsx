import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { dragMapTo } from "@/test/map-helpers";
import { LanguageProvider } from "../LanguageContext";
import MapPinPicker from "./MapPinPicker";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const LAHORE = { name: "Lahore", center: { lat: 31.5497, lng: 74.3436 } };
const wrap = (node: React.ReactNode) => <LanguageProvider>{node}</LanguageProvider>;

test("has no coordinate text inputs or coordinate wording", () => {
  const { container } = render(wrap(<MapPinPicker purpose="dropoff" value={null} onChange={vi.fn()} />));
  expect(container.querySelectorAll("input")).toHaveLength(0);
  expect(screen.queryByLabelText(/latitude|longitude|عرض بلد|طول بلد/i)).toBeNull();
  expect(container.textContent ?? "").not.toMatch(/latitude|longitude|coordinates/i);
});

test("dragging the map places the pin, and points outside Pakistan are rejected", async () => {
  const onChange = vi.fn();
  render(wrap(<MapPinPicker purpose="dropoff" value={null} onChange={onChange} />));
  await screen.findByTestId("pin-map");
  dragMapTo({ lat: 0, lng: 74.3587 });
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeVisible();
  dragMapTo({ lat: 31.5204, lng: 74.3587 });
  expect(onChange).toHaveBeenCalledWith({ lat: 31.5204, lng: 74.3587 });
  expect(screen.queryByRole("alert")).toBeNull();
});

test("a pin far from the chosen city asks before it is accepted", async () => {
  const onChange = vi.fn();
  render(wrap(<MapPinPicker purpose="farm" value={null} onChange={onChange} city={LAHORE} />));
  dragMapTo({ lat: 30.1575, lng: 71.5249 }); // Multan, ~320 km away
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByText("Your pin is far from Lahore. Is this right?")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Yes, keep this pin" }));
  expect(onChange).toHaveBeenCalledWith({ lat: 30.1575, lng: 71.5249 });
  expect(screen.queryByText(/far from Lahore/)).toBeNull();
});

test("declining a far pin sends the map back to the city centre", async () => {
  const onChange = vi.fn();
  render(wrap(<MapPinPicker purpose="farm" value={null} onChange={onChange} city={LAHORE} />));
  dragMapTo({ lat: 30.1575, lng: 71.5249 });
  await userEvent.click(screen.getByRole("button", { name: "No, go back to Lahore" }));
  expect(onChange).toHaveBeenCalledWith(LAHORE.center);
  expect(screen.getByTestId("pin-map").dataset.fly).toMatch(/^31\.5497,74\.3436,/);
});

test("a nearby pin is accepted without asking", async () => {
  const onChange = vi.fn();
  render(wrap(<MapPinPicker purpose="farm" value={null} onChange={onChange} city={LAHORE} />));
  await screen.findByTestId("pin-map");
  dragMapTo({ lat: 31.6, lng: 74.4 });
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

test("choosing another city flies there and questions a pin left in the old city", async () => {
  const onChange = vi.fn();
  const pin = { lat: 31.5204, lng: 74.3587 };
  const { rerender } = render(wrap(<MapPinPicker purpose="farm" value={pin} onChange={onChange} city={LAHORE} />));
  await screen.findByTestId("pin-map");
  expect(screen.queryByRole("alertdialog")).toBeNull();
  const karachi = { name: "Karachi", center: { lat: 24.8607, lng: 67.0011 } };
  rerender(wrap(<MapPinPicker purpose="farm" value={pin} onChange={onChange} city={karachi} />));
  expect(screen.getByTestId("pin-map").dataset.fly).toMatch(/^24\.8607,67\.0011,/);
  expect(screen.getByText("Your pin is far from Karachi. Is this right?")).toBeVisible();
});

function stubGeolocation(code: "ok" | "denied" | "unavailable" | "timeout") {
  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: {
      getCurrentPosition: (ok: PositionCallback, fail: PositionErrorCallback) => {
        if (code === "ok") return ok({ coords: { latitude: 31.5204, longitude: 74.3587 } } as GeolocationPosition);
        const codes = { denied: 1, unavailable: 2, timeout: 3 } as const;
        fail({ code: codes[code], PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: "" } as GeolocationPositionError);
      },
    },
  });
}

test.each([
  ["denied", /permission was denied/],
  ["unavailable", /Couldn't get your location/],
  ["timeout", /took too long/],
] as const)("use my location: %s shows a clear message and dragging still works", async (code, message) => {
  stubGeolocation(code);
  const onChange = vi.fn();
  render(wrap(<MapPinPicker purpose="dropoff" value={null} onChange={onChange} />));
  await userEvent.click(screen.getByRole("button", { name: /Use my current location/ }));
  expect(await screen.findByRole("alert")).toHaveTextContent(message);
  dragMapTo({ lat: 31.5204, lng: 74.3587 });
  expect(onChange).toHaveBeenCalledWith({ lat: 31.5204, lng: 74.3587 });
});

test("use my location flies the map to the pin", async () => {
  stubGeolocation("ok");
  const onChange = vi.fn();
  render(wrap(<MapPinPicker purpose="dropoff" value={null} onChange={onChange} />));
  await userEvent.click(screen.getByRole("button", { name: /Use my current location/ }));
  expect(onChange).toHaveBeenCalledWith({ lat: 31.5204, lng: 74.3587 });
  expect(screen.getByTestId("pin-map").dataset.fly).toBe("31.5204,74.3587,16");
});

test("a late GPS result cannot change the selected address after the picker is disabled", async () => {
  let finish!: PositionCallback;
  vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition: (callback: PositionCallback) => { finish = callback; } } });
  const onChange = vi.fn();
  const { rerender } = render(wrap(<MapPinPicker purpose="dropoff" value={null} onChange={onChange} />));
  await userEvent.click(screen.getByRole("button", { name: /Use my current location/ }));
  rerender(wrap(<MapPinPicker purpose="dropoff" value={null} onChange={onChange} disabled />));
  await act(async () => { finish({ coords: { latitude: 31.5204, longitude: 74.3587 } } as GeolocationPosition); });
  expect(onChange).not.toHaveBeenCalled();
});
