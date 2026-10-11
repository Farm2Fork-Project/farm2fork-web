import { redirect } from "next/navigation";
import { MobilePaymentReturn } from "@/components/buyer/MobilePaymentReturn";

export default async function PaymentReturnPage({ searchParams }: {
  searchParams: Promise<{ mobileOrderId?: string | string[] }>;
}) {
  const { mobileOrderId } = await searchParams;
  if (typeof mobileOrderId === "string" && /^[a-fA-F0-9]{24}$/.test(mobileOrderId)) {
    return <MobilePaymentReturn orderId={mobileOrderId} result="complete" />;
  }
  redirect("/?payment_return=complete");
}
