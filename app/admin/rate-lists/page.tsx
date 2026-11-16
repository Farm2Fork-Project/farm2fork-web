import AdminPageShell from "@/components/admin/screens/AdminPageShell";
import { RateListsScreen } from "@/components/admin/AdminSupervision";
export default function Page() {
  return (
    <AdminPageShell
      title="Market rate lists"
      description="Upload each dated official rate list, check it, then publish it to farmers and buyers."
    >
      <RateListsScreen />
    </AdminPageShell>
  );
}
