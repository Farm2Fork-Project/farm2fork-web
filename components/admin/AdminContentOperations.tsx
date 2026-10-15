"use client";
import Image from "next/image";
import { DeliveryRecovery } from "@/components/delivery/DeliveryRecovery";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  adminContentRepository,
  type AdminContentRepository,
  type AdminPerson,
  type AdminProduct,
  type AdminOrder,
  type AdminPost,
  type ContentQuery,
} from "@/lib/admin/admin-content-repository";
import {
  LoanRepository,
  LOAN_STATUSES,
  resolveApiUrl,
  type LoanApplication,
  type LoanStatus,
} from "@/lib/loans/loan-repository";
import type { Page } from "@/lib/admin/admin-repository";
import "./admin-operations.css";
import "./admin-content-operations.css";
const loansRepository = new LoanRepository();
const money = (value?: number) =>
  value === undefined
    ? "Not recorded"
    : new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 2,
      }).format(value);
const person = (value?: AdminPerson | string) =>
  typeof value === "string"
    ? value
    : value?.fullName || value?.email || value?._id || "Account unavailable";
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Request failed. Try again.";
function useRead<T>(read: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let current = true;
    async function load() {
      await Promise.resolve();
      if (!current) return;
      setLoading(true);
      setError('');
      try { const value = await read(); if (current) setData(value); }
      catch (error) { if (current) setError(errorText(error)); }
      finally { if (current) setLoading(false); }
    }
    void load();
    return () => {
      current = false;
    };
  }, [read, version]);
  return { data, error, loading, refresh };
}
function ReadState({
  state,
}: {
  state: { error: string; loading: boolean; refresh: () => void };
}) {
  return (
    <>
      {state.error ? (
        <div className="admin-alert" role="alert">
          {state.error}{" "}
          <button className="btn btn-secondary" onClick={state.refresh}>
            Retry
          </button>
        </div>
      ) : null}
      {state.loading ? <p role="status">Loading current records…</p> : null}
    </>
  );
}
function Pager({
  page,
  total,
  limit,
  change,
}: {
  page: number;
  total: number;
  limit: number;
  change: (page: number) => void;
}) {
  return (
    <nav className="admin-pager" aria-label="Results pages">
      <p>
        {total} records · Page {page} of {Math.max(1, Math.ceil(total / limit))}
      </p>
      <button
        className="btn btn-secondary"
        disabled={page <= 1}
        onClick={() => change(page - 1)}
      >
        Previous
      </button>
      <button
        className="btn btn-secondary"
        disabled={page * limit >= total}
        onClick={() => change(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
function Table({
  headings,
  children,
}: {
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function ListTools({
  query,
  setQuery,
  states,
  placeholder,
  refresh,
  showVisibility = false,
  showAssignment = false,
}: {
  showVisibility?: boolean;
  showAssignment?: boolean;
  query: ContentQuery;
  setQuery: (value: ContentQuery) => void;
  states: string[];
  placeholder: string;
  refresh: () => void;
}) {
  const [search, setSearch] = useState(query.search ?? "");
  return (
    <form
      className="admin-toolbar"
      onSubmit={(event) => {
        event.preventDefault();
        setQuery({ ...query, search, page: 1 });
      }}
    >
      <label>
        Search
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
        />
      </label>
      <label>
        Status
        <select
          value={query.status ?? ""}
          onChange={(event) =>
            setQuery({ ...query, status: event.target.value, page: 1 })
          }
        >
          <option value="">All statuses</option>
          {states.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      {showVisibility ? <label>
        Visibility
        <select
          value={query.visibility ?? ""}
          onChange={(event) =>
            setQuery({ ...query, visibility: event.target.value, page: 1 })
          }
        >
          <option value="">All visibility</option>
          <option value="visible">Not hidden</option>
          <option value="hidden">Hidden by admin</option>
        </select>
      </label> : null}
      {showAssignment ? <label>Delivery status<select value={query.deliveryIssue ?? ''} onChange={event => setQuery({...query, deliveryIssue: (event.target.value || undefined) as ContentQuery['deliveryIssue'], page: 1})}><option value="">All deliveries</option><option value="active">Active commitments</option><option value="unresolved">Needs resolution</option><option value="resolved">Resolved issues</option></select></label> : null}
      {showAssignment ? <label>Driver assignment<select value={query.assignment ?? ''} onChange={event => setQuery({ ...query, assignment: event.target.value as ContentQuery['assignment'], page: 1 })}><option value="">All assignments</option><option value="unassigned">Unassigned</option><option value="assigned">Assigned</option></select></label> : null}
      <button className="btn btn-primary" type="submit">
        Search
      </button>
      <button className="btn btn-secondary" type="button" onClick={refresh}>
        Refresh
      </button>
    </form>
  );
}
function VisibilityAction({
  kind,
  id,
  hidden,
  repository,
  onSaved,
  noun,
}: {
  kind: "products" | "community/posts" | "community/comments";
  id: string;
  hidden: boolean;
  repository: AdminContentRepository;
  onSaved: () => void;
  noun: string;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  return (
    <form
      className="admin-content-action"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy.current) return;
        busy.current = true;
        setPending(true);
        setError("");
        try {
          await repository.visibility(kind, id, !hidden, reason.trim());
          setReason("");
          onSaved();
        } catch (error) {
          setError(errorText(error));
        } finally {
          busy.current = false;
          setPending(false);
        }
      }}
    >
      <label>
        Reason for visibility change
        <textarea
          minLength={5}
          maxLength={500}
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <p className="admin-muted">
        {hidden
          ? "Restore visibility. The owner’s listing status stays unchanged."
          : "Hide this content from the public. The original content stays available for review."}
      </p>
      {error ? (
        <p className="admin-alert" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="btn btn-secondary"
        disabled={pending || reason.trim().length < 5}
      >
        {pending ? "Saving…" : `${hidden ? "Restore" : "Hide"} ${noun}`}
      </button>
    </form>
  );
}
export function ProductsScreen({
  repository = adminContentRepository, initialQuery,
}: {
  repository?: AdminContentRepository; initialQuery?: ContentQuery;
}) {
  const [query, setQuery] = useState<ContentQuery>(initialQuery ?? { page: 1 });
  const [selected, setSelected] = useState("");
  const list = useRead(
    useCallback(() => repository.products(query), [repository, query]),
  );
  return (
    <div className="admin-operations">
      <ListTools
        query={query}
        setQuery={(value) => {
          setQuery(value);
          setSelected("");
        }}
        states={["active", "inactive", "sold_out"]}
        placeholder="Product or category"
        refresh={list.refresh}
        showVisibility
      />
      <ReadState state={list} />
      {list.data ? (
        <>
          <Table
            headings={[
              "Product",
              "Farmer",
              "Price / stock",
              "Visibility",
              "Inspect",
            ]}
          >
            {list.data.items.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.name}
                  <p>{p.category}</p>
                </td>
                <td>{person(p.farmerId)}</td>
                <td>
                  {money(p.price)} / {p.unit}
                  <p>
                    {p.quantity} {p.unit}
                  </p>
                </td>
                <td>
                  {p.adminHidden ? "Hidden by admin" : "Not hidden"}
                  <p>{p.status.replaceAll("_", " ")}</p>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelected(p.id)}
                    aria-label={`Inspect ${p.name}`}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          {!list.data.items.length && !list.loading ? (
            <p className="admin-empty">No products match these filters.</p>
          ) : null}
          <Pager
            {...list.data}
            change={(page) => {
              setQuery({ ...query, page });
              setSelected("");
            }}
          />
        </>
      ) : null}
      {selected ? (
        <ProductDetail
          key={selected}
          id={selected}
          repository={repository}
          onSaved={list.refresh}
          close={() => setSelected("")}
        />
      ) : null}
    </div>
  );
}
function ContentImages({ images }: { images?: string[] }) {
  return images?.length ? (
    <div className="admin-content-images">
      {images.map((src, index) => (
        <a
          key={src + index}
          href={resolveApiUrl(src)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={resolveApiUrl(src)}
            alt={`Content image ${index + 1}`}
            width={280}
            height={180}
            unoptimized
          />
        </a>
      ))}
    </div>
  ) : null;
}
function ProductDetail({
  id,
  repository,
  onSaved,
  close,
}: {
  id: string;
  repository: AdminContentRepository;
  onSaved: () => void;
  close: () => void;
}) {
  const detail = useRead(
    useCallback(() => repository.product(id), [repository, id]),
  );
  const [success, setSuccess] = useState("");
  const p: AdminProduct | undefined = detail.data;
  return (
    <section className="admin-section" aria-label="Product detail">
      <div className="admin-toolbar">
        <h2>{p?.name ?? "Product details"}</h2>
        <button className="btn btn-secondary" onClick={close}>
          Close details
        </button>
      </div>
      <ReadState state={detail} />
      {success ? <p role="status">{success}</p> : null}
      {p ? (
        <>
          <p>{p.description || "No description provided."}</p>
          <ContentImages images={p.images} />
          <dl className="admin-summary">
            <div>
              <dt>Product ID</dt>
              <dd>{p.id}</dd>
            </div>
            <div>
              <dt>Farmer</dt>
              <dd>{person(p.farmerId)}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>{p.adminHidden ? "Hidden by admin" : "Not hidden"}</dd>
            </div>
            <div>
              <dt>Owner status</dt>
              <dd>{p.status}</dd>
            </div>
            <div>
              <dt>Grade</dt>
              <dd>{p.qualityGrade ?? "Not recorded"}</dd>
            </div>
          </dl>
          <VisibilityAction
            key={`${p.id}-${p.adminHidden}`}
            kind="products"
            id={id}
            hidden={!!p.adminHidden}
            repository={repository}
            noun="product"
            onSaved={() => {
              setSuccess("Product visibility saved.");
              detail.refresh();
              onSaved();
            }}
          />
        </>
      ) : null}
    </section>
  );
}
export function OrdersScreen({
  repository = adminContentRepository,
  initialQuery,
  renderRecovery,
}: {
  repository?: AdminContentRepository;
  renderRecovery?: (order: AdminOrder, refresh: () => void) => ReactNode;
  initialQuery?: ContentQuery;
}) {
  const [query, setQuery] = useState<ContentQuery>(initialQuery ?? { page: 1 });
  const [selected, setSelected] = useState("");
  const list = useRead(
    useCallback(() => repository.orders(query), [repository, query]),
  );
  return (
    <div className="admin-operations">
      <ListTools
        query={query}
        setQuery={(value) => {
          setQuery(value);
          setSelected("");
        }}
        states={[
          "pending",
          "paid",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ]}
        showAssignment
        placeholder="Order, buyer or farmer ID, or product"
        refresh={list.refresh}
      />
      <ReadState state={list} />
      {list.data ? (
        <>
          <Table
            headings={["Order", "Buyer / farmer", "Status", "Total", "Inspect"]}
          >
            {list.data.items.map((o) => (
              <tr key={o.id}>
                <td>
                  {o.id}
                  <p>{o.items.map((i) => i.productName).join(", ")}</p>
                </td>
                <td>
                  {person(o.buyerId)}
                  <p>{person(o.farmerId)}</p>
                </td>
                <td>{o.status}{typeof o.shipmentId === "object" && o.shipmentId?.status === "failed" && <p>{o.shipmentId.issue?.resolvedAt ? "Delivery issue resolved" : "Delivery needs resolution"}{o.shipmentId.issue?.reason ? ` · ${o.shipmentId.issue.reason.replaceAll("_", " ")}` : ""}</p>}</td>
                <td>{money(o.grandTotal)}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelected(o.id)}
                    aria-label={`Inspect order ${o.id}`}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          {!list.data.items.length && !list.loading ? (
            <p className="admin-empty">No orders match these filters.</p>
          ) : null}
          <Pager
            {...list.data}
            change={(page) => {
              setQuery({ ...query, page });
              setSelected("");
            }}
          />
        </>
      ) : null}
      {selected ? (
        <OrderDetail
          key={selected}
          id={selected}
          repository={repository}
          close={() => setSelected("")}
          renderRecovery={renderRecovery}
        />
      ) : null}
    </div>
  );
}
function OrderDetail({
  id,
  repository,
  close,
  renderRecovery,
}: {
  id: string;
  repository: AdminContentRepository;
  close: () => void;
  renderRecovery?: (order: AdminOrder, refresh: () => void) => ReactNode;
}) {
  const state = useRead(
    useCallback(() => repository.order(id), [repository, id]),
  );
  return (
    <section className="admin-section" aria-label="Order detail">
      <div className="admin-toolbar">
        <h2>Order details</h2>
        <button className="btn btn-secondary" onClick={close}>
          Close details
        </button>
      </div>
      <ReadState state={state} />
      {state.data ? (
        <>
          <OrderDetails order={state.data} />
          {renderRecovery ? (
            renderRecovery(state.data, state.refresh)
          ) : typeof state.data.shipmentId === "object" ? (
            <DeliveryRecovery
              key={state.data.shipmentId._id}
              shipment={{
                id: state.data.shipmentId._id,
                status: state.data.shipmentId.status,
                transporterId:
                  typeof state.data.shipmentId.transporterId === "string"
                    ? state.data.shipmentId.transporterId
                    : (state.data.shipmentId.transporterId?._id ?? ""),
                statusHistory: state.data.shipmentId.statusHistory ?? [],
                issue: state.data.shipmentId.issue,
              }}
              onUpdated={state.refresh}
            />
          ) : null}
          <ExternalRefund
            key={id}
            order={state.data}
            repository={repository}
            onSaved={state.refresh}
          />
        </>
      ) : null}
    </section>
  );
}
export function OrderDetails({ order: o }: { order: AdminOrder }) {
  const payment = typeof o.paymentId === "object" ? o.paymentId : undefined;
  const shipment = typeof o.shipmentId === "object" ? o.shipmentId : undefined;
  return (
    <>
      <dl className="admin-summary">
        <div>
          <dt>Order</dt>
          <dd>{o.id}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{o.status}</dd>
        </div>
        <div>
          <dt>Buyer</dt>
          <dd>{person(o.buyerId)}</dd>
        </div>
        <div>
          <dt>Farmer</dt>
          <dd>{person(o.farmerId)}</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>
            {payment
              ? `${payment.status} · ${payment.gateway} · ${money(payment.amount)}`
              : "No payment recorded"}
          </dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{shipment?.status ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt>Transporter</dt>
          <dd>{shipment ? person(shipment.transporterId) : "Unassigned"}</dd>
        </div>
        <div>
          <dt>Delivery completion</dt>
          <dd>
            {shipment?.actualDelivery
              ? `Completion recorded ${shipment.actualDelivery}`
              : "No completion recorded"}
          </dd>
        </div>
      </dl>
      <h3>Order-time fee snapshot</h3>
      <dl className="admin-summary">
        <div>
          <dt>Produce</dt>
          <dd>{money(o.totalAmount)}</dd>
        </div>
        <div>
          <dt>Platform fee ({o.platformFeePercent}%)</dt>
          <dd>{money(o.platformFeeAmount)}</dd>
        </div>
        <div>
          <dt>Delivery fee</dt>
          <dd>{money(o.deliveryFee)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{money(o.grandTotal)}</dd>
        </div>
      </dl>
      <Table headings={["Product", "Quantity", "Unit price", "Subtotal"]}>
        {o.items.map((i, index) => (
          <tr key={index}>
            <td>{i.productName}</td>
            <td>{i.quantity}</td>
            <td>{money(i.unitPrice)}</td>
            <td>{money(i.subtotal)}</td>
          </tr>
        ))}
      </Table>
      <h3>Delivery address</h3>
      <p>
        {[
          o.shippingAddress?.street,
          o.shippingAddress?.city,
          o.shippingAddress?.province,
        ]
          .filter(Boolean)
          .join(", ") || "Not recorded"}
      </p>
      <h3>Delivery timeline</h3>
      {shipment?.statusHistory?.length ? (
        <ol className="admin-content-timeline">
          {shipment.statusHistory.map((event, index) => (
            <li key={index}>
              <strong>{event.status.replaceAll("_", " ")}</strong> ·{" "}
              <time>{event.timestamp}</time>
              {event.note ? <p>{event.note}</p> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p>No delivery history recorded.</p>
      )}
      {shipment?.issue ? (
        <div className="admin-alert">
          <h3>Delivery issue</h3>
          <p>
            {shipment.issue.reason.replaceAll("_", " ")} ·{" "}
            {shipment.issue.stage} · {shipment.issue.reportedAt}
          </p>
          {shipment.issue.note ? <p>{shipment.issue.note}</p> : null}
          <p>
            {shipment.issue.resolvedAt
              ? `Resolved ${shipment.issue.resolvedAt} · ${shipment.issue.resolution ?? ""}`
              : "Requires operational resolution"}
          </p>
        </div>
      ) : null}
      {shipment?.assignmentHistory?.length ? (
        <>
          <h3>Assignment history</h3>
          <ol className="admin-content-timeline">
            {shipment.assignmentHistory.map((assignment, index) => (
              <li key={index}>
                <p>
                  {assignment.timestamp} · Transporter{" "}
                  {assignment.transporterId}
                </p>
                <p>
                  {assignment.reason} · Administrator {assignment.assignedBy}
                </p>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </>
  );
}
function ExternalRefund({
  order,
  repository,
  onSaved,
}: {
  order: AdminOrder;
  repository: AdminContentRepository;
  onSaved: () => void;
}) {
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const request = useRef("");
  const busy = useRef(false);
  const payment = typeof order.paymentId === 'object' ? order.paymentId : undefined;
  const evidence = useRead(useCallback(() => repository.refund(order.id), [repository, order.id]));
  if (evidence.data) return <section aria-label="External refund evidence"><h3>External refund recorded</h3><dl className="admin-summary"><div><dt>Amount returned</dt><dd>{money(evidence.data.amount)}</dd></div><div><dt>External reference</dt><dd>{evidence.data.reference}</dd></div><div><dt>Actual payment date</dt><dd>{evidence.data.paidAt}</dd></div><div><dt>Recorded by</dt><dd>{evidence.data.recordedBy}</dd></div><div><dt>Recorded at</dt><dd>{evidence.data.createdAt}</dd></div></dl></section>;
  if (evidence.error || evidence.loading) return <ReadState state={evidence} />;
  if (payment?.status === 'refunded') return <p>Payment is marked refunded. No external refund evidence is recorded here; reconcile the actual transfer before treating it as returned money.</p>;
  if (order.status !== 'cancelled' || payment?.status !== 'success') return null;
  return (
    <form
      className="admin-content-action"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!confirmed || busy.current) return;
        busy.current = true;
        setPending(true);
        setError("");
        request.current ||= crypto.randomUUID();
        try {
          const result = await repository.recordRefund(order.id, {
            amount: payment.amount,
            reference,
            paidAt: new Date(date).toISOString(),
            reason,
            requestId: request.current,
          });
          evidence.refresh();
          setSaved(
            `External refund recorded: ${result.reference} · ${money(result.amount)} · ${result.paidAt}`,
          );
          onSaved();
        } catch (error) {
          setError(errorText(error));
        } finally {
          busy.current = false;
          setPending(false);
        }
      }}
    >
      <h3>Record external refund</h3>
      <p>
        This records money already returned outside Farm2Fork. It does not send
        money. Resolve delivery custody and return goods before recording the
        full {money(payment.amount)} refund.
      </p>
      <label>
        External refund reference
        <input
          value={reference}
          onChange={(event) => {
            setReference(event.target.value);
            request.current = "";
          }}
          required
          maxLength={160}
        />
      </label>
      <label>
        Actual refund date
        <input
          type="datetime-local"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            request.current = "";
          }}
          required
        />
      </label>
      <label>
        Refund reason
        <textarea
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            request.current = "";
          }}
          required
          minLength={5}
          maxLength={500}
        />
      </label>
      <label className="admin-content-check">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        I confirm the full amount was actually returned and the reference is
        evidence of that transfer.
      </label>
      {error ? (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      ) : null}
      {saved ? <p role="status">{saved}</p> : null}
      <button className="btn btn-primary" disabled={pending || !confirmed}>
        {pending ? "Recording…" : "Record external refund"}
      </button>
    </form>
  );
}
export function ModerationScreen({
  repository = adminContentRepository,
}: {
  repository?: AdminContentRepository;
}) {
  const [query, setQuery] = useState<ContentQuery>({ page: 1 });
  const [selected, setSelected] = useState("");
  const list = useRead(
    useCallback(() => repository.posts(query), [repository, query]),
  );
  return (
    <div className="admin-operations">
      <p>
        Review published and removed community posts. This view contains actual
        community content; user reports are not collected by the current
        service.
      </p>
      <ListTools
        query={query}
        setQuery={(value) => {
          setQuery(value);
          setSelected("");
        }}
        states={["published", "removed"]}
        placeholder="Post title or content"
        refresh={list.refresh}
      />
      <ReadState state={list} />
      {list.data ? (
        <>
          <Table headings={["Post", "Author", "Status / comments", "Inspect"]}>
            {list.data.items.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.title}
                  <p>{p.tags?.map((tag) => `#${tag}`).join(" ")}</p>
                </td>
                <td>{person(p.authorId)}</td>
                <td>
                  {p.status}
                  <p>{p.commentCount} active comments</p>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    aria-label={`Inspect ${p.title}`}
                    onClick={() => setSelected(p.id)}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          {!list.data.items.length && !list.loading ? (
            <p className="admin-empty">
              No community posts match these filters.
            </p>
          ) : null}
          <Pager
            {...list.data}
            change={(page) => {
              setQuery({ ...query, page });
              setSelected("");
            }}
          />
        </>
      ) : null}
      {selected ? (
        <PostDetail
          key={selected}
          id={selected}
          repository={repository}
          close={() => setSelected("")}
          onSaved={list.refresh}
        />
      ) : null}
    </div>
  );
}
function PostDetail({
  id,
  repository,
  close,
  onSaved,
}: {
  id: string;
  repository: AdminContentRepository;
  close: () => void;
  onSaved: () => void;
}) {
  const state = useRead(
    useCallback(() => repository.post(id), [repository, id]),
  );
  const [success, setSuccess] = useState("");
  const p: AdminPost | undefined = state.data;
  const saved = () => {
    setSuccess("Community visibility saved.");
    state.refresh();
    onSaved();
  };
  return (
    <section className="admin-section" aria-label="Community post detail">
      <div className="admin-toolbar">
        <h2>{p?.title ?? "Community post"}</h2>
        <button className="btn btn-secondary" onClick={close}>
          Close details
        </button>
      </div>
      <ReadState state={state} />
      {success ? <p role="status">{success}</p> : null}
      {p ? (
        <>
          <p>
            By {person(p.authorId)} · {p.status}
          </p>
          <p className="admin-content-copy">{p.content}</p>
          <ContentImages images={p.images} />
          <VisibilityAction
            key={`${p.id}-${p.status}`}
            kind="community/posts"
            id={id}
            hidden={p.status === "removed"}
            repository={repository}
            noun="post"
            onSaved={saved}
          />
          <h3>Comments</h3>
          <p className="admin-muted">
            Showing the latest {p.commentsLimit ?? 100} comments, including
            removed comments.
          </p>
          {p.comments?.length ? (
            p.comments.map((comment) => (
              <article className="admin-content-comment" key={comment.id}>
                <p>
                  <strong>{person(comment.authorId)}</strong> · {comment.status}
                </p>
                <p className="admin-content-copy">{comment.content}</p>
                <details>
                  <summary>Change comment visibility</summary>
                  <VisibilityAction
                    key={`${comment.id}-${comment.status}`}
                    kind="community/comments"
                    id={comment.id}
                    hidden={comment.status === "removed"}
                    repository={repository}
                    noun="comment"
                    onSaved={saved}
                  />
                </details>
              </article>
            ))
          ) : (
            <p>No comments recorded.</p>
          )}
        </>
      ) : null}
    </section>
  );
}
export function LoansScreen({
  repository = loansRepository,
}: {
  repository?: LoanRepository;
}) {
  const [query, setQuery] = useState<ContentQuery>({ page: 1 });
  const [selected, setSelected] = useState("");
  const list = useRead(
    useCallback(async () => {
      const page = await repository.list(
        (query.status as LoanStatus | undefined) || undefined,
        query.page,
      );
      return { ...page, items: page.data } as Page<LoanApplication>;
    }, [repository, query]),
  );
  return (
    <div className="admin-operations">
      <div className="admin-toolbar">
        <label>
          Loan status
          <select
            value={query.status ?? ""}
            onChange={(event) => {
              setQuery({ page: 1, status: event.target.value });
              setSelected("");
            }}
          >
            <option value="">All statuses</option>
            {LOAN_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" onClick={list.refresh}>
          Refresh
        </button>
      </div>
      <ReadState state={list} />
      {list.data ? (
        <>
          <Table
            headings={[
              "Applicant",
              "Purpose",
              "Amount / term",
              "Status",
              "Inspect",
            ]}
          >
            {list.data.items.map((loan) => (
              <tr key={loan.id}>
                <td>
                  {loan.applicant?.farmName || loan.applicantId}
                  <p>{loan.applicant?.city}</p>
                </td>
                <td>{loan.purpose}</td>
                <td>
                  {money(loan.amount)}
                  <p>{loan.durationMonths} months</p>
                </td>
                <td>{loan.status.replaceAll("_", " ")}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelected(loan.id)}
                    aria-label={`Inspect ${loan.applicant?.farmName || loan.applicantId}`}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          {!list.data.items.length && !list.loading ? (
            <p className="admin-empty">
              No loan applications match this status.
            </p>
          ) : null}
          <Pager
            {...list.data}
            change={(page) => {
              setQuery({ ...query, page });
              setSelected("");
            }}
          />
        </>
      ) : null}
      {selected ? (
        <LoanDetail
          key={selected}
          id={selected}
          repository={repository}
          close={() => setSelected("")}
          onSaved={list.refresh}
        />
      ) : null}
    </div>
  );
}
function LoanDetail({
  id,
  repository,
  close,
  onSaved,
}: {
  id: string;
  repository: LoanRepository;
  close: () => void;
  onSaved: () => void;
}) {
  const state = useRead(
    useCallback(() => repository.get(id), [repository, id]),
  );
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [repayment, setRepayment] = useState<number>();
  const busy = useRef(false);
  const loan = state.data;
  async function act(
    operation: () => Promise<LoanApplication>,
    message: string,
  ) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await operation();
      setSuccess(message);
      setRepayment(undefined);
      state.refresh();
      onSaved();
    } catch (error) {
      setError(errorText(error));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <section className="admin-section" aria-label="Loan application detail">
      <div className="admin-toolbar">
        <h2>Loan application</h2>
        <button
          className="btn btn-secondary"
          disabled={pending}
          onClick={close}
        >
          Close details
        </button>
      </div>
      <ReadState state={state} />
      {error ? (
        <p role="alert" className="admin-alert">
          {error} Refresh the application to see any competing decision.
        </p>
      ) : null}
      {success ? <p role="status">{success}</p> : null}
      {loan ? (
        <>
          <dl className="admin-summary">
            <div>
              <dt>Application ID</dt>
              <dd>{loan.id}</dd>
            </div>
            <div>
              <dt>Applicant</dt>
              <dd>{loan.applicant?.farmName || loan.applicantId}</dd>
            </div>
            <div>
              <dt>Requested</dt>
              <dd>
                {money(loan.amount)} · {loan.durationMonths} months
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{loan.status.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt>Farm</dt>
              <dd>
                {[loan.applicant?.city, loan.applicant?.province]
                  .filter(Boolean)
                  .join(", ") || "Location not recorded"}
              </dd>
            </div>
            <div>
              <dt>Land</dt>
              <dd>
                {loan.applicant?.landSizeAcres === undefined
                  ? "Not recorded"
                  : `${loan.applicant.landSizeAcres} acres`}
              </dd>
            </div>
            <div>
              <dt>Delivered orders</dt>
              <dd>{loan.applicant?.deliveredOrders ?? "Not recorded"}</dd>
            </div>
          </dl>
          <p className="admin-content-copy">{loan.purpose}</p>
          {loan.reviewNote ? <p>Decision reason: {loan.reviewNote}</p> : null}
          <h3>Private application documents</h3>
          <p className="admin-muted">
            Links expire. Refresh this application to request fresh links.
          </p>
          {loan.documents?.length ? (
            <ul>
              {loan.documents.map((document) => (
                <li key={document.index}>
                  <a
                    href={resolveApiUrl(document.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Document {document.index + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              {loan.documentCount
                ? "Documents are unavailable. Refresh the application."
                : "No documents submitted."}
            </p>
          )}
          <button
            className="btn btn-secondary"
            disabled={pending || state.loading}
            onClick={state.refresh}
          >
            Refresh application
          </button>
          {loan.status === "pending" ? (
            <p>
              <button
                className="btn btn-primary"
                disabled={pending || state.loading}
                onClick={() =>
                  act(
                    () => repository.startReview(id),
                    "Application moved into review.",
                  )
                }
              >
                {pending ? "Saving…" : "Start review"}
              </button>
            </p>
          ) : null}
          {loan.status === "under_review" ? (
            <div className="admin-content-action">
              <label>
                Reason for loan decision
                <textarea
                  minLength={5}
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
              <p className="admin-muted">
                Approval creates the service’s repayment schedule. Rejection
                records the reason for the applicant.
              </p>
              <div className="admin-toolbar">
                <button
                  className="btn btn-primary"
                  disabled={pending || state.loading || note.trim().length < 5}
                  onClick={() =>
                    act(
                      () => repository.decide(id, "approved", note.trim()),
                      "Loan approved. Repayment schedule refreshed.",
                    )
                  }
                >
                  Approve loan
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={pending || state.loading || note.trim().length < 5}
                  onClick={() =>
                    act(
                      () => repository.decide(id, "rejected", note.trim()),
                      "Loan rejected with your reason.",
                    )
                  }
                >
                  Reject loan
                </button>
              </div>
            </div>
          ) : null}
          <h3>Repayment schedule</h3>
          {loan.repaymentSchedule.length ? (
            <Table headings={["Instalment", "Due date", "Amount", "Payment"]}>
              {loan.repaymentSchedule.map((instalment) => (
                <tr key={instalment.index}>
                  <td>{instalment.index + 1}</td>
                  <td>{instalment.dueDate}</td>
                  <td>{money(instalment.amount)}</td>
                  <td>
                    {instalment.isPaid ? (
                      `Paid${instalment.paidAt ? ` · ${instalment.paidAt}` : ""}`
                    ) : loan.status === "approved" ? (
                      <button
                        className="btn btn-secondary"
                        disabled={pending || state.loading}
                        onClick={() => setRepayment(instalment.index)}
                      >
                        Record instalment {instalment.index + 1} paid
                      </button>
                    ) : (
                      "Unpaid"
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <p>No repayment schedule created.</p>
          )}
          {repayment !== undefined ? (
            <div className="admin-content-action">
              <p>
                Confirm instalment {repayment + 1} has actually been received.
                This records repayment; it does not collect money.
              </p>
              <div className="admin-toolbar">
                <button
                  className="btn btn-secondary"
                  disabled={pending}
                  onClick={() => setRepayment(undefined)}
                >
                  Cancel repayment record
                </button>
                <button
                  className="btn btn-primary"
                  disabled={pending || state.loading}
                  onClick={() =>
                    act(
                      () => repository.markInstalmentPaid(id, repayment),
                      "Repayment recorded. Schedule refreshed.",
                    )
                  }
                >
                  {pending ? "Recording…" : "Confirm repayment received"}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
