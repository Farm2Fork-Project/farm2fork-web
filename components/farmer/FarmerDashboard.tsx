"use client";

import React, { useState } from "react";
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
  const [listings, setListings] = useState<Listing[]>([
    {
      id: "list_1",
      name: "Organic Tomatoes",
      category: "Vegetables",
      grade: "A",
      price: 120,
      unit: "kg",
      quantity: 200.0,
      status: "Available",
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
      status: "Available",
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
      status: "Available",
      description: "Locally sourced Desi Onions, cured and dried to perfection for extended shelf life. Uniform size and strong flavor profile.",
    },
  ]);

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
    setListings((prev) => prev.filter((item) => item.id !== id));
    showToast(t("farmer.toast.deleteSuccess"));
  };

  const handleToggleListingStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Available" ? "Out of Stock" : "Available" }
          : item
      )
    );
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
    setListings([newListing, ...listings]);
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
        <div className="fixed top-20 right-5 z-200 bg-emerald-800 text-white py-3 px-5 rounded-lg shadow-lg flex items-center gap-2.5 animate-in">
          <CheckCircle size={18} className="text-emerald-300" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button className="text-emerald-200 hover:text-white" onClick={() => setToastMessage(null)}>
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
            {/* Search Trigger */}
            <button className="topbar-icon-btn md:block hidden" aria-label="Search" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Search size={18} />
            </button>

            {/* Notification bell and dropdown */}
            <div className="relative" style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) markNotificationsRead();
                }}
                className="topbar-icon-btn"
                aria-label="Notifications"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="badge-dot" />
                )}
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-72 bg-white rounded-xl shadow-lg border border-[var(--surface-medium)] p-3 z-150 animate-in" style={{ zIndex: 150, right: 0 }}>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                    <span className="text-xs font-bold text-gray-800">Notifications</span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${n.read ? "bg-white text-gray-600" : "bg-emerald-50 text-emerald-950 font-semibold"
                          }`}
                      >
                        <p>{n.text}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block font-medium">{n.time}</span>
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
