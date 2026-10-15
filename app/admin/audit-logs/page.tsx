import AdminPageShell from '@/components/admin/screens/AdminPageShell';
import { AuditScreen } from '@/components/admin/AdminOperations';
export default function Page() {
 return <AdminPageShell title="Audit history" description="Inspect recorded platform actions and permitted changes."><AuditScreen /></AdminPageShell>;
}
