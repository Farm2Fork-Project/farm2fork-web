import AdminPageShell from '@/components/admin/screens/AdminPageShell';
import { DashboardScreen } from '@/components/admin/AdminOperations';
export default function Page() {
 return <AdminPageShell title="Dashboard" description="Platform totals, delivery operations, and recent activity."><DashboardScreen /></AdminPageShell>;
}
