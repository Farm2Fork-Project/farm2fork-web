import { describe, expect, test, vi } from "vitest";
import { ApiClient } from "../api/client.ts";
import { ApiError } from "../api/contracts.ts";
import { AccountRepository } from "./account-repository.ts";

const profile = { user: { id: "u1", email: "a@b.com", role: "buyer", isVerified: true, isActive: true, avatarUrl: "https://res.cloudinary.com/x/w_256,h_256/a" }, displayName: "A", profile: { kind: "buyer" } };

function repoWith(response: { status: number; body: unknown }) {
  const fetchFn = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(response.body), { status: response.status, headers: { "content-type": "application/json" } }),
  );
  const client = new ApiClient({ baseUrl: "http://api.test/api", fetchFn });
  return { repository: new AccountRepository({ client }), fetchFn };
}

describe("avatar upload", () => {
  test("sends the cropped JPEG as multipart field `file` with PUT, cookies and the CSRF header", async () => {
    const { repository, fetchFn } = repoWith({ status: 200, body: profile });
    const jpeg = new Blob(["jpeg-bytes"], { type: "image/jpeg" });

    const result = await repository.uploadAvatar(jpeg);

    expect(result.user.avatarUrl).toContain("cloudinary");
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("http://api.test/api/auth/me/avatar");
    expect(init.method).toBe("PUT");
    expect(init.credentials).toBe("include");
    expect(new Headers(init.headers).get("X-Farm2Fork-CSRF")).toBe("1");
    // The browser must set the multipart boundary itself.
    expect(new Headers(init.headers).get("Content-Type")).toBeNull();
    expect(init.body).toBeInstanceOf(FormData);
    const file = (init.body as FormData).get("file") as File;
    expect(file.type).toBe("image/jpeg");
    expect(file.name).toBe("avatar.jpg");
    expect(file.size).toBe(jpeg.size);
  });

  test("an API refusal surfaces as an ApiError with its status", async () => {
    const { repository } = repoWith({ status: 400, body: { message: "File must be a JPEG, PNG or WebP image" } });
    await expect(repository.uploadAvatar(new Blob(["x"]))).rejects.toMatchObject({ status: 400, message: "File must be a JPEG, PNG or WebP image" });
  });

  test("the rate limit comes back as 429", async () => {
    const { repository } = repoWith({ status: 429, body: { message: "Too Many Requests" } });
    await expect(repository.uploadAvatar(new Blob(["x"]))).rejects.toBeInstanceOf(ApiError);
  });

  test("removing the photo is a DELETE", async () => {
    const { repository, fetchFn } = repoWith({ status: 200, body: { ...profile, user: { ...profile.user, avatarUrl: undefined } } });
    const result = await repository.removeAvatar();
    expect(fetchFn.mock.calls[0][1].method).toBe("DELETE");
    expect(result.user.avatarUrl).toBeUndefined();
  });
});

describe("profile edits", () => {
  test("PATCH /auth/me/profile sends only the changed fields as JSON", async () => {
    const { repository, fetchFn } = repoWith({ status: 200, body: profile });
    await repository.updateProfile({ fullName: "Ayesha Khan", phone: "+923001234567" });
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("http://api.test/api/auth/me/profile");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ fullName: "Ayesha Khan", phone: "+923001234567" });
  });

  test("the farm location keeps its own endpoint", async () => {
    const { repository, fetchFn } = repoWith({ status: 200, body: { complete: true } });
    await repository.updateFarmLocation({ address: "a", city: "c", province: "Punjab", lat: 30, lng: 71 });
    expect(fetchFn.mock.calls[0][0]).toBe("http://api.test/api/farmers/me/farm-location");
    expect(fetchFn.mock.calls[0][1].method).toBe("PATCH");
  });
});
