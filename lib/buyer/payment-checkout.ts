import type { InitiatePaymentResponse } from "../api/contracts.ts";

export type PaymentReturn = "complete" | "cancel";

export function paymentSimulatorEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_PAYMENT_SIMULATOR_ENABLED === "true"
  );
}

/** Only render HTTPS links on the checkout authorities configured by our backend. */
export function safepayCheckoutUrl(
  response: InitiatePaymentResponse,
): string | undefined {
  if (
    response.payment.gateway !== "safepay" ||
    response.payment.status !== "pending"
  )
    return undefined;
  try {
    const url = new URL(response.checkoutUrl ?? "");
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      ["sandbox.api.getsafepay.com", "getsafepay.com"].includes(url.hostname)
    ) {
      return url.href;
    }
  } catch {
    /* An absent or malformed URL cannot be opened. */
  }
  throw new Error(
    "Safepay did not provide a usable checkout link. Continue payment from Orders to retry.",
  );
}
