/* ───────── Shared Types ───────── */
export type AuthScreen = "login" | "signup-role" | "signup-form";
export type AppTab = "shipments" | "scan" | "profile";

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
  shipments: "Shipments",
  scan: "Trace",
  profile: "Profile",
};

export interface MarketplaceScreenProps {
  onViewProduct: (id: number) => void;
}

export interface ProductDetailScreenProps {
  onBack: () => void;
}

export interface CartScreenProps {
  onShopNow: () => void;
}

export interface LoginScreenProps {
  onLogin: () => void;
  onGoSignup: () => void;
}

export interface ProfileScreenProps {
  onLogout: () => void;
}

export interface SignUpFormScreenProps {
  onBack: () => void;
  onSubmit: () => void;
}

export interface SignUpRoleScreenProps {
  onBack: () => void;
  onSelectRole: (role: string) => void;
}

export interface TopBarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}
