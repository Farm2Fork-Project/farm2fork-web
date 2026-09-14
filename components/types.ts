import type { ReactNode } from "react";
import type { RegisterBuyerRequest } from "@/lib/api/contracts.ts";

/* ───────── Shared Types ───────── */
export type AuthScreen = "landing" | "login" | "signup-role" | "signup-form" | "signup-transporter" | "verification";

export interface LandingScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export interface LoginScreenProps {
  onLogin: (email: string, password: string) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;
  onForgotPassword?: (email: string) => void | Promise<void>;
  onGoSignup: () => void;
  onBackHome?: () => void;
  loginError?: string;
  isSubmitting?: boolean;
}

export interface ProfileScreenProps {
  onLogout: () => void;
  signedInAs?: string;
  email?: string;
  avatarIcon?: ReactNode;
}

export interface SignUpFormScreenProps {
  onBack: () => void;
  onBackHome?: () => void;
  identityEmail?: string;
  onSubmit: (input: RegisterBuyerRequest) => Promise<void> | void;
}

export interface SignUpRoleScreenProps {
  onBack: () => void;
  onBackHome?: () => void;
  onSelectRole: (role: "buyer" | "farmer" | "transporter") => void;
}

/* ───────── Financial Partner Types ───────── */
export interface LoanApplication {
  id: string
  applicant: string
  farmName: string
  location: string
  amount: string
  term: string
  interestRate: string
  revenue: string
  creditScore: number
  dti: string
  riskProfile: 'Low' | 'Medium' | 'High'
  status: 'Ledger Pending' | 'Ledger Approved' | 'Ledger Rejected' | 'Ledger Needs Docs'
  /** ISO date the application entered the credit queue. */
  submittedAt?: string
}

export interface DashboardScreenProps {
  onSelectLoan: (id: string) => void
  onLogout: () => void
  onNavigateToSettings: () => void
}

export interface LoanDetailScreenProps {
  loanId: string
  onBack: () => void
  onNavigateToSettings: () => void
}

export interface SettingsScreenProps {
  onBackToQueue: () => void
  onLogout: () => void
}

export interface UserProfile {
  fullName: string
  email: string
  role: string
  currency: string
  defaultRepaymentTerm: string
  newAppAlerts: boolean
  weeklySummaryAlerts: boolean
  twoFactorAuth: boolean
}

export interface TopbarProps {
  currentView: 'queue' | 'settings' | 'detail'
  onNavigateToQueue: () => void
  onNavigateToSettings: () => void
  onLogout: () => void
  title?: string
  showSearch?: boolean
  searchQuery?: string
  onSearchChange?: (val: string) => void
  onBack?: () => void
  backLabel?: string
  userName?: string
  userRole?: string
}

export interface LogoutModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export interface FinancialLoginScreenProps {
  onLoginSuccess: () => void
}
