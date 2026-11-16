import AdminPageShell from "@/components/admin/screens/AdminPageShell";
import { ReviewsScreen } from "@/components/admin/AdminSupervision";
export default function Page() {
  return (
    <AdminPageShell
      title="Buyer reviews"
      description="Ratings buyers left after delivered orders. Hide a review only when it breaks the rules."
    >
      <ReviewsScreen />
    </AdminPageShell>
  );
}
