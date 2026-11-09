import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { chooseOption } from "@/test/map-helpers";
import { LanguageProvider } from "../LanguageContext";
import ProvinceCityFields, { type ProvinceCityValue } from "./ProvinceCityFields";

afterEach(cleanup);

function Harness({ initial = { province: "", city: "" }, onValue }: { initial?: ProvinceCityValue; onValue?: (v: ProvinceCityValue) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <LanguageProvider>
      <ProvinceCityFields
        idPrefix="t"
        province={value.province}
        city={value.city}
        onChange={(next) => { setValue(next); onValue?.(next); }}
      />
    </LanguageProvider>
  );
}

test("city is locked until a province is chosen, then lists only that province's cities", async () => {
  const user = userEvent.setup();
  render(<Harness />);
  expect(screen.getByLabelText("City")).toBeDisabled();
  await chooseOption(user, "Province", "Sindh");
  const city = screen.getByLabelText("City");
  expect(city).toBeEnabled();
  await user.click(city);
  await user.type(city, "Karach");
  expect(await screen.findByText("Karachi")).toBeVisible();
  expect(screen.queryByText("Lahore")).toBeNull();
});

test("changing the province resets the city", async () => {
  const user = userEvent.setup();
  const seen: ProvinceCityValue[] = [];
  render(<Harness onValue={(v) => seen.push(v)} />);
  await chooseOption(user, "Province", "Punjab");
  await chooseOption(user, "City", "Lahore");
  expect(seen.at(-1)).toEqual({ province: "Punjab", city: "Lahore" });
  expect(screen.getByText("Lahore")).toBeVisible();
  await chooseOption(user, "Province", "Sindh");
  expect(seen.at(-1)).toEqual({ province: "Sindh", city: "" });
  expect(screen.queryByText("Lahore")).toBeNull();
  expect(screen.getByText("Choose city")).toBeVisible();
});

test("searching says so when nothing matches", async () => {
  const user = userEvent.setup();
  render(<Harness initial={{ province: "Punjab", city: "" }} />);
  const city = screen.getByLabelText("City");
  await user.click(city);
  await user.type(city, "zzzzqq");
  expect(await screen.findByText("No match found")).toBeVisible();
});

test("a city saved before the list existed stays selected", () => {
  render(<Harness initial={{ province: "Punjab", city: "Chak 5 Tehsil" }} />);
  expect(screen.getByText("Chak 5 Tehsil")).toBeVisible();
});

test("shows the data attribution", () => {
  render(<Harness />);
  expect(screen.getByText(/ODbL-1\.0/)).toBeVisible();
  expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute("href", expect.stringContaining("countries-states-cities-database"));
});

test("province names and the placeholders are shown in Urdu", async () => {
  localStorage.setItem("app_lang", "ur");
  const user = userEvent.setup();
  render(<Harness />);
  const province = await screen.findByLabelText("صوبہ");
  await user.click(province);
  await user.type(province, "سندھ");
  expect(await screen.findByText("سندھ")).toBeVisible();
  localStorage.clear();
});
