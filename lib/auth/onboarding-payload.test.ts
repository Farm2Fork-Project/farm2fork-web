import { describe, expect, test } from "vitest";
import {
  buildBuyerOnboarding,
  buildFarmerOnboarding,
  validateBuyerAbout,
  validateFarmerFarm,
  validateIdentity,
} from "./onboarding-payload.ts";

const buyer = { fullName: "Ayesha Khan", phone: "0300 1234567", businessType: "retailer", businessName: "Khan Traders", cnic: "35202-1234567-1" };
const farmer = {
  fullName: "Tariq Mehmood", phone: "03211234567", farmName: "Green Valley Farm", landSizeAcres: "12.5", cropTypes: ["wheat"],
  address: "Chak 5, Canal Road", city: "Multan", province: "Punjab", lat: "30.1575", lng: "71.5249", cnic: "3520212345671",
};

describe("step validation", () => {
  test("identity: a name, an optional valid phone, a 13-digit CNIC", () => {
    expect(validateIdentity(buyer)).toEqual({});
    expect(validateIdentity({ ...buyer, fullName: "A", phone: "12", cnic: "123" })).toEqual({
      fullName: "signup.err.fullName",
      phone: "signup.err.phone",
      cnic: "signup.err.cnic",
    });
    expect(validateIdentity({ ...buyer, phone: "" })).toEqual({});
  });

  test("buyer: business name is required except for individuals", () => {
    expect(validateBuyerAbout({ businessType: "restaurant", businessName: "" })).toEqual({ businessName: "signup.err.businessName" });
    expect(validateBuyerAbout({ businessType: "individual", businessName: "" })).toEqual({});
    expect(validateBuyerAbout({ businessType: "" })).toEqual({ businessType: "signup.err.businessType", businessName: "signup.err.businessName" });
  });

  test("farmer: farm, address and a pin inside Pakistan are required", () => {
    expect(validateFarmerFarm(farmer)).toEqual({});
    expect(validateFarmerFarm({ ...farmer, farmName: "", address: "", city: "", province: "Nowhere", lat: "51.5" })).toEqual({
      farmName: "signup.err.farmName",
      address: "signup.err.address",
      city: "signup.err.city",
      province: "signup.err.province",
      location: "signup.err.location",
    });
    expect(validateFarmerFarm({ ...farmer, landSizeAcres: "-3" }).landSizeAcres).toBe("signup.err.landSize");
    expect(validateFarmerFarm({ ...farmer, lat: "", lng: "" }).location).toBe("signup.err.location");
  });
});

describe("API payloads", () => {
  test("a buyer who is an individual sends their own name as the business name", () => {
    const built = buildBuyerOnboarding({ ...buyer, businessType: "individual", businessName: "" });
    expect(built).toEqual({
      ok: true,
      fullName: "Ayesha Khan",
      payload: { businessName: "Ayesha Khan", businessType: "individual", cnic: "35202-1234567-1", phone: "+923001234567" },
    });
  });

  test("a business buyer keeps the business name; the phone is E.164", () => {
    const built = buildBuyerOnboarding(buyer);
    expect(built.ok && built.payload).toEqual({ businessName: "Khan Traders", businessType: "retailer", cnic: "35202-1234567-1", phone: "+923001234567" });
  });

  test("the CNIC is always sent dashed, the phone only when given", () => {
    const built = buildFarmerOnboarding({ ...farmer, phone: "" });
    expect(built.ok && built.payload).toEqual({
      cnic: "35202-1234567-1",
      farmName: "Green Valley Farm",
      farmLocation: { address: "Chak 5, Canal Road", city: "Multan", province: "Punjab", lat: 30.1575, lng: 71.5249 },
      cropTypes: ["wheat"],
      landSizeAcres: 12.5,
    });
  });

  test("invalid drafts do not build", () => {
    expect(buildBuyerOnboarding({ ...buyer, cnic: "1" }).ok).toBe(false);
    expect(buildFarmerOnboarding({ ...farmer, lat: "" }).ok).toBe(false);
  });
});
