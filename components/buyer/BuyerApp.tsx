"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import type { BuyerRepository, ProductQuery } from "@/lib/buyer/buyer-repository.ts";
import { orderStatusClass } from "@/lib/status.ts";
import {
  addCartItem,
  groupCartItemsByFarmer,
  removeCartGroup,
  type CartItem,
} from "@/lib/cart/cart.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { webSession } from "@/lib/auth/web-session.ts";
import { Avatar } from "../account/Avatar";
import ScanScreen from "../ScanScreen";
import { paymentSimulatorEnabled, safepayCheckoutUrl, type PaymentReturn } from "@/lib/buyer/payment-checkout.ts";
import { CheckoutPanel } from "./CheckoutPanel";
import { IcCart, IcCrate, IcLeaf, IcScan, IcPlus, IcStore } from "@/components/icons";

type BuyerRepositoryPort = Pick<
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

type BuyerTab = "cart" | "marketplace" | "orders" | "scan";

export function BuyerApp({
  repository,
  session,
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
  const [buyer, setBuyer] = useState<BuyerSession["user"] | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BuyerTab>(paymentReturn ? "orders" : "marketplace");
  const [query, setQuery] = useState<ProductQuery>({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [products, setProducts] = useState<ApiPage<BuyerProduct> | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BuyerProduct | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [payments, setPayments] = useState<ApiPayment[] | null>(null);
  const [shipments, setShipments] = useState<ApiShipment[] | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [checkoutLinks, setCheckoutLinks] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [initiatingOrderId, setInitiatingOrderId] = useState<string | null>(null);
  const [settlingPaymentId, setSettlingPaymentId] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      const [ordersResponse, paymentsResponse, shipmentResponse] = await Promise.all([
        repository.listOrders({ limit: 20 }),
        repository.listPayments({ limit: 50 }),
        repository.listShipments(),
      ]);
      setOrdersError(null);
      setOrders(ordersResponse.data);
      setPayments(paymentsResponse.data);
      setShipments(shipmentResponse);
    } catch (error) {
      setOrdersError(toErrorMessage(error));
    }
  }, [repository]);

  useEffect(() => {
    let active = true;

    repository
      .getCurrentBuyer()
      .then((currentBuyer) => {
        if (!active) return;
        webSession.save({ user: currentBuyer });
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
    if (!buyer || activeTab !== "marketplace") return;
    let active = true;
    repository
      .listProducts(query)
      .then((response) => {
        if (!active) return;
        setProductsError(null);
        setProducts(response);
      })
      .catch((error: unknown) => {
        if (active) setProductsError(toErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [activeTab, buyer, query, repository]);

  useEffect(() => {
    if (!buyer || activeTab !== "orders") return;
    void refreshOrders();
  }, [activeTab, buyer, refreshOrders]);

  useEffect(() => {
    if (!buyer || activeTab !== "orders") return;
    const onFocus = () => { void refreshOrders(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [activeTab, buyer, refreshOrders]);

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
      setPaymentErrors((current) => ({ ...current, [orderId]: toErrorMessage(error) }));
    } finally {
      setInitiatingOrderId(null);
    }
  }

  const groups = useMemo(() => groupCartItemsByFarmer(cart), [cart]);

  async function openProduct(id: string) {
    setDetailError(null);
    setSelectedProduct(null);
    try {
      setSelectedProduct(await repository.getProduct(id));
    } catch (error) {
      setDetailError(toErrorMessage(error));
    }
  }

  function addProduct(product: BuyerProduct) {
    setCart((items) => addCartItem(items, product, 1));
  }

  function clearConfirmedGroups(farmerIds: string[]) {
    setCart((items) =>
      farmerIds.reduce(
        (remaining, farmerId) => removeCartGroup(remaining, farmerId),
        items,
      ),
    );
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
    return <p>Loading your buyer account…</p>;
  }

  if (accountError) {
    return (
      <div className="cart-empty">
        <h2>We could not load your buyer account.</h2>
        <p role="alert">{accountError}</p>
        <button className="cart-shop-btn" onClick={onLogout} type="button">
          Return to sign in
        </button>
      </div>
    );
  }

  if (!buyer) return null;

  return (
    <div className="app-shell">
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
          <nav className="topbar-nav" aria-label="Buyer navigation">
            <TabButton active={activeTab === "marketplace"} onClick={() => setActiveTab("marketplace")}>
              Marketplace
            </TabButton>
            <TabButton active={activeTab === "cart"} onClick={() => setActiveTab("cart")}>
              Cart ({cart.length})
            </TabButton>
            <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>
              Orders
            </TabButton>
            <TabButton active={activeTab === "scan"} onClick={() => setActiveTab("scan")}>
              Trace
            </TabButton>
          </nav>
          <div className="topbar-right">
            <NotificationBell />
            <Link className="topbar-user" href="/account" aria-label="Your account and profile">
              <Avatar user={buyer} size={36} />
              <span className="topbar-user-info">
                <span className="topbar-user-name">{buyer.fullName || "Buyer"}</span>
                <span className="topbar-user-role">{buyer.email}</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="app-content">
          {activeTab === "marketplace" ? (
            <Marketplace
              error={productsError}
              onAddToCart={addProduct}
              onOpenProduct={openProduct}
              onQueryChange={setQuery}
              products={products?.data ?? []}
              query={query}
              selectedProduct={selectedProduct}
              detailError={detailError}
              onCloseDetail={() => setSelectedProduct(null)}
            />
          ) : null}
          {activeTab === "cart" ? (
            <Cart
              groups={groups}
              onConfirmedFarmers={clearConfirmedGroups}
              onViewOrders={() => setActiveTab("orders")}
              repository={repository}
              simulatorEnabled={simulatorEnabled}
            />
          ) : null}
          {activeTab === "orders" ? (
            <Orders
              error={ordersError}
              onBrowse={() => setActiveTab("marketplace")}
              onRefresh={() => { void refreshOrders(); }}
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
          {activeTab === "scan" ? <ScanScreen /> : null}
        </main>
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={`topbar-link${active ? " active" : ""}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function Marketplace({
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
  if (selectedProduct || detailError) {
    return (
      <section>
        <button className="pd-back-btn" onClick={onCloseDetail} type="button">
          Back to marketplace
        </button>
        {detailError ? <p role="alert">{detailError}</p> : null}
        {selectedProduct ? (
          <div className="pd-layout">
            <div className="pd-image"><IcLeaf className="leaf" size={100} /></div>
            <div className="pd-info">
              <h1>{selectedProduct.name}</h1>
              {selectedProduct.farmer ? (
                <p className="pd-farm">{farmLabel(selectedProduct.farmer)}</p>
              ) : null}
              <p className="pd-price">{selectedProduct.price.toLocaleString()} PKR / {selectedProduct.unit}</p>
              <div className="pd-tags">
                <span className="pd-tag">Grade {selectedProduct.qualityGrade ?? "not specified"}</span>
                <span className="pd-tag">{selectedProduct.quantity} {selectedProduct.unit} available</span>
              </div>
              <button
                className="pd-add-cart"
                disabled={selectedProduct.status !== "active" || selectedProduct.quantity < 1}
                onClick={() => onAddToCart(selectedProduct)}
                type="button"
              >
                <IcCart size={20} /> Add to cart
              </button>
              <Link className="pd-trace-link" href={`/trace/${selectedProduct.id}`}>
                <IcScan size={18} aria-hidden="true" /> {t("product.viewJourney")}
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
            aria-label="Search products"
            className="search-input-field"
            onChange={(event) => onQueryChange({ ...query, search: event.target.value || undefined })}
            placeholder="Search products"
            value={query.search ?? ""}
          />
          <select
            aria-label="Category"
            onChange={(event) => onQueryChange({ ...query, category: event.target.value || undefined })}
            value={query.category ?? ""}
          >
            <option value="">All categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
            <option value="dairy">Dairy</option>
          </select>
        </div>
        <div className="section-title"><h3>Marketplace</h3></div>
        {error ? <p role="alert">{error}</p> : null}
        {!error && products.length === 0 ? <p>Loading products…</p> : null}
        <div className="mp-product-grid">
          {products.map((product) => (
            <article className="mp-card" key={product.id}>
              <button className="mp-card-img" onClick={() => onOpenProduct(product.id)} type="button">
                <IcLeaf className="leaf" size={56} />
                <span className="mp-card-grade">Grade {product.qualityGrade ?? "N/A"}</span>
              </button>
              <div className="mp-card-body">
                <div className="mp-card-name">{product.name}</div>
                {product.farmer ? (
                  <div className="mp-card-farm">{farmLabel(product.farmer)}</div>
                ) : null}
                <div className="mp-card-footer">
                  <div className="mp-card-price">{product.price.toLocaleString()} PKR / {product.unit}</div>
                  <button
                    aria-label={`Add ${product.name} to cart`}
                    className="mp-add-btn"
                    disabled={product.status !== "active" || product.quantity < 1}
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
      </div>
    </section>
  );
}

function Cart({
  groups,
  onConfirmedFarmers,
  onViewOrders,
  repository,
  simulatorEnabled,
}: {
  groups: ReturnType<typeof groupCartItemsByFarmer>;
  onConfirmedFarmers: (farmerIds: string[]) => void;
  onViewOrders: () => void;
  repository: Pick<BuyerRepository, "createOrder" | "initiatePayment" | "quoteOrder">;
  simulatorEnabled: boolean;
}) {

  return (
    <section>
      <div className="page-header">
        <h1>Your cart</h1>
        <p>Each farmer&apos;s items become a separate order with its own payment.</p>
      </div>
      <div className="cart-layout">
        <div className="cart-groups">
          {groups.map((group, index) => (
            <article className="order-card cart-group" key={group.farmerId}>
              <h2>
                <IcStore size={20} /> Farmer group {index + 1}
              </h2>
              {group.items.map((item) => (
                <div className="order-item-row" key={item.productId}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{item.product.price * item.quantity} PKR</span>
                </div>
              ))}
              <div className="order-item-row cart-group-subtotal">
                <span>Items subtotal</span>
                <span>{group.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} PKR</span>
              </div>
            </article>
          ))}
        </div>
        <CheckoutPanel
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
  onContinuePayment: (orderId: string) => void;
  simulatorEnabled: boolean;
  checkoutLinks: Record<string, string>;
  paymentErrors: Record<string, string>;
  initiatingOrderId: string | null;
};

function Orders({
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
  onBrowse?: () => void;
  onRefresh: () => void;
  paymentReturn?: PaymentReturn;
  onSimulatePayment: (paymentId: string) => void;
  orders: ApiOrder[] | null;
  payments: ApiPayment[] | null;
  settlingPaymentId: string | null;
  shipments: ApiShipment[] | null;
}) {

  const header = (
    <div className="page-header-row orders-header">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Track payment and delivery for every order you have placed.</p>
      </div>
      <button className="btn btn-secondary" type="button" onClick={onRefresh}>Refresh payment status</button>
    </div>
  );

  if (!orders || !payments || !shipments) return <section>{header}{error ? <p role="alert">{error}</p> : <p>Loading orders and payments…</p>}</section>;


  const shipmentsByOrder = new Map(shipments.map((shipment) => [shipment.orderId, shipment]));

  return (
    <section>
      {header}
      {paymentReturn ? <p role="status" className="orders-notice">{paymentReturn === "cancel"
        ? "Checkout was closed. Your saved orders remain available below."
        : "You returned from checkout. Payment status below comes from the server; confirmation may take a moment."}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {orders.length === 0 ? (
        <div className="empty-state">
          <IcCrate size={56} />
          <h2>No orders yet</h2>
          <p>Orders you place from the marketplace show up here with live payment and delivery status.</p>
          {onBrowse ? <button className="btn btn-primary" type="button" onClick={onBrowse}>Browse the marketplace</button> : null}
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              {...paymentActions}
              onSimulatePayment={onSimulatePayment}
              order={order}
              payment={payments.find((candidate) => candidate.orderId === order.id)}
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
  order: ApiOrder;
  payment: ApiPayment | undefined;
  settlingPaymentId: string | null;
  shipment: ApiShipment | undefined;
}) {
  return (
    <article className="order-card">
          <div className="order-card-header">
            <div>
              <div className="order-card-id">Order {order.id}</div>
              <div className="order-card-date">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <span className={`order-status ${orderStatusClass(order.status)}`}>{order.status}</span>
          </div>
          <div className="order-items">
            {order.items.map((item) => (
              <div className="order-item-row" key={item.productId}>
                <span>{item.productName} × {item.quantity}</span>
                <span>{item.subtotal} PKR</span>
              </div>
            ))}
          </div>
          <div className="order-totals">
            <div className="order-total-row grand"><span>Grand total</span><span>{order.grandTotal} PKR</span></div>
          </div>
          <p className="order-payment" data-status={payment?.status ?? "not initiated"}>
            Payment: {payment?.status ?? "not initiated"}
          </p>
          {simulatorEnabled && payment?.status === "pending" && payment.gateway !== "safepay" ? (
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
          {order.status === "pending" && payment?.status !== "success" && payment?.status !== "refunded" ? <div className="order-actions">
            <button className="cart-shop-btn" type="button" disabled={initiatingOrderId !== null}
              onClick={() => onContinuePayment(order.id)}>
              {initiatingOrderId === order.id ? "Preparing checkout…" : "Continue payment"}
            </button>
            {payment?.status === "pending" && checkoutLinks[order.id] ? <a className="btn btn-primary" href={checkoutLinks[order.id]}>Open Safepay checkout</a> : null}
            {paymentErrors[order.id] ? <p role="alert">{paymentErrors[order.id]}</p> : null}
          </div> : null}
          <ShipmentTracking shipment={shipment} />
        </article>
  );
}

function ShipmentTracking({ shipment }: { shipment: ApiShipment | undefined }) {
  if (!shipment) return <p className="order-shipment" data-status="awaiting">Shipment: awaiting assignment</p>;

  return (
    <div className="shipment-tracking">
      <p className="order-shipment" data-status={shipment.status}>Shipment: {shipment.status}</p>
      {shipment.statusHistory.length > 0 ? (
        <ol className="shipment-timeline">
          {shipment.statusHistory.map((entry) => (
            <li key={`${entry.status}-${entry.timestamp}`}>
              {entry.status} · {new Date(entry.timestamp).toLocaleString()}
              {entry.note ? ` — ${entry.note}` : ""}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

/** "Green Valley Farm · Multan, Punjab" - public farm identity only. */
function farmLabel(farmer: { farmName: string; city?: string; province?: string }): string {
  const place = [farmer.city, farmer.province].filter(Boolean).join(", ");
  return place ? `${farmer.farmName} · ${place}` : farmer.farmName;
}
