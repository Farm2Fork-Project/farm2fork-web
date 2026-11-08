import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import PrivateOrderDetails from "./PrivateOrderDetails";
vi.mock("@/components/auth/PortalGate", () => ({
  PortalGate: ({
    children,
  }: {
    children: (user: { id: string }) => React.ReactNode;
  }) => children({ id: "buyer" }),
}));
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
test("does not show private content when order access is denied", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 }),
      ),
  );
  render(
    <LanguageProvider eager>
      <PrivateOrderDetails orderId="6a2fe77bb77795516febc287" />
    </LanguageProvider>,
  );
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You do not have access to this order",
    ),
  );
  expect(screen.queryByText("Delivery address")).not.toBeInTheDocument();
});
