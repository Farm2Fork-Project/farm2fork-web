import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import MapPinPicker from "./MapPinPicker";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("a valid coordinate pin works without browser location access and rejects points outside Pakistan", async () => {
  const onChange = vi.fn();
  render(<LanguageProvider><MapPinPicker purpose="dropoff" value={null} onChange={onChange} /></LanguageProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByText("Enter coordinates instead"));
  await user.type(screen.getByLabelText("Pin latitude"), "0");
  await user.type(screen.getByLabelText("Pin longitude"), "74.3587");
  await user.click(screen.getByRole("button", { name: "Set location pin" }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeVisible();
  await user.clear(screen.getByLabelText("Pin latitude"));
  await user.type(screen.getByLabelText("Pin latitude"), "31.5204");
  await user.click(screen.getByRole("button", { name: "Set location pin" }));
  expect(onChange).toHaveBeenCalledWith({ lat: 31.5204, lng: 74.3587 });
});

test("a late GPS result cannot change the selected address after the picker is disabled", async () => {
  let finish!: PositionCallback;
  vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition: (callback: PositionCallback) => { finish = callback; } } });
  const onChange = vi.fn();
  const { rerender } = render(<LanguageProvider><MapPinPicker purpose="dropoff" value={null} onChange={onChange} /></LanguageProvider>);
  await userEvent.click(screen.getByRole("button", { name: /Use my current location/ }));
  rerender(<LanguageProvider><MapPinPicker purpose="dropoff" value={null} onChange={onChange} disabled /></LanguageProvider>);
  await act(async () => { finish({ coords: { latitude: 31.5204, longitude: 74.3587 } } as GeolocationPosition); });
  expect(onChange).not.toHaveBeenCalled();
});
