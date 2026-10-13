import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import { FarmPickupLocation } from "./FarmPickupLocation";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("saves a complete pickup location and blocks an invalid map pin", async () => {
  const repository = {
    getFarmLocation: vi.fn().mockResolvedValue({ complete: false }),
    updateFarmLocation: vi
      .fn()
      .mockImplementation(async (value) => ({ ...value, complete: true })),
  };
  render(
    <LanguageProvider>
      <FarmPickupLocation repository={repository} />
    </LanguageProvider>,
  );
  const user = userEvent.setup();
  await screen.findByRole("button", { name: "Save pickup location" });
  await user.type(screen.getByLabelText("Street or village"), "Farm road");
  await user.type(screen.getByLabelText("Farm city"), "Lahore");
  await user.selectOptions(screen.getByLabelText("Farm province"), "Punjab");
  vi.stubGlobal("navigator", { ...navigator, geolocation: {
    getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 0, longitude: 74.3587 } } as GeolocationPosition),
  } });
  await user.click(screen.getByRole("button", { name: /Use my current location/ }));
  await user.click(
    screen.getByRole("button", { name: "Save pickup location" }),
  );
  expect(repository.updateFarmLocation).not.toHaveBeenCalled();
  vi.stubGlobal("navigator", { ...navigator, geolocation: {
    getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 31.5204, longitude: 74.3587 } } as GeolocationPosition),
  } });
  await user.click(screen.getByRole("button", { name: /Use my current location/ }));
  await user.click(
    screen.getByRole("button", { name: "Save pickup location" }),
  );
  expect(await screen.findByText("Pickup location saved.")).toBeVisible();
  expect(repository.updateFarmLocation).toHaveBeenCalledWith({
    address: "Farm road",
    city: "Lahore",
    province: "Punjab",
    lat: 31.5204,
    lng: 74.3587,
  });
});

test("keeps saving disabled when loading the existing location fails", async () => {
  const repository = {
    getFarmLocation: vi.fn().mockRejectedValue(new Error("offline")),
    updateFarmLocation: vi.fn(),
  };
  render(
    <LanguageProvider>
      <FarmPickupLocation repository={repository} />
    </LanguageProvider>,
  );
  await screen.findByRole("alert");
  expect(
    screen.getByRole("button", { name: "Save pickup location" }),
  ).toBeDisabled();
});
