/* ───────── Shared Types ───────── */
export type AuthScreen = "login" | "signup-role" | "signup-form";
export type AppTab = "shipments" | "scan" | "profile";

export const TAB_TITLES: Record<AppTab, string> = {
  shipments: "Shipments",
  scan: "Trace",
  profile: "Profile",
};

export interface LoginScreenProps {
  onLogin: () => void;
  onGoSignup: () => void;
}

export interface ProfileScreenProps {
  onLogout: () => void;
  email?: string;
}

export interface SignUpFormScreenProps {
  onBack: () => void;
  onSubmit: () => void;
}

export interface TopBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  email?: string;
}
