import { describe, expect, test } from "vitest";
import {
  cnicDigits,
  displayPhone,
  formatCnic,
  isValidCnic,
  isValidEmail,
  isValidPhone,
  normalizePkPhone,
} from "./validation.ts";

describe("phone numbers", () => {
  test("every common way of writing a Pakistani mobile number becomes E.164", () => {
    for (const input of ["0300 1234567", "03001234567", "+92 300 1234567", "+92-300-1234567", "0092 300 1234567", "923001234567", "300 1234567", " (0300) 123-4567 "]) {
      expect(normalizePkPhone(input), input).toBe("+923001234567");
    }
  });

  test("things that are not a Pakistani number are rejected", () => {
    for (const input of ["", "abc", "0300", "030012345678901", "+1 415 555 2671", "00000000000"]) {
      expect(normalizePkPhone(input), input).toBeNull();
      expect(isValidPhone(input)).toBe(false);
    }
  });

  test("a stored E.164 number is shown readably", () => {
    expect(displayPhone("+923001234567")).toBe("+92 300 1234567");
    expect(displayPhone(undefined)).toBe("");
  });
});

describe("CNIC", () => {
  test("13 digits, with or without dashes", () => {
    expect(isValidCnic("35202-1234567-1")).toBe(true);
    expect(isValidCnic("3520212345671")).toBe(true);
    expect(isValidCnic("35202-1234567")).toBe(false);
    expect(isValidCnic("abcde-1234567-1")).toBe(false);
    expect(isValidCnic("")).toBe(false);
  });

  test("formats as the person types and caps at 13 digits", () => {
    expect(formatCnic("35202")).toBe("35202");
    expect(formatCnic("352021")).toBe("35202-1");
    expect(formatCnic("3520212345671")).toBe("35202-1234567-1");
    expect(formatCnic("35202-1234567-1999")).toBe("35202-1234567-1");
    expect(cnicDigits("35202-1234567-1")).toBe("3520212345671");
  });
});

test("email check", () => {
  expect(isValidEmail("a@b.co")).toBe(true);
  expect(isValidEmail(" a@b.co ")).toBe(true);
  expect(isValidEmail("a@b")).toBe(false);
  expect(isValidEmail("a b@c.com")).toBe(false);
});
