import AdminPageShell from '@/components/admin/screens/AdminPageShell';
import { OrdersScreen } from '@/components/admin/AdminContentOperations';
export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; assignment?: string; search?: string; deliveryIssue?: string }> }) {
 const query = await searchParams;
 return <AdminPageShell title="Orders" description="Inspect real orders, payment state and delivery history."><OrdersScreen initialQuery={{ page: 1, deliveryIssue: ['active','unresolved','resolved'].includes(query.deliveryIssue ?? '') ? query.deliveryIssue as 'active' | 'unresolved' | 'resolved' : undefined, status: query.status, search: query.search, assignment: query.assignment === 'assigned' || query.assignment === 'unassigned' ? query.assignment : undefined }} /></AdminPageShell>;
}
