"use client";

import React, { useState, useEffect } from "react";
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
import FarmerOrders, { Order } from "./FarmerOrders";
import FarmFeed from "./FarmFeed";
import FarmerProfile from "./ProfileScreen";
import { useLanguage } from "./LanguageContext";
import { LuLeaf } from "react-icons/lu";

type TabType = "listings" | "create" | "orders" | "feed" | "profile";

export default function FarmerDashboard({ onLogout }: { onLogout?: () => void }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("listings");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Shared Listings State
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("farmer_listings");
      if (saved) {
        try {
          setListings(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        const initialListings = [
          {
            id: "list_1",
            name: "Organic Tomatoes",
            category: "Vegetables",
            grade: "A",
            price: 120,
            unit: "kg",
            quantity: 200.0,
            status: "Available" as const,
            description: "Fresh organic tomatoes harvested directly from Hassan Organic Farm in Multan. Grade A quality, perfectly ripe and juicy, excellent for cooking or salads.",
          },
          {
            id: "list_2",
            name: "Fresh Spinach",
            category: "Vegetables",
            grade: "A",
            price: 80,
            unit: "kg",
            quantity: 150.0,
            status: "Available" as const,
            description: "Organic spinach greens, handpicked early in the morning. Packed with nutrients and vitamins, washed and cleaned.",
          },
          {
            id: "list_3",
            name: "Desi Onions",
            category: "Vegetables",
            grade: "B",
            price: 60,
            unit: "kg",
            quantity: 500.0,
            status: "Available" as const,
            description: "Locally sourced Desi Onions, cured and dried to perfection for extended shelf life. Uniform size and strong flavor profile.",
          },
        ];
        setListings(initialListings);
        localStorage.setItem("farmer_listings", JSON.stringify(initialListings));
      }
    }
  }, []);

  const updateListings = (newListings: Listing[]) => {
    setListings(newListings);
    localStorage.setItem("farmer_listings", JSON.stringify(newListings));
  };

  // Shared Orders State
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ord_1001",
      date: "4/6/2026",
      status: "Processing",
      customerName: "Muhammad Ali",
      items: [
        { name: "Organic Tomatoes", quantity: 10.0, price: 120, unit: "kg" },
        { name: "Fresh Spinach", quantity: 5.0, price: 80, unit: "kg" },
      ],
      subtotal: 1600,
      platformFee: 80,
      grandTotal: 1680,
      address: "Building 14B, Gulberg III, Lahore, Punjab",
    },
    {
      id: "ord_1002",
      date: "5/6/2026",
      status: "Processing",
      customerName: "Ayesha Ahmed",
      items: [
        { name: "Organic Tomatoes", quantity: 5.0, price: 120, unit: "kg" },
      ],
      subtotal: 600,
      platformFee: 30,
      grandTotal: 630,
      address: "Sector F-7, Islamabad",
    },
    {
      id: "ord_1000",
      date: "1/6/2026",
      status: "Completed",
      customerName: "Sana Khan",
      items: [
        { name: "Desi Onions", quantity: 20.0, price: 60, unit: "kg" },
      ],
      subtotal: 1200,
      platformFee: 60,
      grandTotal: 1260,
      address: "House 34A, Block C, Phase 5 DHA, Lahore",
    },
  ]);

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
    const updated = listings.filter((item) => item.id !== id);
    updateListings(updated);
    showToast(t("farmer.toast.deleteSuccess"));
  };

  const handleToggleListingStatus = (id: string) => {
    const updated = listings.map((item) =>
      item.id === id
        ? { ...item, status: (item.status === "Available" ? "Out of Stock" : "Available") as any }
        : item
    );
    updateListings(updated);
    const item = listings.find((l) => l.id === id);
    const newStatus = item?.status === "Available" ? "Out of Stock" : "Available";
    showToast(t("farmer.toast.statusUpdate").replace("{status}", newStatus));
  };

  const handleCreateListing = (listingData: {
    name: string;
    category: string;
    grade: string;
    description: string;
    price: number;
    unit: string;
    quantity: number;
  }) => {
    const newListing: Listing = {
      id: `list_${Date.now()}`,
      name: listingData.name,
      category: listingData.category,
      grade: listingData.grade,
      description: listingData.description,
      price: listingData.price,
      unit: listingData.unit,
      quantity: listingData.quantity,
      status: "Available",
    };
    const updated = [newListing, ...listings];
    updateListings(updated);
    setActiveTab("listings");
    showToast(t("farmer.toast.createSuccess"));
  };

  // Order Handlers
  const handleCompleteOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: "Completed" } : ord))
    );
    showToast(t("farmer.toast.orderCompleted").replace("{id}", id));
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === id ? { ...ord, status: "Cancelled" } : ord))
    );
    showToast(t("farmer.toast.orderCancelled").replace("{id}", id));
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

      <div className="app-main">
        {/* Unified TopBar Navigation matching buyer/transporter layout */}
        <header className="topbar">
          <div className="topbar-left">
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
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Notifications</h4>
                    <span 
                      onClick={() => {
                        markNotificationsRead();
                        setNotificationsOpen(false);
                      }} 
                      style={{ fontSize: "13px", color: "var(--primary-green)", cursor: "pointer", fontWeight: 500 }}
                    >
                      Mark all as read
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
                            <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>{idx === 0 ? "New Order" : "Quality Approved"}</strong>
                            {!n.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-green)", marginTop: "4px" }}></span>}
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>{n.text}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>{n.time}</div>
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
            <FarmerOrders
              orders={orders}
              onCompleteOrder={handleCompleteOrder}
              onCancelOrder={handleCancelOrder}
            />
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
