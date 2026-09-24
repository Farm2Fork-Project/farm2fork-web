"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Tractor,
  ShoppingBag,
  PlusCircle,
  Rss,
  User,
  Search,
  Bell,
  CheckCircle,
  X,
  Menu,
  FileText,
  QrCode,
} from "lucide-react";
import FarmerListings, { Listing } from "./FarmerListings";
import CreateListingForm from "./CreateListingForm";
import FarmLocationPrompt from "./FarmLocationPrompt";
import FarmerOrders from "./FarmerOrders";
import FarmFeed from "./FarmFeed";
import NotificationBell from "@/components/NotificationBell";
import FarmerProfile from "../ProfileScreen";
import ScanScreen from "../ScanScreen";
import { useLanguage } from "./LanguageContext";
import { LuLeaf, LuUser } from "react-icons/lu";
import { ApiClient } from "@/lib/api/client.ts";
import type {
  ApiFarmerSummary,
  ApiOrder,
  ApiProduct,
  CreateFarmerProductRequest,
} from "@/lib/api/contracts.ts";
import { FarmerRepository } from "@/lib/farmer/farmer-repository.ts";

type TabType = "listings" | "create" | "orders" | "feed" | "scan" | "profile";

export default function FarmerDashboard({
  email,
  userId,
  onLogout,
}: {
  email?: string;
  userId?: string;
  onLogout?: () => void;
}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("listings");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [farm, setFarm] = useState<ApiFarmerSummary | null>(null);
  const [listingError, setListingError] = useState("");
  const repository = useMemo(
    () => new FarmerRepository({ client: new ApiClient() }),
    [],
  );

  useEffect(() => {
    let active = true;
    repository.listMyProducts()
      .then((response) => {
        if (active) {
          setListings(response.data.map(toListing));
          // Every product carries its farm's public identity (same farmer).
          setFarm(response.data.find((p) => p.farmer)?.farmer ?? null);
        }
      })
      .catch((error) => {
        if (active) {
          setListingError(error instanceof Error ? error.message : "Could not load your listings.");
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    let active = true;

    repository
      .listOrders()
      .then((response) => {
        if (!active) return;
        setOrdersError("");
        setOrders(response.data);
      })
      .catch((error: unknown) => {
        if (active) {
          setOrdersError(
            error instanceof Error ? error.message : "Could not load your orders.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, repository]);

  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [ordersError, setOrdersError] = useState("");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Listing Handlers - persisted through the API; the UI only changes (and
  // only reports success) after the backend confirms.
  const handleDeleteListing = async (id: string) => {
    try {
      await repository.deleteProduct(id);
      setListings((current) => current.filter((item) => item.id !== id));
      showToast(t("farmer.toast.deleteSuccess"));
    } catch {
      showToast(t("farmer.toast.actionFailed"));
    }
  };

  const handleToggleListingStatus = async (id: string) => {
    const item = listings.find((l) => l.id === id);
    if (!item) return;
    const next = item.status === "Available" ? "inactive" : "active";
    try {
      const updated = toListing(await repository.updateProductStatus(id, next));
      setListings((current) =>
        current.map((listing) => (listing.id === id ? updated : listing)),
      );
      showToast(t("farmer.toast.statusUpdate").replace("{status}", updated.status));
    } catch {
      showToast(t("farmer.toast.actionFailed"));
    }
  };

  const handleCreateListing = async (listingData: CreateFarmerProductRequest) => {
    const created = await repository.createProduct(listingData);
    if (created.farmer) setFarm(created.farmer);
    setListings((current) => [toListing(created), ...current]);
    setActiveTab("listings");
    showToast(t("farmer.toast.createSuccess"));
  };


  return (
    <div className="app-shell" dir={language === "ur" ? "rtl" : "ltr"}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-alert">
          <div className="toast-alert-icon">
            <CheckCircle size={18} />
          </div>
          <span className="toast-alert-message">{toastMessage}</span>
          <button className="toast-alert-close" onClick={() => setToastMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}
      {listingError ? <div className="auth-error" role="alert">{listingError}</div> : null}

      <div className="app-main">
        {/* Unified TopBar Navigation matching buyer/transporter layout */}
        <header className="topbar">
          <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="topbar-menu-btn"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-dark)"
              }}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-logo">
              <LuLeaf size={24} className="logo-icon" />
              <h2>{language === "ur" ? "فارم ٹو فورک" : "Farm2Fork"}</h2>
            </div>
          </div>

          <nav className="topbar-nav">
            <a
              href="#"
              className={`topbar-link${activeTab === "listings" ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActiveTab("listings"); }}
            >
              <span className="icon"><Tractor size={18} /></span>
              <span className="label">{t("farmer.tab.listings")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "create" ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActiveTab("create"); }}
            >
              <span className="icon"><PlusCircle size={18} /></span>
              <span className="label">{t("farmer.tab.create")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "orders" ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActiveTab("orders"); }}
            >
              <span className="icon"><ShoppingBag size={18} /></span>
              <span className="label">{t("farmer.tab.orders")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "feed" ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActiveTab("feed"); }}
            >
              <span className="icon"><Rss size={18} /></span>
              <span className="label">{t("farmer.tab.feed")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "scan" ? " active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActiveTab("scan"); }}
            >
              <span className="icon"><QrCode size={18} /></span>
              <span className="label">{t("farmer.tab.scan")}</span>
            </a>
            </nav>

          <div className="topbar-right">
            <NotificationBell />

            {/* User Profile Card */}
            <div 
              className="topbar-user" 
              onClick={() => setActiveTab("profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="topbar-avatar" style={{ background: "linear-gradient(135deg, var(--primary-green), #14492a)", color: "white", fontWeight: "bold" }}>F</div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{t("signupRole.farmerRole")}</span>
                <span className="topbar-user-role">{email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-100 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              style={{ zIndex: 100 }}
            />
            <aside
              className="fixed top-0 bottom-0 left-0 w-64 bg-white z-110 shadow-xl border-r border-gray-100 flex flex-col p-6 transition-transform duration-300 md:hidden"
              style={{ zIndex: 110 }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2 font-bold text-base text-[var(--primary-green)]">
                  <Tractor size={20} />
                  <span>{language === "ur" ? "فارم ٹو فورک" : "Farm2Fork"}</span>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5 flex-1">
                <button
                  onClick={() => {
                    setActiveTab("listings");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${activeTab === "listings"
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Tractor size={16} />
                  <span>{t("farmer.listings.title")}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("create");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${activeTab === "create"
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <PlusCircle size={16} />
                  <span>{t("farmer.tab.create")}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("orders");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${activeTab === "orders"
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <ShoppingBag size={16} />
                  <span>{t("farmer.tab.orders")}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("feed");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${activeTab === "feed"
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Rss size={16} />
                  <span>{t("farmer.tab.feed")}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("scan");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${activeTab === "scan"
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <QrCode size={16} />
                  <span>{t("farmer.tab.scan")}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${activeTab === "profile"
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <User size={16} />
                  <span>{t("farmer.tab.profile")}</span>
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main Page Content Wrapper matching buyer/transporter app-content */}
        <main className="app-content">
          {activeTab === "listings" && <FarmLocationPrompt client={repository} />}
          {activeTab === "listings" && (
            <FarmerListings
              listings={listings}
              farm={farm}
              onDelete={handleDeleteListing}
              onToggleStatus={handleToggleListingStatus}
              onAddClick={() => setActiveTab("create")}
            />
          )}

          {activeTab === "create" && (
            <CreateListingForm
              aiClient={repository}
              onSubmit={handleCreateListing}
              onCancel={() => setActiveTab("listings")}
            />
          )}

          {activeTab === "orders" && (
            ordersError ? <p role="alert">{ordersError}</p> : orders ? <FarmerOrders orders={orders} /> : <p>Loading orders…</p>
          )}

          {activeTab === "feed" && <FarmFeed currentUserId={userId} />}

          {activeTab === "scan" && <ScanScreen />}

          {activeTab === "profile" && (
            <FarmerProfile
              email={email}
              avatarIcon={<LuUser size={28} />}
              signedInAs={t("settings.sidebar.signedInFarmer")}
              onLogout={() => {
                if (onLogout) onLogout();
                else console.log("Logout");
              }}
            />
          )}
        </main>


      </div>
    </div>
  );
}

function toListing(product: ApiProduct): Listing {
  return {
    id: product.id,
    name: product.name,
    category: product.category.charAt(0).toUpperCase() + product.category.slice(1),
    grade: product.qualityGrade ?? "A",
    description: product.description ?? "",
    price: product.price,
    unit: product.unit,
    quantity: product.quantity,
    status: product.status === "active" ? "Available" : "Out of Stock",
    ledger: product.originLedgerStatus ?? "missing",
  };
}
