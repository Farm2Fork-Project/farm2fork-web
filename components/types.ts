import type { RegisterBuyerRequest } from "@/lib/api/contracts.ts";

/* ───────── Shared Types ───────── */
export type AuthScreen = "landing" | "login" | "signup-role" | "signup-form" | "signup-transporter";
export type AppTab = "marketplace" | "scan" | "cart" | "orders" | "profile";

/* ───────── Product Data ───────── */
export const PRODUCTS = [
  { id: 1, name: "Desi Onions", farm: "Hassan Organic Farm", price: 60, unit: "kg", grade: "A", available: true },
  { id: 2, name: "Sindhri Mangoes", farm: "Sindh Mango Estate", price: 350, unit: "dozen", grade: "A", available: true },
  { id: 3, name: "Kinnow Oranges", farm: "Sindh Mango Estate", price: 150, unit: "kg", grade: "A", available: true },
  { id: 4, name: "Guava (Amrood)", farm: "Sindh Mango Estate", price: 100, unit: "kg", grade: "B", available: false },
  { id: 5, name: "Maize (Corn)", farm: "Punjab Grain Fields", price: 55, unit: "kg", grade: "A", available: true },
  { id: 6, name: "Fresh Doodh (Milk)", farm: "Green Dairy Valley", price: 180, unit: "litre", grade: "A", available: true },
  { id: 7, name: "Desi Ghee", farm: "Green Dairy Valley", price: 2200, unit: "kg", grade: "A", available: true },
  { id: 8, name: "Yoghurt (Dahi)", farm: "Green Dairy Valley", price: 160, unit: "kg", grade: "A", available: true },
];

export const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Dairy"];

export const TAB_TITLES: Record<AppTab, string> = {
  marketplace: "Marketplace",
  scan: "Trace",
  cart: "Your Cart",
  orders: "Orders",
  profile: "Profile",
};

export interface LandingScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export interface MarketplaceScreenProps {
  onViewProduct: (id: number) => void;
}

export interface ProductDetailScreenProps {
  productId: number;
  onBack: () => void;
}

export interface CartScreenProps {
  onShopNow: () => void;
}

export interface LoginScreenProps {
  onLogin: (email: string, password: string) => void | Promise<void>;
  onGoSignup: () => void;
  onBackHome?: () => void;
  loginError?: string;
  isSubmitting?: boolean;
}

export interface ProfileScreenProps {
  onLogout: () => void;
}

export interface SignUpFormScreenProps {
  onBack: () => void;
  onBackHome?: () => void;
  onSubmit: (input: RegisterBuyerRequest) => Promise<void> | void;
}

export interface SignUpRoleScreenProps {
  onBack: () => void;
  onBackHome?: () => void;
  onSelectRole: (role: string) => void;
}

export interface TopBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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
