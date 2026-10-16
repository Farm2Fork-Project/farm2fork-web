/* ───────── Shared Types ───────── */
export type AuthScreen = "login" | "signup-role" | "signup-form";
export type AppTab = "shipments" | "scan" | "profile" | "earnings";

export const TAB_TITLES: Record<AppTab, string> = {
  shipments: "Shipments",
  earnings: "Earnings",
  scan: "Trace",
  profile: "Profile",
};

export interface SignUpFormScreenProps {
  onBack: () => void;
  onSubmit: () => void;
}

export interface TopBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  email?: string;
}
