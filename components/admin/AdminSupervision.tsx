"use client";
import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/lib/api/contracts";
import {
  adminSupervisionRepository,
  type AdminSupervisionRepository,
  type RateListDetail,
  type ReportGroup,
  type ReportStatus,
} from "@/lib/admin/admin-supervision-repository";
import type { AdminPerson } from "@/lib/admin/admin-content-repository";
import { resolveApiUrl } from "@/lib/loans/loan-repository";
import {
  Pager,
  ReadState,
  Table,
  errorText,
  useRead,
} from "./AdminContentOperations";
import "./admin-operations.css";
import "./admin-content-operations.css";
import "./admin-supervision.css";

const person = (value?: AdminPerson | string) =>
  typeof value === "string"
    ? value
    : value?.fullName || value?.email || value?._id || "Account unavailable";
const rupees = (value: number) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value);
const day = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
const today = () => new Date().toISOString().slice(0, 10);

const RATE_TEMPLATE =
  "commodity,unit,min,max,fqp\nWheat,100kg,9800,10400,10100\nPotato,100kg,4500,6200,5400\nMango (Chaunsa),100kg,14000,22000,18000\n";

/** A reason plus one or two decisions; every admin change carries a reason. */
function ReasonedAction({
  label,
  hint,
  actions,
  onDone,
}: {
  label: string;
  hint?: string;
  actions: { text: string; primary?: boolean; run: (reason: string) => Promise<unknown> }[];
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const act = async (run: (reason: string) => Promise<unknown>) => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      await run(reason.trim());
      setReason("");
      onDone();
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return (
    <div className="admin-content-action">
      <label>
        {label}
        <textarea
          minLength={5}
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      {hint ? <p className="admin-muted">{hint}</p> : null}
      {error ? (
        <p className="admin-alert" role="alert">
          {error}
        </p>
      ) : null}
      <div className="admin-supervision-buttons">
        {actions.map((action) => (
          <button
            key={action.text}
            type="button"
            className={action.primary ? "btn btn-primary" : "btn btn-secondary"}
            disabled={pending || reason.trim().length < 5}
            onClick={() => void act(action.run)}
          >
            {pending ? "Saving…" : action.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Rate lists ---------------------------------------------------------------

function RateListUploadForm({
  repository,
  onUploaded,
}: {
  repository: AdminSupervisionRepository;
  onUploaded: (list: RateListDetail) => void;
}) {
  const [tradingDate, setTradingDate] = useState(today());
  const [market, setMarket] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("http://www.amis.pk");
  const [file, setFile] = useState<File>();
  const [scan, setScan] = useState<File>();
  const [problems, setProblems] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const template = `data:text/csv;charset=utf-8,${encodeURIComponent(RATE_TEMPLATE)}`;
  return (
    <section className="admin-section" aria-labelledby="rate-upload-title">
      <h2 id="rate-upload-title">Upload a rate list</h2>
      <p className="admin-muted">
        One file per market and trading day, as a CSV with the columns
        commodity, unit, min, max and fqp (optional). Units: kg, 40kg, 100kg,
        ton, dozen, piece or litre.{" "}
        <a href={template} download="rate-list-template.csv">
          Download a template
        </a>
        . The upload is saved as a draft; nothing reaches members until you
        publish it.
      </p>
      <form
        ref={form}
        onSubmit={async (event) => {
          event.preventDefault();
          if (!file || pending) return;
          setPending(true);
          setProblems([]);
          try {
            const list = await repository.uploadRateList({
              file,
              document: scan,
              tradingDate,
              market: market.trim(),
              source: source.trim(),
              sourceUrl: sourceUrl.trim(),
            });
            form.current?.reset();
            setFile(undefined);
            setScan(undefined);
            setMarket("");
            onUploaded(list);
          } catch (failure) {
            const body =
              failure instanceof ApiError
                ? (failure.body as { errors?: unknown } | undefined)
                : undefined;
            const lines = Array.isArray(body?.errors)
              ? body.errors.filter((e): e is string => typeof e === "string")
              : [];
            setProblems(lines.length ? lines : [errorText(failure)]);
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="admin-config-fields">
          <label>
            Trading date
            <input
              type="date"
              required
              max={today()}
              value={tradingDate}
              onChange={(event) => setTradingDate(event.target.value)}
            />
          </label>
          <label>
            Market
            <input
              required
              maxLength={60}
              placeholder="Lahore"
              value={market}
              onChange={(event) => setMarket(event.target.value)}
            />
          </label>
          <label>
            Issued by
            <input
              required
              maxLength={120}
              placeholder="Market Committee Lahore"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </label>
          <label>
            Source web address
            <input
              type="url"
              required
              maxLength={300}
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
            />
          </label>
          <label>
            Rate list (CSV)
            <input
              type="file"
              required
              accept=".csv,text/csv"
              onChange={(event) => setFile(event.target.files?.[0])}
            />
          </label>
          <label>
            Scan of the official list (optional, PDF or image)
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setScan(event.target.files?.[0])}
            />
          </label>
        </div>
        {problems.length ? (
          <div className="admin-alert" role="alert">
            <p>
              <strong>The file was not saved.</strong> Fix these and upload
              again:
            </p>
            <ul>
              {problems.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <button className="btn btn-primary" disabled={!file || pending}>
          {pending ? "Checking the file…" : "Upload as draft"}
        </button>
      </form>
    </section>
  );
}

function RateListDetailPanel({
  id,
  repository,
  close,
  onSaved,
}: {
  id: string;
  repository: AdminSupervisionRepository;
  close: () => void;
  onSaved: () => void;
}) {
  const state = useRead(
    useCallback(() => repository.rateList(id), [repository, id]),
  );
  const list = state.data;
  const saved = () => {
    state.refresh();
    onSaved();
  };
  return (
    <section className="admin-section" aria-labelledby="rate-detail-title">
      <div className="admin-toolbar">
        <h2 id="rate-detail-title">
          {list ? `${list.market}, ${day(list.tradingDate)}` : "Rate list"}
        </h2>
        <button className="btn btn-secondary" onClick={close}>
          Close
        </button>
      </div>
      <ReadState state={state} />
      {list ? (
        <>
          <dl className="admin-summary">
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`rate-status rate-status-${list.status}`}>
                  {list.status}
                </span>
              </dd>
            </div>
            <div>
              <dt>Issued by</dt>
              <dd>{list.source}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                <a href={list.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {list.sourceUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt>File</dt>
              <dd>{list.fileName ?? "Not recorded"}</dd>
            </div>
            {list.documentUrl ? (
              <div>
                <dt>Official scan</dt>
                <dd>
                  <a
                    href={resolveApiUrl(list.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open the scan
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          <Table headings={["Commodity", "Unit", "Min (Rs)", "Max (Rs)", "Fair price (Rs)"]}>
            {list.entries.map((entry) => (
              <tr key={`${entry.commodity}-${entry.unit}`}>
                <td>{entry.commodity}</td>
                <td>{entry.unit}</td>
                <td>{rupees(entry.minPrice)}</td>
                <td>{rupees(entry.maxPrice)}</td>
                <td>{entry.fairPrice != null ? rupees(entry.fairPrice) : "—"}</td>
              </tr>
            ))}
          </Table>
          {list.status === "published" ? (
            <ReasonedAction
              label="Reason for withdrawing"
              hint="Withdraw a list that turned out to be wrong. Members stop seeing it and it no longer backs price references."
              actions={[
                {
                  text: "Withdraw this list",
                  run: (reason) =>
                    repository.setRateListStatus(list.id, "withdrawn", reason),
                },
              ]}
              onDone={saved}
            />
          ) : (
            <ReasonedAction
              label="What did you check it against?"
              hint="Publishing shows this list to every member and uses it for farmers' price references for the next 30 days."
              actions={[
                {
                  text: "Publish to members",
                  primary: true,
                  run: (reason) =>
                    repository.setRateListStatus(list.id, "published", reason),
                },
              ]}
              onDone={saved}
            />
          )}
        </>
      ) : null}
    </section>
  );
}

export function RateListsScreen({
  repository = adminSupervisionRepository,
}: {
  repository?: AdminSupervisionRepository;
}) {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const list = useRead(
    useCallback(
      () => repository.rateLists({ status, page }),
      [repository, status, page],
    ),
  );
  return (
    <div className="admin-operations">
      <RateListUploadForm
        repository={repository}
        onUploaded={(uploaded) => {
          setSelected(uploaded.id);
          list.refresh();
        }}
      />
      {selected ? (
        <RateListDetailPanel
          key={selected}
          id={selected}
          repository={repository}
          close={() => setSelected("")}
          onSaved={list.refresh}
        />
      ) : null}
      <div className="admin-toolbar">
        <h2>Uploaded lists</h2>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </label>
        <button className="btn btn-secondary" onClick={list.refresh}>
          Refresh
        </button>
      </div>
      <ReadState state={list} />
      {list.data ? (
        <>
          <Table headings={["Trading date", "Market", "Issued by", "Prices", "Status", "Open"]}>
            {list.data.data.map((item) => (
              <tr key={item.id}>
                <td>{day(item.tradingDate)}</td>
                <td>{item.market}</td>
                <td>{item.source}</td>
                <td>{item.entryCount}</td>
                <td>
                  <span className={`rate-status rate-status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    aria-label={`Open ${item.market} ${item.tradingDate}`}
                    onClick={() => setSelected(item.id)}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          {!list.data.data.length && !list.loading ? (
            <p className="admin-empty">
              No rate lists yet. Upload the first one above.
            </p>
          ) : null}
          <Pager
            page={list.data.page}
            total={list.data.total}
            limit={list.data.limit}
            change={setPage}
          />
        </>
      ) : null}
    </div>
  );
}

// --- Member reports -----------------------------------------------------------

const REASON_LABEL: Record<string, string> = {
  spam: "Spam",
  abuse: "Abuse or harassment",
  misinformation: "Misleading information",
  scam: "Scam or fraud",
  other: "Other",
};
const TARGET_LABEL = { post: "Post", comment: "Comment", review: "Review" };

function ReportCard({
  group,
  open,
  repository,
  onResolved,
}: {
  group: ReportGroup;
  open: boolean;
  repository: AdminSupervisionRepository;
  onResolved: () => void;
}) {
  const content = group.content;
  return (
    <article className="admin-section report-card">
      <header className="report-card-head">
        <span className="report-count">
          {group.reportCount} {group.reportCount === 1 ? "report" : "reports"}
        </span>
        <span>{TARGET_LABEL[group.targetType]}</span>
        <span className="admin-muted">
          {group.reasons.map((r) => REASON_LABEL[r] ?? r).join(", ")} · last{" "}
          {day(group.latestAt)}
        </span>
      </header>
      {content ? (
        <>
          <p className="admin-muted">
            By {person(content.author)}
            {content.hidden ? " · already hidden" : ""}
          </p>
          {content.title ? <h3>{content.title}</h3> : null}
          <p className="admin-content-copy">
            {content.text || "No written text."}
          </p>
        </>
      ) : (
        <p className="admin-muted">The reported item no longer exists.</p>
      )}
      {group.notes.length ? (
        <details>
          <summary>What members said ({group.notes.length})</summary>
          <ul>
            {group.notes.map((note, index) => (
              <li key={`${index}-${note}`}>{note}</li>
            ))}
          </ul>
        </details>
      ) : null}
      {open ? (
        <ReasonedAction
          label="Reason for your decision"
          hint="Hiding removes the item for every member and keeps it for the record. Leaving it up closes these reports."
          actions={[
            {
              text: "Hide it",
              primary: true,
              run: (reason) =>
                repository.resolveReports(
                  group.targetType,
                  group.targetId,
                  "hide",
                  reason,
                ),
            },
            {
              text: "Leave it up",
              run: (reason) =>
                repository.resolveReports(
                  group.targetType,
                  group.targetId,
                  "dismiss",
                  reason,
                ),
            },
          ]}
          onDone={onResolved}
        />
      ) : null}
    </article>
  );
}

export function ReportsScreen({
  repository = adminSupervisionRepository,
}: {
  repository?: AdminSupervisionRepository;
}) {
  const [status, setStatus] = useState<ReportStatus>("open");
  const [page, setPage] = useState(1);
  const list = useRead(
    useCallback(
      () => repository.reports({ status, page }),
      [repository, status, page],
    ),
  );
  return (
    <div className="admin-operations">
      <div className="admin-toolbar">
        <label>
          Show
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ReportStatus);
              setPage(1);
            }}
          >
            <option value="open">Waiting for a decision</option>
            <option value="actioned">Hidden after review</option>
            <option value="dismissed">Left up after review</option>
          </select>
        </label>
        <button className="btn btn-secondary" onClick={list.refresh}>
          Refresh
        </button>
      </div>
      <ReadState state={list} />
      {list.data ? (
        <>
          {list.data.items.map((group) => (
            <ReportCard
              key={`${group.targetType}-${group.targetId}`}
              group={group}
              open={status === "open"}
              repository={repository}
              onResolved={list.refresh}
            />
          ))}
          {!list.data.items.length && !list.loading ? (
            <p className="admin-empty">
              {status === "open"
                ? "Nothing is waiting. Members have not flagged anything new."
                : "No reports with this outcome."}
            </p>
          ) : null}
          <Pager {...list.data} change={setPage} />
        </>
      ) : null}
    </div>
  );
}

// --- Buyer reviews ------------------------------------------------------------

export function ReviewsScreen({
  repository = adminSupervisionRepository,
}: {
  repository?: AdminSupervisionRepository;
}) {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const list = useRead(
    useCallback(
      () => repository.reviews({ status, search: applied, page }),
      [repository, status, applied, page],
    ),
  );
  const review = list.data?.items.find((item) => item.id === selected);
  return (
    <div className="admin-operations">
      <form
        className="admin-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(search.trim());
          setPage(1);
        }}
      >
        <label>
          Search
          <input
            value={search}
            placeholder="Words in the review"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All reviews</option>
            <option value="published">Published</option>
            <option value="removed">Hidden</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        <button className="btn btn-secondary" type="button" onClick={list.refresh}>
          Refresh
        </button>
      </form>
      <ReadState state={list} />
      {list.data ? (
        <>
          <Table headings={["Rating", "Review", "Buyer", "Farmer", "Status", "Inspect"]}>
            {list.data.items.map((item) => (
              <tr key={item.id}>
                <td>{item.rating} / 5</td>
                <td>
                  {item.comment || "No written comment"}
                  <p>{item.productNames.join(", ")} · {day(item.createdAt)}</p>
                </td>
                <td>{person(item.buyerId)}</td>
                <td>{person(item.farmerId)}</td>
                <td>{item.status === "removed" ? "hidden" : "published"}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    aria-label={`Inspect review ${item.id}`}
                    onClick={() => setSelected(item.id)}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          {!list.data.items.length && !list.loading ? (
            <p className="admin-empty">No reviews match these filters.</p>
          ) : null}
          <Pager {...list.data} change={setPage} />
        </>
      ) : null}
      {review ? (
        <section className="admin-section" aria-labelledby="review-detail-title">
          <div className="admin-toolbar">
            <h2 id="review-detail-title">
              {review.rating} out of 5 from {person(review.buyerId)}
            </h2>
            <button className="btn btn-secondary" onClick={() => setSelected("")}>
              Close
            </button>
          </div>
          <p className="admin-content-copy">
            {review.comment || "No written comment."}
          </p>
          {review.farmerReply ? (
            <p className="admin-content-copy">
              <strong>Farmer&rsquo;s reply:</strong> {review.farmerReply}
            </p>
          ) : null}
          <ReasonedAction
            label="Reason for visibility change"
            hint={
              review.status === "removed"
                ? "Restoring puts the review and its rating back on the farmer's profile."
                : "Hiding removes the review and its rating from the farmer's profile and credit assessment."
            }
            actions={[
              {
                text: review.status === "removed" ? "Restore review" : "Hide review",
                run: (reason) =>
                  repository.reviewVisibility(
                    review.id,
                    review.status !== "removed",
                    reason,
                  ),
              },
            ]}
            onDone={() => {
              setSelected("");
              list.refresh();
            }}
          />
        </section>
      ) : null}
    </div>
  );
}
