import AdminPageShell from '@/components/admin/screens/AdminPageShell';
import { UsersScreen } from '@/components/admin/AdminOperations';
export default async function Page({searchParams}: {searchParams: Promise<{userId?: string}>}) {
 const {userId} = await searchParams;
 return <AdminPageShell title="User management" description="Find accounts and manage access with an audit trail."><UsersScreen initialUserId={userId} /></AdminPageShell>;
}
