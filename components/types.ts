import type { ReactNode } from "react";

/* ───────── Shared Types ───────── */
export interface LandingScreenProps {
  /** Set when a non-buyer is signed in: the header then links to their portal instead of sign in. */
  portalHref?: string;
  /** Server-rendered, English-only content shown between the people and final CTA sections. */
  seoContent?: ReactNode;
  /** Server-rendered footer with links to every public page. Replaces the built-in footer. */
  footerContent?: ReactNode;
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

/* ───────── Financial Partner Types ───────── */
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
