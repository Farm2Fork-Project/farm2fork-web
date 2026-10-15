import AdminPageShell from '@/components/admin/screens/AdminPageShell';
import { ConfigScreen } from '@/components/admin/AdminOperations';
export default function Page() {
 return <AdminPageShell title="System configuration" description="Manage supported pricing, dispatch, and loan settings."><ConfigScreen /></AdminPageShell>;
}
