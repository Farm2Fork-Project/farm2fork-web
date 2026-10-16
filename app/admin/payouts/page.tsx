import AdminPageShell from '@/components/admin/screens/AdminPageShell';
import { EarningsScreen } from '@/components/delivery/EarningsScreen';
export default function Page() { return <AdminPageShell title="Transporter payouts" description="Reconcile delivery earnings and record money paid externally."><EarningsScreen admin /></AdminPageShell>; }
