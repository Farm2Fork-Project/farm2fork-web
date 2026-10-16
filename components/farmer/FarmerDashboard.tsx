"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import FarmerListings, { Listing } from "./FarmerListings";
import CreateListingForm from "./CreateListingForm";
import { FarmPickupLocation } from "./FarmPickupLocation";
import FarmerOrders from "./FarmerOrders";
import FarmFeed from "./FarmFeed";
import FarmerLoans from "./FarmerLoans";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import { Avatar } from "../account/Avatar";
import ScanScreen from "../ScanScreen";
import { useLanguage } from "./LanguageContext";
import { ApiClient } from "@/lib/api/client.ts";
import type {
  ApiAuthUser,
  ApiFarmerSummary,
  ApiOrder,
  ApiShipment,
  ApiProduct,
  CreateFarmerProductRequest,
} from "@/lib/api/contracts.ts";
import { FarmerRepository } from "@/lib/farmer/farmer-repository.ts";
import {
  IcBag as ShoppingBag,
  IcCheckCircle as CheckCircle,
  IcClose as X,
  IcFeed as Rss,
  IcLeaf,
  IcMenu as Menu,
  IcPlusCircle as PlusCircle,
  IcQr as QrCode,
  IcTractor as Tractor,
  IcUser as User,
} from "@/components/icons";

type TabType = "listings" | "create" | "orders" | "feed" | "scan" | "loans";

export default function FarmerDashboard({
  email,
  user,
}: {
  email?: string;
  user?: ApiAuthUser;
}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("listings");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [farm, setFarm] = useState<ApiFarmerSummary | null>(null);
  const [formDirty, setFormDirty] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const mutationRef = useRef(false);
  const [actionError, setActionError] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  const [listingError, setListingError] = useState("");
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [shipments, setShipments] = useState<ApiShipment[]>([]);
  const [shipmentError, setShipmentError] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const repository = useMemo(
    () => new FarmerRepository({ client: new ApiClient() }),
    [],
  );

  useEffect(() => {
    let active = true;
    setListingsLoading(true);
    setListingError("");
    repository
      .listMyProducts()
      .then((response) => {
        if (active) {
          setListings(response.data.map(toListing));
          // Every product carries its farm's public identity (same farmer).
          setFarm(response.data.find((p) => p.farmer)?.farmer ?? null);
        }
      })
      .catch((error) => {
        if (active) {
          setListingError(
            error instanceof Error
              ? error.message
              : "Could not load your listings.",
          );
        }
      })
      .finally(() => {
        if (active) setListingsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [repository, reload]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    let active = true;

    setOrdersLoading(true);
    Promise.allSettled([repository.listOrders(), repository.listShipments()])
      .then(([orderResult, shipmentResult]) => {
        if (!active) return;
        if (orderResult.status === "fulfilled") {
          setOrders(orderResult.value.data);
          setOrdersError("");
        } else
          setOrdersError(
            orderResult.reason instanceof Error
              ? orderResult.reason.message
              : "Could not load your orders.",
          );
        if (shipmentResult.status === "fulfilled") {
          setShipments(shipmentResult.value);
          setShipmentError(false);
        } else setShipmentError(true);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeTab, repository, reload]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 4000);
  };

  // Listing Handlers - persisted through the API; the UI only changes (and
  // only reports success) after the backend confirms.
  const handleDeleteListing = async (id: string) => {
    if (mutationRef.current) return;
    mutationRef.current = true;
    setBusyId(id);
    setActionError("");
    try {
      await repository.deleteProduct(id);
      setListings((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "Out of Stock", visibility: "inactive" }
            : item,
        ),
      );
      showToast(t("farmer.toast.deleteSuccess"));
    } catch {
      setActionError(t("farmer.toast.actionFailed"));
    } finally {
      mutationRef.current = false;
      setBusyId(null);
    }
  };

  const handleToggleListingStatus = async (id: string) => {
    const item = listings.find((l) => l.id === id);
    if (!item) return;
    if (mutationRef.current) return;
    mutationRef.current = true;
    setBusyId(id);
    setActionError("");
    const next =
      (item.visibility ??
        (item.status === "Available" ? "active" : "inactive")) === "active"
        ? "inactive"
        : "active";
    try {
      const updated = toListing(await repository.updateProductStatus(id, next));
      setListings((current) =>
        current.map((listing) => (listing.id === id ? updated : listing)),
      );
      showToast(
        t("farmer.toast.statusUpdate").replace(
          "{status}",
          t(next === "active" ? "farmer.edit.visible" : "farmer.edit.hidden"),
        ),
      );
    } catch {
      setActionError(t("farmer.toast.actionFailed"));
    } finally {
      mutationRef.current = false;
      setBusyId(null);
    }
  };

  const handleCreateListing = async (
    listingData: Partial<CreateFarmerProductRequest> & {
      expectedQuantity?: number;
    },
  ) => {
    if (editing) {
      const updated = toListing(
        await repository.updateProduct(editing.id, listingData),
      );
      setListings((current) =>
        current.map((listing) =>
          listing.id === updated.id ? updated : listing,
        ),
      );
      setEditing(null);
      setActiveTab("listings");
      showToast(t("farmer.edit.saved"));
      return;
    }
    const created = await repository.createProduct(
      listingData as CreateFarmerProductRequest,
    );
    if (created.farmer) setFarm(created.farmer);
    setListings((current) => [toListing(created), ...current]);
    setActiveTab("listings");
    showToast(t("farmer.toast.createSuccess"));
  };

  const requestTab = (tab: TabType) => {
    if (formBusy || (tab === activeTab && !(tab === "create" && editing)))
      return;
    if (
      (activeTab === "create" || activeTab === "loans") &&
      formDirty &&
      (activeTab === "loans" || tab !== "create" || editing !== null)
    ) {
      setPendingTab(tab);
      return;
    }
    if (tab === "create" || activeTab === "create") setEditing(null);
    setActiveTab(tab);
  };

  return (
    <div className="app-shell" dir={language === "ur" ? "rtl" : "ltr"}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-alert" role="status">
          <div className="toast-alert-icon">
            <CheckCircle size={18} />
          </div>
          <span className="toast-alert-message">{toastMessage}</span>
          <button
            className="toast-alert-close"
            onClick={() => setToastMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="app-main">
        {/* Unified TopBar Navigation matching buyer/transporter layout */}
        <header className="topbar">
          <div
            className="topbar-left"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
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
                color: "var(--text-dark)",
              }}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-logo">
              <IcLeaf size={24} className="logo-icon" />
              <h2>{language === "ur" ? "فارم ٹو فورک" : "Farm2Fork"}</h2>
            </div>
          </div>

          <nav className="topbar-nav">
            <a
              href="#"
              className={`topbar-link${activeTab === "listings" ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                requestTab("listings");
              }}
            >
              <span className="icon">
                <Tractor size={18} />
              </span>
              <span className="label">{t("farmer.tab.listings")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "create" ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                requestTab("create");
              }}
            >
              <span className="icon">
                <PlusCircle size={18} />
              </span>
              <span className="label">{t("farmer.tab.create")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "orders" ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                requestTab("orders");
              }}
            >
              <span className="icon">
                <ShoppingBag size={18} />
              </span>
              <span className="label">{t("farmer.tab.orders")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "feed" ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                requestTab("feed");
              }}
            >
              <span className="icon">
                <Rss size={18} />
              </span>
              <span className="label">{t("farmer.tab.feed")}</span>
            </a>
            <a
              href="#"
              className={`topbar-link${activeTab === "scan" ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                requestTab("scan");
              }}
            >
              <span className="icon">
                <QrCode size={18} />
              </span>
              <span className="label">{t("farmer.tab.scan")}</span>
            </a>
            <button
              type="button"
              className={`topbar-link${activeTab === "loans" ? " active" : ""}`}
              onClick={() => requestTab("loans")}
            >
              {language === "ur" ? "مالی معاونت" : "Farm finance"}
            </button>
          </nav>

          <div className="topbar-right">
            <NotificationBell />

            {/* Profile and account live on /account */}
            <Link
              className="topbar-user"
              href="/account"
              aria-label={t("farmer.tab.profile")}
            >
              <Avatar user={{ ...user, email }} size={36} />
              <span className="topbar-user-info">
                <span className="topbar-user-name">
                  {user?.fullName || t("signupRole.farmerRole")}
                </span>
                <span className="topbar-user-role">{email}</span>
              </span>
            </Link>
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
                  <span>
                    {language === "ur" ? "فارم ٹو فورک" : "Farm2Fork"}
                  </span>
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
                    requestTab("listings");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${
                    activeTab === "listings"
                      ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Tractor size={16} />
                  <span>{t("farmer.listings.title")}</span>
                </button>

                <button
                  onClick={() => {
                    requestTab("create");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${
                    activeTab === "create"
                      ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <PlusCircle size={16} />
                  <span>{t("farmer.tab.create")}</span>
                </button>

                <button
                  onClick={() => {
                    requestTab("orders");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${
                    activeTab === "orders"
                      ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingBag size={16} />
                  <span>{t("farmer.tab.orders")}</span>
                </button>

                <button
                  onClick={() => {
                    requestTab("feed");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${
                    activeTab === "feed"
                      ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Rss size={16} />
                  <span>{t("farmer.tab.feed")}</span>
                </button>

                <button
                  onClick={() => {
                    requestTab("scan");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors ${
                    activeTab === "scan"
                      ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <QrCode size={16} />
                  <span>{t("farmer.tab.scan")}</span>
                </button>

                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left p-3 rounded-lg text-sm font-semibold flex items-center gap-3 border-none cursor-pointer transition-colors bg-white text-gray-600 hover:bg-gray-50"
                >
                  <User size={16} />
                  <span>{t("farmer.tab.profile")}</span>
                </Link>
              </nav>
            </aside>
          </>
        )}

        {/* Main Page Content Wrapper matching buyer/transporter app-content */}
        <main className="app-content">
          {actionError ? (
            <p className="auth-error" role="alert">
              {actionError}
            </p>
          ) : null}
          {pendingTab ? (
            <div className="flow-notice">
              <p>{t("farmer.edit.unsaved")}</p>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setPendingTab(null)}
              >
                {t("farmer.edit.keep")}
              </button>
              <button
                className="btn btn-danger-solid"
                type="button"
                onClick={() => {
                  setFormDirty(false);
                  setActiveTab(pendingTab);
                  setPendingTab(null);
                  setEditing(null);
                }}
              >
                {t("farmer.edit.discard")}
              </button>
            </div>
          ) : null}
          {activeTab === "listings" && (
            <FarmPickupLocation repository={repository} />
          )}
          {activeTab === "listings" && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={listingsLoading || busyId !== null}
                onClick={() => setReload((value) => value + 1)}
              >
                {language === "ur" ? "پیداوار تازہ کریں" : "Refresh listings"}
              </button>
              {listingsLoading ? (
                <div className="flow-state" role="status">
                  {t("flow.loadingListings")}
                </div>
              ) : listingError ? (
                <div className="flow-state">
                  <p role="alert">{listingError}</p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setReload((value) => value + 1)}
                  >
                    {t("flow.retry")}
                  </button>
                </div>
              ) : (
                <FarmerListings
                  listings={listings}
                  farm={farm}
                  onDelete={handleDeleteListing}
                  onToggleStatus={handleToggleListingStatus}
                  onAddClick={() => {
                    requestTab("create");
                  }}
                  onEdit={(listing) => {
                    setEditing(listing);
                    setActiveTab("create");
                  }}
                  busyId={busyId}
                />
              )}
            </>
          )}

          {activeTab === "create" && (
            <CreateListingForm
              initialVisibility={editing?.visibility}
              onDirtyChange={setFormDirty}
              onBusyChange={setFormBusy}
              key={editing?.id ?? "new"}
              initialListing={
                editing
                  ? {
                      name: editing.name,
                      category: editing.category.toLowerCase(),
                      price: editing.price,
                      quantity: editing.quantity,
                      unit: editing.unit as CreateFarmerProductRequest["unit"],
                      qualityGrade: editing.grade as "A" | "B" | "C",
                      description: editing.description,
                      images: editing.images,
                    }
                  : undefined
              }
              aiClient={repository}
              onUploadPhotos={(photos) =>
                repository.uploadProductImages(photos)
              }
              onSubmit={handleCreateListing}
              onCancel={() => requestTab("listings")}
            />
          )}

          {activeTab === "orders" &&
            (ordersError ? (
              <div className="flow-state">
                <p role="alert">{ordersError}</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setReload((value) => value + 1)}
                >
                  {t("flow.retry")}
                </button>
              </div>
            ) : orders ? (
              <FarmerOrders
                orders={orders}
                shipments={shipments}
                shipmentError={shipmentError}
                loading={ordersLoading}
                onRefresh={() => setReload((value) => value + 1)}
              />
            ) : (
              <p role="status">{t("flow.loadingOrders")}</p>
            ))}

          {activeTab === "loans" && (
            <FarmerLoans
              onDirtyChange={setFormDirty}
              onBusyChange={setFormBusy}
            />
          )}
          {activeTab === "feed" && <FarmFeed currentUserId={user?.id} />}

          {activeTab === "scan" && <ScanScreen />}
        </main>
      </div>
    </div>
  );
}

function toListing(product: ApiProduct): Listing {
  return {
    id: product.id,
    name: product.name,
    category:
      product.category.charAt(0).toUpperCase() + product.category.slice(1),
    grade: product.qualityGrade ?? "A",
    description: product.description ?? "",
    price: product.price,
    unit: product.unit,
    quantity: product.quantity,
    status:
      product.status === "active" && product.quantity > 0
        ? "Available"
        : "Out of Stock",
    visibility: product.status as Listing["visibility"],
    ledger: product.originLedgerStatus ?? "missing",
    images: product.images ?? [],
  };
}
