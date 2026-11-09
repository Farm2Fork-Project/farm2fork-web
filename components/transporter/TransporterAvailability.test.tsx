import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { chooseOption, dragMapTo } from "@/test/map-helpers";
import { LanguageProvider } from "./LanguageContext";
import { TransporterAvailability } from "./TransporterAvailability";
afterEach(cleanup);

test("online needs a pin placed on the map inside Pakistan and offline needs none", async () => {
  const status = { online: false, locationFresh: false, radiusKm: 20 };
  const repository = {
    getTransporterStatus: vi.fn().mockResolvedValue(status),
    setAvailability: vi
      .fn()
      .mockResolvedValueOnce({ ...status, online: true, locationFresh: true })
      .mockResolvedValueOnce(status),
    updateLocation: vi.fn(),
  };
  const onRefresh = vi.fn().mockResolvedValue(undefined);
  render(
    <LanguageProvider>
      <TransporterAvailability
        repository={repository}
        revision={0}
        onRefresh={onRefresh}
      />
    </LanguageProvider>,
  );
  await screen.findByText("Offline");
  const user = userEvent.setup();
  await chooseOption(user, "Province", "Punjab");
  await chooseOption(user, "City", "Lahore");
  expect(screen.getByRole("button", { name: "Go online" })).toBeDisabled();
  dragMapTo({ lat: 0, lng: 74.35 });
  expect(screen.getByRole("alert")).toBeVisible();
  expect(screen.getByRole("button", { name: "Go online" })).toBeDisabled();
  dragMapTo({ lat: 31.52, lng: 74.35 });
  await user.click(screen.getByRole("button", { name: "Go online" }));
  expect(await screen.findByText("Online")).toBeVisible();
  expect(repository.setAvailability).toHaveBeenCalledWith(true, {
    lat: 31.52,
    lng: 74.35,
  });
  await user.click(screen.getByRole("button", { name: "Go offline" }));
  expect(await screen.findByText("Offline")).toBeVisible();
  expect(repository.setAvailability).toHaveBeenLastCalledWith(false);
  expect(onRefresh).toHaveBeenCalledTimes(2);
});

test("failed online update keeps server state and supports retry", async () => {
  const repository = {
    getTransporterStatus: vi
      .fn()
      .mockResolvedValue({ online: false, locationFresh: false, radiusKm: 20 }),
    setAvailability: vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ online: true, locationFresh: true, radiusKm: 20 }),
    updateLocation: vi.fn(),
  };
  render(
    <LanguageProvider>
      <TransporterAvailability
        repository={repository}
        revision={0}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
      />
    </LanguageProvider>,
  );
  await screen.findByText("Offline");
  const user = userEvent.setup();
  await chooseOption(user, "Province", "Punjab");
  await chooseOption(user, "City", "Lahore");
  dragMapTo({ lat: 31.52, lng: 74.35 });
  await user.click(screen.getByRole("button", { name: "Go online" }));
  await screen.findByRole("alert");
  expect(screen.getByText("Offline")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Go online" }));
  expect(await screen.findByText("Online")).toBeVisible();
});

test('GPS measurement completed while hidden never sends a location', async () => {
 let resolvePosition: PositionCallback | undefined;
 const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation');
 Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: vi.fn((resolve: PositionCallback) => { resolvePosition = resolve; }) } });
 const repository = { getTransporterStatus: vi.fn().mockResolvedValue({online:false,locationFresh:false,radiusKm:20}), setAvailability:vi.fn(),updateLocation:vi.fn() };
 render(<LanguageProvider><TransporterAvailability repository={repository} onRefresh={vi.fn()} revision={0}/></LanguageProvider>);
 await screen.findByText('Offline'); await userEvent.click(screen.getByRole('button',{name:'Use current GPS location'}));
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'}); document.dispatchEvent(new Event('visibilitychange'));
 resolvePosition?.({coords:{latitude:31.5,longitude:74.3},timestamp:Date.now()} as GeolocationPosition);
 await Promise.resolve(); expect(repository.setAvailability).not.toHaveBeenCalled(); expect(repository.updateLocation).not.toHaveBeenCalled();
 Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
 if (original) Object.defineProperty(navigator,'geolocation',original); else Reflect.deleteProperty(navigator,'geolocation');
});
