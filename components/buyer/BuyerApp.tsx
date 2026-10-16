"use client";
import { useBuyerCopy } from "@/lib/buyer/use-buyer-copy";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collectPages } from "@/lib/api/pagination.ts";
import { useLanguage } from "../LanguageContext";
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
import {
  addCartItem,
  groupCartItemsByFarmer,
  removeCartGroup,
  removeCartItem,
  readSavedCart,
  reconcileCart,
  updateCartQuantity,
  type CartChange,
  type CartItem,
} from "@/lib/cart/cart.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { webSession } from "@/lib/auth/web-session.ts";
import ScanScreen from "../ScanScreen";
import FarmFeed from "../farmer/FarmFeed";
import {
  paymentSimulatorEnabled,
  safepayCheckoutUrl,
  type PaymentReturn,
} from "@/lib/buyer/payment-checkout.ts";
import { ApiClient } from "@/lib/api/client.ts";
import { FarmRepository } from "@/lib/farm/farm-repository.ts";
import { CartView } from "./CartView";
import { MarketplaceBrowse } from "./MarketplaceBrowse";
import { OrdersView } from "./OrdersView";
import { BuyerTopbar, type BuyerTab } from "./BuyerTopbar";

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

export function BuyerApp({
  repository,
  onLogout,
  paymentReturn,
  simulatorEnabled = paymentSimulatorEnabled(),
  tab,
  onTabChange,
  farmRepository,
}: {
  repository: BuyerRepositoryPort;
  session: BuyerSession;
  onLogout: () => void;
  paymentReturn?: PaymentReturn;
  simulatorEnabled?: boolean;
  /** The tab to show when the URL owns it (`/?tab=cart`); omit to let the app keep its own. */
  tab?: BuyerTab;
  /** Called instead of switching locally when `tab` is controlled. */
  onTabChange?: (tab: BuyerTab) => void;
  /** Public farm profiles for Orders; defaults to the live API. */
  farmRepository?: Pick<FarmRepository, "getFarmProfile">;
}) {
  const copy = useBuyerCopy();
  const { language } = useLanguage();
  const [buyer, setBuyer] = useState<BuyerSession["user"] | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [localTab, setLocalTab] = useState<BuyerTab>(
    paymentReturn ? "orders" : "marketplace",
  );
  const activeTab = tab ?? localTab;
  const setActiveTab = (next: BuyerTab) => {
    if (onTabChange) onTabChange(next);
    else setLocalTab(next);
  };
  const [query, setQuery] = useState<ProductQuery>({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [products, setProducts] = useState<ApiPage<BuyerProduct> | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productReload, setProductReload] = useState(0);
  const [notice, setNotice] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartChanges, setCartChanges] = useState<CartChange[]>([]);
  const cartRef = useRef(cart);
  const farms = useMemo(
    () => farmRepository ?? new FarmRepository({ client: new ApiClient() }),
    [farmRepository],
  );
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
    cartRef.current = cart;
  });

  // Saved carts can outlive the listings in them, so opening the cart checks
  // each product against the server: gone or sold out items drop out, stock
  // and price changes are applied and reported rather than found at checkout.
  useEffect(() => {
    if (!buyer || activeTab !== "cart") return;
    const ids = [...new Set(cartRef.current.map((item) => item.productId))];
    if (ids.length === 0) return;
    let active = true;
    Promise.all(
      ids.map(async (id): Promise<[string, BuyerProduct | null] | null> => {
        try {
          const product = await repository.getProduct(id);
          return product && typeof product === "object" ? [id, product] : null;
        } catch (error) {
          return error instanceof ApiError && error.status === 404
            ? [id, null]
            : null;
        }
      }),
    ).then((results) => {
      if (!active) return;
      const fresh = new Map(results.filter((entry) => entry !== null));
      const { changes } = reconcileCart(cartRef.current, fresh);
      setCart((items) => reconcileCart(items, fresh).items);
      setCartChanges(changes);
    });
    return () => {
      active = false;
    };
  }, [activeTab, buyer, repository]);

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

  function addProduct(product: BuyerProduct, quantity = 1) {
    setCart((items) => addCartItem(items, product, quantity));
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
        <BuyerTopbar
          buyer={buyer}
          active={activeTab}
          cartCount={cart.length}
          disabled={checkoutBusy}
          onSelect={setActiveTab}
        />

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
            <MarketplaceBrowse
              loading={productsLoading}
              total={products?.total ?? null}
              onRetry={() => setProductReload((value) => value + 1)}
              page={products?.page ?? 1}
              totalPages={products?.totalPages ?? 1}
              error={productsError}
              onAddToCart={addProduct}
              onQueryChange={(next) =>
                setQuery({ ...next, page: next.page ?? 1 })
              }
              products={products?.data ?? []}
              query={query}
            />
          ) : null}
          {activeTab === "cart" ? (
            <CartView
              changes={cartChanges}
              onDismissChanges={() => setCartChanges([])}
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
            <OrdersView
              farmRepository={farms}
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

function toErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
