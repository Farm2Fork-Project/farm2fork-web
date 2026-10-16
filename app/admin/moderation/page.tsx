import AdminPageShell from "@/components/admin/screens/AdminPageShell";
import { ModerationScreen } from "@/components/admin/AdminContentOperations";
export default function Page() {
  return (
    <AdminPageShell
      title="Community moderation"
      description="Review actual community content and its visibility history."
    >
      <ModerationScreen />
    </AdminPageShell>
  );
}
