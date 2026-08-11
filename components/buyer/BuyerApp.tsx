"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuLeaf,
  LuPlus,
  LuShoppingCart,
  LuLogOut,
} from "react-icons/lu";
import type {
  ApiOrder,
  ApiPage,
  ApiPayment,
  BuyerProduct,
} from "@/lib/api/contracts.ts";
import { ApiError } from "@/lib/api/contracts.ts";
import type { BuyerRepository, ProductQuery } from "@/lib/buyer/buyer-repository.ts";
import {
  addCartItem,
  groupCartItemsByFarmer,
  removeCartGroup,
  type CartItem,
} from "@/lib/cart/cart.ts";
import type { BuyerSession } from "@/lib/auth/web-session.ts";
import { webSession } from "@/lib/auth/web-session.ts";
import { CheckoutPanel } from "./CheckoutPanel";

type BuyerRepositoryPort = Pick<
  BuyerRepository,
  | "createOrder"
  | "getCurrentBuyer"
  | "getProduct"
  | "initiatePayment"
  | "listOrders"
  | "listPayments"
  | "listProducts"
>;

type BuyerTab = "cart" | "marketplace" | "orders";

export function BuyerApp({
  repository,
  session,
  onLogout,
}: {
  repository: BuyerRepositoryPort;
  session: BuyerSession;
  onLogout: () => void;
}) {
  const [buyer, setBuyer] = useState<BuyerSession["user"] | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BuyerTab>("marketplace");
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
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    repository
      .getCurrentBuyer()
      .then((currentBuyer) => {
        if (!active) return;
        webSession.save({ accessToken: session.accessToken, user: currentBuyer });
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
  }, [onLogout, repository, session.accessToken]);

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
    let active = true;
    Promise.all([
      repository.listOrders({ limit: 20 }),
      repository.listPayments({ limit: 50 }),
    ])
      .then(([ordersResponse, paymentsResponse]) => {
        if (!active) return;
        setOrdersError(null);
        setOrders(ordersResponse.data);
        setPayments(paymentsResponse.data);
      })
      .catch((error: unknown) => {
        if (active) setOrdersError(toErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [activeTab, buyer, repository]);

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
              <LuLeaf size={22} className="logo-icon" />
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
          </nav>
          <div className="topbar-right">
            <span className="topbar-user-role">{buyer.email}</span>
            <button
              aria-label="Log out"
              className="topbar-icon-btn"
              onClick={onLogout}
              type="button"
            >
              <LuLogOut size={18} />
            </button>
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
              repository={repository}
            />
          ) : null}
          {activeTab === "orders" ? (
            <Orders error={ordersError} orders={orders} payments={payments} />
          ) : null}
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
  if (selectedProduct || detailError) {
    return (
      <section>
        <button className="pd-back-btn" onClick={onCloseDetail} type="button">
          Back to marketplace
        </button>
        {detailError ? <p role="alert">{detailError}</p> : null}
        {selectedProduct ? (
          <div className="pd-layout">
            <div className="pd-image"><LuLeaf className="leaf" size={100} /></div>
            <div className="pd-info">
              <h1>{selectedProduct.name}</h1>
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
                <LuShoppingCart size={20} /> Add to cart
              </button>
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
                <LuLeaf className="leaf" size={56} />
                <span className="mp-card-grade">Grade {product.qualityGrade ?? "N/A"}</span>
              </button>
              <div className="mp-card-body">
                <div className="mp-card-name">{product.name}</div>
                <div className="mp-card-footer">
                  <div className="mp-card-price">{product.price.toLocaleString()} PKR / {product.unit}</div>
                  <button
                    aria-label={`Add ${product.name} to cart`}
                    className="mp-add-btn"
                    disabled={product.status !== "active" || product.quantity < 1}
                    onClick={() => onAddToCart(product)}
                    type="button"
                  >
                    <LuPlus size={18} />
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
  repository,
}: {
  groups: ReturnType<typeof groupCartItemsByFarmer>;
  onConfirmedFarmers: (farmerIds: string[]) => void;
  repository: Pick<BuyerRepository, "createOrder" | "initiatePayment">;
}) {
  if (groups.length === 0) {
    return (
      <div className="cart-empty">
        <LuShoppingCart size={72} />
        <h2>Your cart is empty</h2>
        <p>Add active marketplace products to create separate farmer orders.</p>
      </div>
    );
  }

  return (
    <section>
      {groups.map((group, index) => (
        <article className="order-card" key={group.farmerId}>
          <h2>Farmer group {index + 1}</h2>
          {group.items.map((item) => (
            <div className="order-item-row" key={item.productId}>
              <span>{item.product.name} × {item.quantity}</span>
              <span>{item.product.price * item.quantity} PKR</span>
            </div>
          ))}
        </article>
      ))}
      <CheckoutPanel
        groups={groups}
        onConfirmedFarmers={onConfirmedFarmers}
        repository={repository}
      />
    </section>
  );
}

function Orders({
  error,
  orders,
  payments,
}: {
  error: string | null;
  orders: ApiOrder[] | null;
  payments: ApiPayment[] | null;
}) {
  if (error) return <p role="alert">{error}</p>;
  if (!orders || !payments) return <p>Loading orders and payments…</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <section className="orders-grid">
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div className="order-card-header">
            <div>
              <div className="order-card-id">Order {order.id}</div>
              <div className="order-card-date">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <span className="order-status processing">{order.status}</span>
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
          <p>
            Payment: {payments.find((payment) => payment.orderId === order.id)?.status ?? "not initiated"}
          </p>
        </article>
      ))}
    </section>
  );
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
