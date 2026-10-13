// Each role signs in on its own page. When an account reaches the wrong one,
// say where its portal is instead of only saying it is not allowed here.
const PORTALS: Record<string, { label: string; where: string }> = {
  buyer: { label: "buyer", where: "Sign in on the home page" },
  farmer: { label: "farmer", where: "Sign in at /farmer" },
  transporter: { label: "transporter", where: "Sign in at /transporter" },
  financial_partner: { label: "financial partner", where: "Sign in at /financial" },
  admin: { label: "admin", where: "Sign in at /admin/login" },
};

export function wrongRoleMessage(expectedRole: string, actualRole?: string): string {
  const portal = actualRole ? PORTALS[actualRole] : undefined;
  if (!portal || actualRole === expectedRole) {
    return `This account cannot access the ${expectedRole} application.`;
  }
  return `This is a ${portal.label} account. ${portal.where} instead.`;
}
