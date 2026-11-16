import AdminPageShell from "@/components/admin/screens/AdminPageShell";
import { ReportsScreen } from "@/components/admin/AdminSupervision";
export default function Page() {
  return (
    <AdminPageShell
      title="Member reports"
      description="Posts, comments and reviews that members have flagged, most reported first."
    >
      <ReportsScreen />
    </AdminPageShell>
  );
}
