import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderQr } from "./OrderQr";
import { ApiError } from "@/lib/api/contracts";
const getOrderQr = vi.hoisted(() => vi.fn());
vi.mock("@/lib/trace/trace-repository", () => ({
  TraceRepository: class {
    getOrderQr = getOrderQr;
  },
}));
vi.mock("../LanguageContext", () => ({
  useLanguage: () => ({ language: "en" }),
}));
beforeEach(() => {
  getOrderQr.mockReset();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
});
afterEach(cleanup);
describe("paid order label", () => {
  it("generates nothing for hidden or unopened actions", () => {
    const { rerender } = render(<OrderQr eligible={false} orderId="id" />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<OrderQr eligible orderId="id" />);
    expect(getOrderQr).not.toHaveBeenCalled();
  });
  it("loads only on demand and retries failures", async () => {
    getOrderQr
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        orderId: "id",
        qrCode: "https://farm2fork.tech/trace/orders/id",
        qrImageDataUri: "data:image/png;base64,abc",
      });
    render(<OrderQr eligible orderId="id" />);
    fireEvent.click(screen.getByText("Order QR label"));
    await screen.findByText("Retry");
    fireEvent.click(screen.getByText("Retry"));
    await screen.findByText("View journey");
    expect(getOrderQr).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Download PNG")).toHaveAttribute(
      "download",
      "farm2fork-order-id.png",
    );
    fireEvent.click(screen.getByText("Close"));
    await waitFor(() => expect(screen.queryByText("View journey")).toBeNull());
  });
  it("preserves the exact order when QR access requires sign-in", async () => {
    getOrderQr.mockRejectedValue(new ApiError(401, "Expired"));
    render(<OrderQr eligible orderId="id" />);
    fireEvent.click(screen.getByText("Order QR label"));
    const signIn = await screen.findByRole("link", { name: "Sign in" });
    expect(signIn).toHaveAttribute("href", "/login?next=%2Forders%2Fid");
  });
});
