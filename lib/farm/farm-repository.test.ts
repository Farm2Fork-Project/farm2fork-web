import { expect, it, vi } from "vitest";
import { FarmRepository } from "./farm-repository.ts";

it("reads the public farm profile for a farmer id", async () => {
  const request = vi.fn().mockResolvedValue({ farmName: "Green Valley Farm" });
  const repository = new FarmRepository({ client: { request } });

  await repository.getFarmProfile("6a2fe77bb77795516febc111");

  expect(request).toHaveBeenCalledWith(
    "/farmers/6a2fe77bb77795516febc111/public",
  );
});
