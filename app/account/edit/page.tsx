"use client";

import { EditProfileView } from "@/components/account/EditProfileView";
import { PortalGate } from "@/components/auth/PortalGate";

export default function EditAccountPage() {
  return <PortalGate role={null}>{() => <EditProfileView />}</PortalGate>;
}
