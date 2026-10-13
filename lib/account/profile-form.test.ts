import { describe, expect, test } from "vitest";
import type { ApiProfile } from "../api/contracts.ts";
import { diffProfile, initialForm, isDirty, splitApiFieldErrors, validateProfileForm } from "./profile-form.ts";

const farmer: ApiProfile = {
  user: { id: "f1", email: "t@example.com", role: "farmer", phone: "+923211234567", fullName: "Tariq Mehmood", isVerified: true, isActive: true },
  displayName: "Tariq Mehmood",
  profile: {
    kind: "farmer",
    cnicMasked: "*********4561",
    farmName: "Green Valley Farm",
    cropTypes: ["wheat", "Tomatoes"],
    landSizeAcres: 12.5,
    farmLocation: { address: "Chak 5", city: "Multan", province: "Punjab", lat: 30.1575, lng: 71.5249, complete: true },
  },
};
const buyer: ApiProfile = {
  user: { id: "b1", email: "a@example.com", role: "buyer", phone: "+923001234567", fullName: "Ayesha Khan", isVerified: true, isActive: true },
  displayName: "Ayesha Khan",
  profile: { kind: "buyer", cnicMasked: "*********5671", businessName: "Khan Traders", businessType: "retailer" },
};

describe("edit-profile dirty state", () => {
  test("an untouched form is clean", () => {
    expect(isDirty(farmer, initialForm(farmer))).toBe(false);
    expect(isDirty(buyer, initialForm(buyer))).toBe(false);
  });

  test("typing the same phone in another format is still clean", () => {
    expect(isDirty(farmer, { ...initialForm(farmer), phone: "0321 1234567" })).toBe(false);
  });

  test("a changed field makes it dirty and the diff holds only that field", () => {
    const form = { ...initialForm(farmer), farmName: "  Blue Farm " };
    expect(isDirty(farmer, form)).toBe(true);
    expect(diffProfile(farmer, form)).toEqual({ changes: { farmName: "Blue Farm" }, location: null });
  });

  test("phone is sent as E.164 and crops as a list", () => {
    const form = { ...initialForm(farmer), phone: "0300 7654321", cropTypes: ["wheat"] };
    expect(diffProfile(farmer, form).changes).toEqual({ phone: "+923007654321", cropTypes: ["wheat"] });
  });

  test("a changed pin goes to the farm-location call, not the profile PATCH", () => {
    const form = { ...initialForm(farmer), lat: "31.5", lng: "74.3" };
    expect(diffProfile(farmer, form)).toEqual({
      changes: {},
      location: { address: "Chak 5", city: "Multan", province: "Punjab", lat: 31.5, lng: 74.3 },
    });
  });

  test("buyers: switching to individual does not overwrite the business name", () => {
    const form = { ...initialForm(buyer), businessType: "individual" };
    expect(diffProfile(buyer, form).changes).toEqual({ businessType: "individual" });
  });
});

describe("edit-profile validation", () => {
  test("a valid form has no errors", () => {
    expect(validateProfileForm(farmer, initialForm(farmer))).toEqual({});
    expect(validateProfileForm(buyer, initialForm(buyer))).toEqual({});
  });

  test("names, phone and role fields are checked with the same messages as sign-up", () => {
    const form = { ...initialForm(buyer), fullName: "A", phone: "12", businessName: "" };
    expect(validateProfileForm(buyer, form)).toEqual({
      fullName: "signup.err.fullName",
      phone: "signup.err.phone",
      businessName: "signup.err.businessName",
    });
  });

  test("a stored phone cannot be blanked (the API cannot clear it)", () => {
    expect(validateProfileForm(farmer, { ...initialForm(farmer), phone: "" }).phone).toBe("signup.err.phone");
  });

  test("an edited farm location must be complete and inside Pakistan", () => {
    const bad = { ...initialForm(farmer), address: "", lat: "51" };
    expect(validateProfileForm(farmer, bad)).toMatchObject({ address: "signup.err.address", location: "signup.err.location" });
  });

  test("a profile with no name yet may stay nameless", () => {
    const nameless: ApiProfile = { ...buyer, user: { ...buyer.user, fullName: undefined } };
    expect(validateProfileForm(nameless, initialForm(nameless))).toEqual({});
  });
});

describe("API field errors", () => {
  test("class-validator messages are matched to their fields", () => {
    expect(splitApiFieldErrors("fullName must be longer than or equal to 2 characters; phone must be a valid phone number")).toEqual({
      fields: ["fullName", "phone"],
      other: [],
    });
  });

  test("messages that name no known field are kept for the form-level error", () => {
    expect(splitApiFieldErrors("cnic cannot be edited; farmName must be a string")).toEqual({ fields: ["farmName"], other: ["cnic cannot be edited"] });
  });
});
