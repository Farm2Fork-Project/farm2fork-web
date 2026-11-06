import { LanguageProvider } from "@/components/LanguageContext";
import PrivateOrderDetails from "@/components/orders/PrivateOrderDetails";
import TracePageShell from "@/components/trace/TracePageShell";

export const metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <LanguageProvider>
      <TracePageShell>
        <PrivateOrderDetails orderId={id} />
      </TracePageShell>
    </LanguageProvider>
  );
}
