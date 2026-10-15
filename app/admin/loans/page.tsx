import AdminPageShell from "@/components/admin/screens/AdminPageShell";
import { LoansScreen } from "@/components/admin/AdminContentOperations";
export default function Page() {
  return (
    <AdminPageShell
      title="Loan applications"
      description="Review applications, private documents and recorded repayments."
    >
      <LoansScreen />
    </AdminPageShell>
  );
}
