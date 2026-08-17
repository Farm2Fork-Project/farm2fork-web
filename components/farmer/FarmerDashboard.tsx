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
} from "lucide-react";
import FarmerListings, { Listing } from "./FarmerListings";
import CreateListingForm from "./CreateListingForm";
import FarmerOrders from "./FarmerOrders";
import FarmFeed from "./FarmFeed";
import FarmerProfile from "./ProfileScreen";
import { useLanguage } from "./LanguageContext";
import { LuLeaf } from "react-icons/lu";
import { ApiClient } from "@/lib/api/client.ts";
import type {
  ApiOrder,
  ApiProduct,
  CreateFarmerProductRequest,
} from "@/lib/api/contracts.ts";
import { FarmerRepository } from "@/lib/farmer/farmer-repository.ts";

type TabType = "listings" | "create" | "orders" | "feed" | "profile";

export default function FarmerDashboard({ onLogout }: { onLogout?: () => void }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("listings");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingError, setListingError] = useState("");
  const repository = useMemo(
    () => new FarmerRepository({ client: new ApiClient() }),
    [],
  );

  useEffect(() => {
    let active = true;
    repository.listMyProducts()
      .then((response) => {
        if (active) setListings(response.data.map(toListing));
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

  // Notifications bell state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "n_1", text: "New Order #ord_1001 received from Muhammad Ali", time: "2 hrs ago", read: false },
    { id: "n_2", text: "Quality Grade check for Desi Onions approved", time: "1 day ago", read: true },
  ]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Listing Handlers
  const handleDeleteListing = (id: string) => {
    setListings((current) => current.filter((item) => item.id !== id));
    showToast(t("farmer.toast.deleteSuccess"));
  };

  const handleToggleListingStatus = (id: string) => {
    setListings((current) => current.map((item) =>
      item.id === id
        ? { ...item, status: (item.status === "Available" ? "Out of Stock" : "Available") as any }
        : item
    ));
    const item = listings.find((l) => l.id === id);
    const newStatus = item?.status === "Available" ? "Out of Stock" : "Available";
    showToast(t("farmer.toast.statusUpdate").replace("{status}", newStatus));
  };

  const handleCreateListing = async (listingData: CreateFarmerProductRequest) => {
    const created = await repository.createProduct(listingData);
    setListings((current) => [toListing(created), ...current]);
    setActiveTab("listings");
    showToast(t("farmer.toast.createSuccess"));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
            </nav>

          <div className="topbar-right">
            {/* Notification bell and dropdown */}
            <div className="relative" style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) markNotificationsRead();
                }}
                className="topbar-icon-btn"
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadNotificationsCount > 0 && (
                  <span className="badge-dot" />
                )}
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "12px",
                  backgroundColor: "var(--white)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  width: "360px",
                  zIndex: 150,
                  padding: "16px",
                  color: "var(--text-main)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{language === "ur" ? "اطلاعات" : "Notifications"}</h4>
                    <span 
                      onClick={() => {
                        markNotificationsRead();
                        setNotificationsOpen(false);
                      }} 
                      style={{ fontSize: "13px", color: "var(--primary-green)", cursor: "pointer", fontWeight: 500 }}
                    >
                      {language === "ur" ? "سب کو پڑھا ہوا نشان زد کریں" : "Mark all as read"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "350px", overflowY: "auto", margin: "0 -8px" }}>
                    
                    {notifications.map((n, idx) => (
                      <div key={n.id} style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", background: n.read ? "transparent" : "rgba(34, 197, 94, 0.05)", cursor: "pointer" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: idx === 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: idx === 0 ? "var(--primary-green)" : "#3b82f6", flexShrink: 0 }}>
                          {idx === 0 ? <ShoppingBag size={20} /> : <CheckCircle size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>
                              {idx === 0 
                                ? (language === "ur" ? "نیا آرڈر" : "New Order") 
                                : (language === "ur" ? "معیار کی منظوری" : "Quality Approved")}
                            </strong>
                            {!n.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-green)", marginTop: "4px" }}></span>}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                            {language === "ur" 
                              ? n.text.replace("New Order", "نیا آرڈر").replace("received from", "موصول ہوا از").replace("Quality Grade check for", "معیار کی جانچ برائے").replace("approved", "منظور شدہ")
                              : n.text}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>
                            {language === "ur"
                              ? n.time.replace("hrs ago", "گھنٹے پہلے").replace("day ago", "دن پہلے")
                              : n.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* User Profile Card */}
            <div 
              className="topbar-user" 
              onClick={() => setActiveTab("profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="topbar-avatar" style={{ background: "linear-gradient(135deg, var(--primary-green), #14492a)", color: "white", fontWeight: "bold" }}>F</div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{t("signupRole.farmerRole")}</span>
                <span className="topbar-user-role">farmer@test.com</span>
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
          {activeTab === "listings" && (
            <FarmerListings
              listings={listings}
              onDelete={handleDeleteListing}
              onToggleStatus={handleToggleListingStatus}
              onAddClick={() => setActiveTab("create")}
            />
          )}

          {activeTab === "create" && (
            <CreateListingForm
              onSubmit={handleCreateListing}
              onCancel={() => setActiveTab("listings")}
            />
          )}

          {activeTab === "orders" && (
            ordersError ? <p role="alert">{ordersError}</p> : orders ? <FarmerOrders orders={orders} /> : <p>Loading orders…</p>
          )}

          {activeTab === "feed" && <FarmFeed />}

          {activeTab === "profile" && <FarmerProfile onLogout={() => {
            if (onLogout) onLogout();
            else console.log("Logout");
          }} />}
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
  };
}
