"use client";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { collectPages } from "@/lib/api/pagination.ts";
import { useLanguage } from "../LanguageContext";
import NotificationBell from "@/components/NotificationBell";
import type {
  ApiOrder,
  ApiPage,
  ApiPayment,
  ApiShipment,
  BuyerProduct,
} from "@/lib/api/contracts.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import type {
  BuyerRepository,
  ProductQuery,
} from "@/lib/buyer/buyer-repository.ts";
import { orderStatusClass } from "@/lib/status.ts";
import {
  addCartItem,
  cartGroupLabel,
  groupCartItemsByFarmer,
  removeCartGroup,
  removeCartItem,
  readSavedCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart/cart.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { webSession } from "@/lib/auth/web-session.ts";
import { resolveApiUrl } from "@/lib/loans/loan-repository.ts";
import { Avatar } from "../account/Avatar";
import ScanScreen from "../ScanScreen";
import FarmFeed from "../farmer/FarmFeed";
import {
  paymentSimulatorEnabled,
  safepayCheckoutUrl,
  type PaymentReturn,
} from "@/lib/buyer/payment-checkout.ts";
import { DeliveryTracking } from "@/components/orders/DeliveryTracking";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { CheckoutPanel } from "./CheckoutPanel";
import {
  IcCart,
  IcCrate,
  IcLeaf,
  IcScan,
  IcPlus,
  IcStore,
} from "@/components/icons";

type BuyerRepositoryPort = Partial<Pick<BuyerRepository, "cancelOrder">> &
  Pick<
    BuyerRepository,
    | "createOrder"
    | "quoteOrder"
    | "getCurrentBuyer"
    | "getProduct"
    | "initiatePayment"
    | "listOrders"
    | "listPayments"
    | "listShipments"
    | "listProducts"
    | "quoteOrder"
    | "simulatePaymentSuccess"
  >;

type BuyerTab = "cart" | "marketplace" | "orders" | "scan" | "feed";

export function BuyerApp({
  repository,
  onLogout,
  paymentReturn,
  simulatorEnabled = paymentSimulatorEnabled(),
}: {
  repository: BuyerRepositoryPort;
  session: BuyerSession;
  onLogout: () => void;
  paymentReturn?: PaymentReturn;
  simulatorEnabled?: boolean;
}) {
  const copy = useBuyerCopy();
  const { language } = useLanguage();
  const [buyer, setBuyer] = useState<BuyerSession["user"] | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BuyerTab>(
    paymentReturn ? "orders" : "marketplace",
  );
  const [query, setQuery] = useState<ProductQuery>({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [products, setProducts] = useState<ApiPage<BuyerProduct> | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productReload, setProductReload] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const detailRequest = useRef(0);
  const [notice, setNotice] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BuyerProduct | null>(
    null,
  );
  const [detailError, setDetailError] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [payments, setPayments] = useState<ApiPayment[] | null>(null);
  const [shipments, setShipments] = useState<ApiShipment[] | null>(null);
  const [paymentsUnavailable, setPaymentsUnavailable] = useState(false);
  const [shipmentsUnavailable, setShipmentsUnavailable] = useState(false);
  const refreshBusy = useRef(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [checkoutLinks, setCheckoutLinks] = useState<Record<string, string>>(
    {},
  );
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
    {},
  );
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );
  const [cancelErrors, setCancelErrors] = useState<Record<string, string>>({});
  const [initiatingOrderId, setInitiatingOrderId] = useState<string | null>(
    null,
  );
  const [settlingPaymentId, setSettlingPaymentId] = useState<string | null>(
    null,
  );

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const refreshOrders = useCallback(async () => {
    if (refreshBusy.current) return;
    refreshBusy.current = true;
    setOrdersLoading(true);
    const [orderResult, paymentResult, shipmentResult] =
      await Promise.allSettled([
        collectPages((page) => repository.listOrders({ limit: 20, page })),
        collectPages((page) => repository.listPayments({ limit: 50, page })),
        repository.listShipments(),
      ]);
    if (orderResult.status === "fulfilled") {
      setOrders(orderResult.value.data);
      setOrdersError(null);
    } else setOrdersError(toErrorMessage(orderResult.reason));
    if (paymentResult.status === "fulfilled") {
      setPayments(paymentResult.value.data);
      setPaymentsUnavailable(false);
    } else {
      setPaymentsUnavailable(true);
      setPayments((current) => current ?? []);
    }
    if (shipmentResult.status === "fulfilled") {
      setShipments(shipmentResult.value);
      setShipmentsUnavailable(false);
    } else {
      setShipmentsUnavailable(true);
      setShipments((current) => current ?? []);
    }
    refreshBusy.current = false;
    setOrdersLoading(false);
  }, [repository]);

  useEffect(() => {
    let active = true;

    repository
      .getCurrentBuyer()
      .then((currentBuyer) => {
        if (!active) return;
        webSession.save({ user: currentBuyer });
        setCart(readSavedCart(window.sessionStorage, currentBuyer.id));
        setBuyer(currentBuyer);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          onLogout();
          return;
        }
        setAccountError(toErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [onLogout, repository]);

  useEffect(() => {
    if (!buyer) return;
    try {
      window.sessionStorage.setItem(
        `f2f.cart.v1.${buyer.id}`,
        JSON.stringify(cart),
      );
    } catch {
      /* Browsers that block storage still keep an in-memory cart. */
    }
  }, [buyer, cart]);

  useEffect(() => {
    if (!buyer || activeTab !== "marketplace") return;
    let active = true;
    setProductsLoading(true);
    setProductsError(null);
    repository
      .listProducts(debouncedQuery)
      .then((response) => {
        if (!active) return;
        setProductsError(null);
        setProducts(response);
      })
      .catch((error: unknown) => {
        if (active) setProductsError(toErrorMessage(error));
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeTab, buyer, debouncedQuery, productReload, repository]);

  useEffect(() => {
    if (!buyer || activeTab !== "orders") return;
    void refreshOrders();
  }, [activeTab, buyer, refreshOrders]);

  useEffect(() => {
    if (!buyer || activeTab !== "orders") return;
    const onFocus = () => {
      void refreshOrders();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [activeTab, buyer, refreshOrders]);

  useEffect(() => {
    if (!checkoutBusy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [checkoutBusy]);

  async function continuePayment(orderId: string) {
    if (initiatingOrderId) return;
    setInitiatingOrderId(orderId);
    setPaymentErrors((current) => ({ ...current, [orderId]: "" }));
    setCheckoutLinks((current) => ({ ...current, [orderId]: "" }));
    try {
      const response = await repository.initiatePayment(orderId, "safepay");
      const url = safepayCheckoutUrl(response);
      if (url) setCheckoutLinks((current) => ({ ...current, [orderId]: url }));
      await refreshOrders();
    } catch (error) {
      setPaymentErrors((current) => ({
        ...current,
        [orderId]: toErrorMessage(error),
      }));
    } finally {
      setInitiatingOrderId(null);
    }
  }

  const groups = useMemo(() => groupCartItemsByFarmer(cart), [cart]);

  async function openProduct(id: string) {
    const request = ++detailRequest.current;
    setDetailLoading(true);
    setDetailError(null);
    setSelectedProduct(null);
    try {
      const product = await repository.getProduct(id);
      if (request === detailRequest.current) setSelectedProduct(product);
    } catch (error) {
      if (request === detailRequest.current)
        setDetailError(toErrorMessage(error));
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  }

  function addProduct(product: BuyerProduct) {
    setCart((items) => addCartItem(items, product, 1));
    setNotice(
      (cart.find((item) => item.productId === product.id)?.quantity ?? 0) >=
        Math.floor(product.quantity)
        ? copy("Available stock is already in your cart.")
        : copy("Cart updated. Review quantities in Your cart."),
    );
  }

  function clearConfirmedGroups(farmerIds: string[]) {
    setCart((items) =>
      farmerIds.reduce(
        (remaining, farmerId) => removeCartGroup(remaining, farmerId),
        items,
      ),
    );
  }

  async function cancelOrder(id: string) {
    if (!repository.cancelOrder || cancellingOrderId || initiatingOrderId)
      return;
    setCancellingOrderId(id);
    setCancelErrors((current) => ({ ...current, [id]: "" }));
    try {
      const updated = await repository.cancelOrder(id);
      setOrders(
        (current) =>
          current?.map((order) => (order.id === id ? updated : order)) ?? null,
      );
    } catch (error) {
      setCancelErrors((current) => ({
        ...current,
        [id]: toErrorMessage(error),
      }));
    } finally {
      setCancellingOrderId(null);
    }
  }

  async function settlePayment(paymentId: string) {
    setSettlingPaymentId(paymentId);
    try {
      await repository.simulatePaymentSuccess(paymentId);
      await refreshOrders();
    } catch (error) {
      setOrdersError(toErrorMessage(error));
    } finally {
      setSettlingPaymentId(null);
    }
  }

  if (!buyer && !accountError) {
    return <p>{copy("Loading your buyer account\u2026")}</p>;
  }

  if (accountError) {
    return (
      <div className="cart-empty">
        <h2>{copy("We could not load your buyer account.")}</h2>
        <p role="alert">{accountError}</p>
        <button className="cart-shop-btn" onClick={onLogout} type="button">
          {copy("Return to sign in")}
        </button>
      </div>
    );
  }

  if (!buyer) return null;

  return (
    <div className="app-shell" dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-logo"
              onClick={() => {
                setActiveTab("marketplace");
                setSelectedProduct(null);
              }}
              type="button"
            >
              <IcLeaf size={22} className="logo-icon" />
              <h2>Farm2Fork</h2>
            </button>
          </div>
          <nav className="topbar-nav" aria-label={copy("Buyer navigation")}>
            <TabButton
              disabled={checkoutBusy}
              active={activeTab === "marketplace"}
              onClick={() => setActiveTab("marketplace")}
            >
              {copy("Marketplace")}
            </TabButton>
            <TabButton
              disabled={checkoutBusy}
              active={activeTab === "cart"}
              onClick={() => setActiveTab("cart")}
            >
              {copy("Cart ({count})", { count: cart.length })}
            </TabButton>
            <TabButton
              disabled={checkoutBusy}
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
            >
              {copy("Orders")}
            </TabButton>
            <TabButton
              disabled={checkoutBusy}
              active={activeTab === "scan"}
              onClick={() => setActiveTab("scan")}
            >
              {copy("Trace")}
            </TabButton>
            <TabButton
              disabled={checkoutBusy}
              active={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
            >
              {copy("Community")}
            </TabButton>
          </nav>
          <div className="topbar-right">
            <NotificationBell />
            <Link
              className="topbar-user"
              href="/account"
              aria-label={copy("Your account and profile")}
            >
              <Avatar user={buyer} size={36} />
              <span className="topbar-user-info">
                <span className="topbar-user-name">
                  {buyer.fullName || "Buyer"}
                </span>
                <span className="topbar-user-role">{buyer.email}</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="app-content">
          {notice ? (
            <div className="flow-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setActiveTab("cart");
                  setNotice("");
                }}
              >
                {copy("View cart")}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                aria-label={copy("Dismiss message")}
                onClick={() => setNotice("")}
              >
                {copy("Dismiss")}
              </button>
            </div>
          ) : null}
          {activeTab === "marketplace" ? (
            <Marketplace
              loading={productsLoading}
              detailLoading={detailLoading}
              onRetry={() => setProductReload((value) => value + 1)}
              page={products?.page ?? 1}
              totalPages={products?.totalPages ?? 1}
              error={productsError}
              onAddToCart={addProduct}
              onOpenProduct={openProduct}
              onQueryChange={(next) =>
                setQuery({ ...next, page: next.page ?? 1 })
              }
              products={products?.data ?? []}
              query={query}
              selectedProduct={selectedProduct}
              detailError={detailError}
              onCloseDetail={() => {
                detailRequest.current++;
                setSelectedProduct(null);
                setDetailError(null);
                setDetailLoading(false);
              }}
            />
          ) : null}
          {activeTab === "cart" ? (
            <Cart
              checkoutBusy={checkoutBusy}
              onBusyChange={setCheckoutBusy}
              groups={groups}
              onQuantity={(id, quantity) =>
                setCart((items) => updateCartQuantity(items, id, quantity))
              }
              onRemove={(id) => setCart((items) => removeCartItem(items, id))}
              onBrowse={() => setActiveTab("marketplace")}
              onConfirmedFarmers={clearConfirmedGroups}
              onViewOrders={() => setActiveTab("orders")}
              repository={repository}
              simulatorEnabled={simulatorEnabled}
            />
          ) : null}
          {activeTab === "orders" ? (
            <Orders
              paymentsUnavailable={paymentsUnavailable}
              shipmentsUnavailable={shipmentsUnavailable}
              loading={ordersLoading}
              error={ordersError}
              onBrowse={() => setActiveTab("marketplace")}
              onRefresh={() => {
                void refreshOrders();
              }}
              onCancelOrder={repository.cancelOrder ? cancelOrder : undefined}
              cancellingOrderId={cancellingOrderId}
              cancelErrors={cancelErrors}
              onContinuePayment={continuePayment}
              paymentReturn={paymentReturn}
              simulatorEnabled={simulatorEnabled}
              checkoutLinks={checkoutLinks}
              paymentErrors={paymentErrors}
              initiatingOrderId={initiatingOrderId}
              onSimulatePayment={settlePayment}
              orders={orders}
              payments={payments}
              settlingPaymentId={settlingPaymentId}
              shipments={shipments}
            />
          ) : null}
          {activeTab === "feed" ? <FarmFeed currentUserId={buyer.id} /> : null}
          {activeTab === "scan" ? <ScanScreen /> : null}
        </main>
      </div>
    </div>
  );
}

function TabButton({
  disabled = false,
  active,
  children,
  onClick,
}: {
  disabled?: boolean;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      className={`topbar-link${active ? " active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Marketplace({
  loading,
  detailLoading,
  onRetry,
  page,
  totalPages,
  detailError,
  error,
  onAddToCart,
  onCloseDetail,
  onOpenProduct,
  onQueryChange,
  products,
  query,
  selectedProduct,
}: {
  loading: boolean;
  detailLoading: boolean;
  onRetry: () => void;
  page: number;
  totalPages: number;
  detailError: string | null;
  error: string | null;
  onAddToCart: (product: BuyerProduct) => void;
  onCloseDetail: () => void;
  onOpenProduct: (id: string) => void;
  onQueryChange: (query: ProductQuery) => void;
  products: BuyerProduct[];
  query: ProductQuery;
  selectedProduct: BuyerProduct | null;
}) {
  const { t } = useLanguage();
  const copy = useBuyerCopy();
  if (selectedProduct || detailError || detailLoading) {
    return (
      <section>
        <button className="pd-back-btn" onClick={onCloseDetail} type="button">
          {copy("Back to marketplace")}
        </button>
        {detailLoading ? (
          <p role="status">{copy("Loading product details\u2026")}</p>
        ) : null}
        {detailError ? (
          <p role="alert">
            {detailError} Return to the marketplace and try again.
          </p>
        ) : null}
        {selectedProduct ? (
          <div className="pd-layout">
            <div className="pd-image">
              {selectedProduct.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="pd-photo"
                  src={resolveApiUrl(selectedProduct.images[0])}
                  alt={selectedProduct.name}
                />
              ) : (
                <IcLeaf className="leaf" size={100} />
              )}
            </div>
            <div className="pd-info">
              <h1>{selectedProduct.name}</h1>
              {selectedProduct.farmer ? (
                <p className="pd-farm">{farmLabel(selectedProduct.farmer)}</p>
              ) : null}
              <p className="pd-price">
                {selectedProduct.price.toLocaleString()} PKR /{" "}
                {selectedProduct.unit}
              </p>
              {selectedProduct.description ? (
                <p>{selectedProduct.description}</p>
              ) : null}
              <div className="pd-tags">
                <span className="pd-tag">
                  {copy("Grade {grade}", {
                    grade: copy(
                      selectedProduct.qualityGrade ?? "not specified",
                    ),
                  })}
                </span>
                <span className="pd-tag">
                  {copy("{quantity} {unit} available", {
                    quantity: selectedProduct.quantity,
                    unit: selectedProduct.unit,
                  })}
                </span>
              </div>
              <button
                className="pd-add-cart"
                disabled={
                  selectedProduct.status !== "active" ||
                  selectedProduct.quantity < 1
                }
                onClick={() => onAddToCart(selectedProduct)}
                type="button"
              >
                <IcCart size={20} />
                {copy("Add to cart")}
              </button>
              <Link
                className="pd-trace-link"
                href={`/trace/${selectedProduct.id}`}
              >
                <IcScan size={18} aria-hidden="true" />{" "}
                {t("product.viewJourney")}
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="marketplace-container">
      <div className="marketplace-main-content">
        <div className="marketplace-controls-row">
          <input
            aria-label={copy("Search products")}
            className="search-input-field"
            onChange={(event) =>
              onQueryChange({
                ...query,
                search: event.target.value || undefined,
                page: 1,
              })
            }
            placeholder={copy("Search products")}
            value={query.search ?? ""}
          />
          <select
            aria-label={copy("Category")}
            onChange={(event) =>
              onQueryChange({
                ...query,
                category: event.target.value || undefined,
                page: 1,
              })
            }
            value={query.category ?? ""}
          >
            <option value="">{copy("All categories")}</option>
            <option value="vegetables">{copy("Vegetables")}</option>
            <option value="fruits">{copy("Fruits")}</option>
            <option value="grains">{copy("Grains")}</option>
            <option value="dairy">{copy("Dairy")}</option>
          </select>
        </div>
        <div className="section-title">
          <h3>{copy("Marketplace")}</h3>
        </div>
        {error ? (
          <div className="flow-state">
            <p role="alert">{error}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onRetry}
            >
              {copy("Try again")}
            </button>
          </div>
        ) : null}
        {loading ? <p role="status">{copy("Loading products\u2026")}</p> : null}
        {!error && !loading && products.length === 0 ? (
          <div className="flow-state">
            <h2>{copy("No products found")}</h2>
            <p>{copy("Try another search or category.")}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => onQueryChange({ limit: query.limit, page: 1 })}
            >
              {copy("Clear filters")}
            </button>
          </div>
        ) : null}
        <div className="mp-product-grid" aria-busy={loading}>
          {products.map((product) => (
            <article className="mp-card" key={product.id}>
              <button
                className="mp-card-img"
                onClick={() => onOpenProduct(product.id)}
                type="button"
              >
                {product.images[0] ? (
                  // Photos come from Cloudinary or the API; not optimisable by next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="mp-card-photo"
                    src={resolveApiUrl(product.images[0])}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <IcLeaf className="leaf" size={56} />
                )}
                <span className="mp-card-grade">
                  Grade {product.qualityGrade ?? "N/A"}
                </span>
              </button>
              <div className="mp-card-body">
                <div className="mp-card-name">{product.name}</div>
                {product.farmer ? (
                  <div className="mp-card-farm">
                    {farmLabel(product.farmer)}
                  </div>
                ) : null}
                <div className="mp-card-footer">
                  <div className="mp-card-price">
                    {product.price.toLocaleString()} PKR / {product.unit}
                  </div>
                  <button
                    aria-label={copy("Add {name} to cart", {
                      name: product.name,
                    })}
                    className="mp-add-btn"
                    disabled={
                      product.status !== "active" || product.quantity < 1
                    }
                    onClick={() => onAddToCart(product)}
                    type="button"
                  >
                    <IcPlus size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {totalPages > 1 ? (
          <nav className="flow-pagination" aria-label="Marketplace pages">
            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading || page <= 1}
              onClick={() => onQueryChange({ ...query, page: page - 1 })}
            >
              {copy("Previous")}
            </button>
            <span>
              {copy("Page {page} of {total}", { page, total: totalPages })}
            </span>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => onQueryChange({ ...query, page: page + 1 })}
            >
              {copy("Next")}
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}

function Cart({
  checkoutBusy,
  onBusyChange,
  groups,
  onQuantity,
  onRemove,
  onBrowse,
  onConfirmedFarmers,
  onViewOrders,
  repository,
  simulatorEnabled,
}: {
  checkoutBusy: boolean;
  onBusyChange: (busy: boolean) => void;
  groups: ReturnType<typeof groupCartItemsByFarmer>;
  onQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onBrowse: () => void;
  onConfirmedFarmers: (farmerIds: string[]) => void;
  onViewOrders: () => void;
  repository: Pick<
    BuyerRepository,
    "createOrder" | "initiatePayment" | "quoteOrder"
  >;
  simulatorEnabled: boolean;
}) {
  const copy = useBuyerCopy();
  return (
    <section>
      <div className="page-header">
        <h1>{copy("Your cart")}</h1>
        <p>
          {groups.length > 1
            ? copy(
                "Your items come from {count} farms, so they're placed as separate orders. You pay for each one.",
                { count: groups.length },
              )
            : copy(
                "Review your items, then add delivery details to place your order.",
              )}
        </p>
      </div>
      <div className="cart-layout">
        <div className="cart-groups">
          <button
            className="btn btn-secondary"
            type="button"
            disabled={checkoutBusy}
            onClick={onBrowse}
          >
            {copy("Continue shopping")}
          </button>
          {groups.map((group, index) => (
            <article className="order-card cart-group" key={group.farmerId}>
              <h2>
                <IcStore size={20} /> {cartGroupLabel(group, index)}
              </h2>
              {group.items.map((item) => (
                <div className="order-item-row" key={item.productId}>
                  <div className="cart-item-info">
                    <strong>{item.product.name}</strong>
                    <span>
                      {item.product.price} PKR / {item.product.unit}
                    </span>
                    <span>
                      {copy("{quantity} {unit} available", {
                        quantity: item.product.quantity,
                        unit: item.product.unit,
                      })}
                    </span>
                  </div>
                  <div className="cart-item-actions">
                    <div
                      className="quantity-control"
                      role="group"
                      aria-label={copy("Quantity for {name}", {
                        name: item.product.name,
                      })}
                    >
                      <button
                        type="button"
                        aria-label={copy("Decrease {name} quantity", {
                          name: item.product.name,
                        })}
                        disabled={checkoutBusy || item.quantity <= 1}
                        onClick={() =>
                          onQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        aria-label={copy("{name} quantity", {
                          name: item.product.name,
                        })}
                        min="1"
                        max={Math.floor(item.product.quantity)}
                        step="1"
                        value={item.quantity}
                        disabled={checkoutBusy}
                        onChange={(event) =>
                          onQuantity(item.productId, Number(event.target.value))
                        }
                      />
                      <button
                        type="button"
                        aria-label={copy("Increase {name} quantity", {
                          name: item.product.name,
                        })}
                        disabled={
                          checkoutBusy ||
                          item.quantity >= Math.floor(item.product.quantity)
                        }
                        onClick={() =>
                          onQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <strong>{item.product.price * item.quantity} PKR</strong>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={checkoutBusy}
                      onClick={() => onRemove(item.productId)}
                      aria-label={copy("Remove {name}", {
                        name: item.product.name,
                      })}
                    >
                      {copy("Remove")}
                    </button>
                  </div>
                </div>
              ))}
              <div className="order-item-row cart-group-subtotal">
                <span>{copy("Items subtotal")}</span>
                <span>
                  {group.items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0,
                  )}{" "}
                  PKR
                </span>
              </div>
            </article>
          ))}
        </div>
        <CheckoutPanel
          onBusyChange={onBusyChange}
          groups={groups}
          onConfirmedFarmers={onConfirmedFarmers}
          onViewOrders={onViewOrders}
          repository={repository}
          simulatorEnabled={simulatorEnabled}
        />
      </div>
    </section>
  );
}

type PaymentActions = {
  onCancelOrder?: (id: string) => Promise<void>;
  cancellingOrderId?: string | null;
  cancelErrors?: Record<string, string>;
  onContinuePayment: (orderId: string) => void;
  simulatorEnabled: boolean;
  checkoutLinks: Record<string, string>;
  paymentErrors: Record<string, string>;
  initiatingOrderId: string | null;
};

function Orders({
  paymentsUnavailable,
  shipmentsUnavailable,
  loading,
  error,
  onRefresh,
  paymentReturn,
  onSimulatePayment,
  onBrowse,
  orders,
  payments,
  settlingPaymentId,
  shipments,
  ...paymentActions
}: PaymentActions & {
  error: string | null;
  paymentsUnavailable: boolean;
  shipmentsUnavailable: boolean;
  loading: boolean;
  onBrowse?: () => void;
  onRefresh: () => void;
  paymentReturn?: PaymentReturn;
  onSimulatePayment: (paymentId: string) => void;
  orders: ApiOrder[] | null;
  payments: ApiPayment[] | null;
  settlingPaymentId: string | null;
  shipments: ApiShipment[] | null;
}) {
  const copy = useBuyerCopy();
  const header = (
    <div className="page-header-row orders-header">
      <div className="page-header">
        <h1>{copy("Orders")}</h1>
        <p>
          {copy("Track payment and delivery for every order you have placed.")}
        </p>
      </div>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? "Refreshing…" : copy("Refresh payment status")}
      </button>
    </div>
  );

  if (!orders || !payments || !shipments)
    return (
      <section>
        {header}
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <p>{copy("Loading orders and payments\u2026")}</p>
        )}
      </section>
    );

  const shipmentsByOrder = new Map(
    shipments.map((shipment) => [shipment.orderId, shipment]),
  );

  return (
    <section>
      {header}
      {paymentReturn ? (
        <p role="status" className="orders-notice">
          {paymentReturn === "cancel"
            ? copy(
                "Checkout was closed. Your saved orders remain available below.",
              )
            : copy(
                "You returned from checkout. Payment status below comes from the server; confirmation may take a moment.",
              )}
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {orders.length === 0 ? (
        <div className="empty-state">
          <IcCrate size={56} />
          <h2>{copy("No orders yet")}</h2>
          <p>
            {copy(
              "Orders you place from the marketplace show up here with live payment and delivery status.",
            )}
          </p>
          {onBrowse ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={onBrowse}
            >
              {copy("Browse the marketplace")}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              {...paymentActions}
              paymentsUnavailable={paymentsUnavailable}
              shipmentsUnavailable={shipmentsUnavailable}
              onSimulatePayment={onSimulatePayment}
              order={order}
              payment={payments.find(
                (candidate) => candidate.orderId === order.id,
              )}
              settlingPaymentId={settlingPaymentId}
              shipment={shipmentsByOrder.get(order.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderCard({
  onCancelOrder,
  cancellingOrderId,
  cancelErrors,
  paymentsUnavailable,
  shipmentsUnavailable,
  onSimulatePayment,
  order,
  payment,
  settlingPaymentId,
  shipment,
  onContinuePayment,
  simulatorEnabled,
  checkoutLinks,
  paymentErrors,
  initiatingOrderId,
}: PaymentActions & {
  onSimulatePayment: (paymentId: string) => void;
  paymentsUnavailable: boolean;
  shipmentsUnavailable: boolean;
  order: ApiOrder;
  payment: ApiPayment | undefined;
  settlingPaymentId: string | null;
  shipment: ApiShipment | undefined;
}) {
  const copy = useBuyerCopy();
  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-card-id">
            {copy("Order {id}", { id: order.id })}
          </div>
          <div className="order-card-date">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <span className={`order-status ${orderStatusClass(order.status)}`}>
          {copy(order.status)}
        </span>
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item-row" key={item.productId}>
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{item.subtotal} PKR</span>
          </div>
        ))}
      </div>
      <div className="order-totals">
        <div className="order-total-row grand">
          <span>{copy("Grand total")}</span>
          <span>{order.grandTotal} PKR</span>
        </div>
      </div>
      <p
        className="order-payment"
        data-status={payment?.status ?? "not initiated"}
      >
        {copy("Payment: {status}", {
          status: copy(
            paymentsUnavailable
              ? "Status unavailable — refresh to retry"
              : (payment?.status ?? "not initiated"),
          ),
        })}
      </p>
      {simulatorEnabled &&
      payment?.status === "pending" &&
      payment.gateway !== "safepay" ? (
        <button
          className="cart-shop-btn"
          disabled={settlingPaymentId === payment.id}
          onClick={() => onSimulatePayment(payment.id)}
          type="button"
        >
          {settlingPaymentId === payment.id
            ? "Settling payment…"
            : "Simulate payment success"}
        </button>
      ) : null}
      {!paymentsUnavailable &&
      order.status === "pending" &&
      payment?.status !== "success" &&
      payment?.status !== "refunded" ? (
        <div className="order-actions">
          <button
            className="cart-shop-btn"
            type="button"
            disabled={initiatingOrderId !== null || Boolean(cancellingOrderId)}
            onClick={() => onContinuePayment(order.id)}
          >
            {initiatingOrderId === order.id
              ? "Preparing checkout…"
              : copy("Continue payment")}
          </button>
          {payment?.status === "pending" && checkoutLinks[order.id] ? (
            <a className="btn btn-primary" href={checkoutLinks[order.id]}>
              {copy("Open Safepay checkout")}
            </a>
          ) : null}
          {paymentErrors[order.id] ? (
            <p role="alert">{paymentErrors[order.id]}</p>
          ) : null}
        </div>
      ) : null}
      {order.canCancel && onCancelOrder ? (
        <div className="order-actions">
          <InlineConfirm
            label={copy("Cancel order")}
            prompt={copy("Cancel this unpaid order?")}
            confirmLabel={copy("Cancel order")}
            onConfirm={() => onCancelOrder(order.id)}
            busy={cancellingOrderId === order.id}
            disabled={Boolean(initiatingOrderId || cancellingOrderId)}
          />
        </div>
      ) : null}
      {cancelErrors?.[order.id] ? (
        <p role="alert">{cancelErrors[order.id]}</p>
      ) : null}
      <DeliveryTracking
        unavailable={shipmentsUnavailable}
        shipment={shipment}
        orderStatus={order.status}
        address={order.shippingAddress}
      />
    </article>
  );
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/** "Green Valley Farm · Multan, Punjab" - public farm identity only. */
function farmLabel(farmer: {
  farmName: string;
  city?: string;
  province?: string;
}): string {
  const place = [farmer.city, farmer.province].filter(Boolean).join(", ");
  return place ? `${farmer.farmName} · ${place}` : farmer.farmName;
}
