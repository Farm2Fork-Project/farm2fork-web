import AdminPageShell from "@/components/admin/screens/AdminPageShell";
import { ProductsScreen } from "@/components/admin/AdminContentOperations";
export default async function Page({searchParams}: {searchParams: Promise<{search?: string}>}) {
 const {search} = await searchParams;
  return (
    <AdminPageShell
      title="Product moderation"
      description="Inspect farmer listings and manage public visibility with a recorded reason."
    >
      <ProductsScreen initialQuery={{page: 1, search}} />
    </AdminPageShell>
  );
}
