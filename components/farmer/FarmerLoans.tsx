"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useDirtyGuard } from "@/lib/account/use-dirty-guard";
import { useLanguage } from "./LanguageContext";
import {
  LoanRepository,
  type LoanApplication,
  type LoanLimits,
} from "@/lib/loans/loan-repository";

export default function FarmerLoans({
  repository,
  onDirtyChange,
  onBusyChange,
}: {
  repository?: LoanRepository;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const client = useMemo(
    () => repository ?? new LoanRepository(),
    [repository],
  );
  const { language } = useLanguage();
  const ur = language === "ur";
  const c = (en: string, translated: string) => (ur ? translated : en);
  const [state, setState] = useState<{
    loans: LoanApplication[];
    limits: LoanLimits;
  } | null>(null);
  const [reload, setReload] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("6");
  const [documents, setDocuments] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty =
    open && Boolean(amount || purpose || documents.length || duration !== "6");
  const guard = useDirtyGuard(dirty || busy, (href) =>
    window.location.assign(href),
  );
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  useEffect(() => {
    let active = true;
    Promise.all([client.listAll(), client.limits()]).then(
      ([loans, limits]) => {
        if (active) {
          setState({ loans, limits });
          setLoadError(false);
        }
      },
      () => {
        if (active) setLoadError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [client, reload]);
  const money = (value: number) =>
    new Intl.NumberFormat(ur ? "ur-PK" : "en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(value);
  const date = (value: string) =>
    new Date(value).toLocaleDateString(ur ? "ur-PK" : "en-PK");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !state) return;
    if (
      !purpose.trim() ||
      !Number.isInteger(Number(amount)) ||
      Number(amount) < state.limits.minAmount ||
      Number(amount) > state.limits.maxAmount
    )
      return;
    setBusy(true);
    setError("");
    try {
      const loan = await client.apply({
        amount: Number(amount),
        purpose: purpose.trim(),
        durationMonths: Number(duration),
        documents,
      });
      setState((current) =>
        current ? { ...current, loans: [loan, ...current.loans] } : current,
      );
      setOpen(false);
      setAmount("");
      setPurpose("");
      setDocuments([]);
      setNotice(
        c(
          "Application submitted. Follow its review status below.",
          "درخواست جمع ہو گئی۔ جائزے کی صورتحال نیچے دیکھیں۔",
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : c(
              "Could not submit. Your input is kept; try again.",
              "درخواست جمع نہیں ہو سکی۔ آپ کی تفصیلات محفوظ ہیں؛ دوبارہ کوشش کریں۔",
            ),
      );
    } finally {
      setBusy(false);
    }
  }
  const statuses: Record<string, string> = ur
    ? {
        pending: "زیر التوا",
        under_review: "زیر جائزہ",
        approved: "منظور شدہ",
        rejected: "مسترد",
        repaid: "ادا شدہ",
      }
    : {
        pending: "Pending",
        under_review: "Under review",
        approved: "Approved",
        rejected: "Rejected",
        repaid: "Repaid",
      };
  const hasOpen = state?.loans.some((loan) =>
    ["pending", "under_review", "approved"].includes(loan.status),
  );
  return (
    <section>
      {guard.pendingHref && (
        <div className="flow-notice">
          <p>
            {c(
              "Keep this application open or discard your draft?",
              "درخواست کھلی رکھیں یا مسودہ ختم کریں؟",
            )}
          </p>
          <button className="btn btn-secondary" onClick={guard.stay}>
            {c("Keep editing", "ترمیم جاری رکھیں")}
          </button>
          <button
            className="btn btn-danger-solid"
            disabled={busy}
            onClick={() => guard.leave()}
          >
            {c("Discard draft", "مسودہ ختم کریں")}
          </button>
        </div>
      )}
      <div className="page-header">
        <h1>{c("Farm finance", "زرعی مالی معاونت")}</h1>
        <p>
          {c(
            "Apply for farm funding and follow your application and repayment schedule.",
            "اپنے کھیت کے لیے مالی معاونت کی درخواست دیں اور جائزے اور اقساط کی صورتحال دیکھیں۔",
          )}
        </p>
      </div>
      {notice ? (
        <p role="status" className="flow-notice">
          {notice}
        </p>
      ) : null}
      {loadError ? (
        <div className="flow-state">
          <p role="alert">
            {c(
              "Could not load applications. Please retry.",
              "درخواستیں لوڈ نہیں ہو سکیں۔ دوبارہ کوشش کریں۔",
            )}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => setReload((value) => value + 1)}
          >
            {c("Try again", "دوبارہ کوشش کریں")}
          </button>
        </div>
      ) : !state ? (
        <p role="status">
          {c("Loading applications…", "درخواستیں لوڈ ہو رہی ہیں…")}
        </p>
      ) : (
        <>
          <div className="flow-notice">
            <button
              className="btn btn-primary"
              disabled={hasOpen || busy}
              onClick={() => setOpen(true)}
            >
              {c("Apply for funding", "مالی معاونت کی درخواست دیں")}
            </button>
            <button
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => setReload((value) => value + 1)}
            >
              {c("Refresh status", "صورتحال تازہ کریں")}
            </button>
            {hasOpen ? (
              <p>
                {c(
                  "You can have one application or approved loan in progress at a time.",
                  "ایک وقت میں صرف ایک زیر جائزہ درخواست یا منظور شدہ قرض جاری رہ سکتا ہے۔",
                )}
              </p>
            ) : null}
          </div>
          {open ? (
            <form className="card loan-application-form" onSubmit={submit}>
              <fieldset className="flow-fieldset" disabled={busy}>
                <h2>{c("Funding application", "مالی معاونت کی درخواست")}</h2>
                <p>
                  {c(
                    "Approval and repayments are managed by the financial partner.",
                    "منظوری اور اقساط مالی شریک ادارہ سنبھالتا ہے۔",
                  )}
                </p>
                <div className="checkout-address-grid">
                  <label>
                    {c("Amount (PKR)", "رقم (روپے)")}
                    <input
                      aria-label={c("Amount (PKR)", "رقم (روپے)")}
                      type="number"
                      required
                      min={state.limits.minAmount}
                      max={state.limits.maxAmount}
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                    <small>
                      {money(state.limits.minAmount)} –{" "}
                      {money(state.limits.maxAmount)}
                    </small>
                  </label>
                  <label>
                    {c("Duration (months)", "مدت (ماہ)")}
                    <input
                      type="number"
                      required
                      min="1"
                      max={state.limits.maxDurationMonths}
                      step="1"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                    />
                  </label>
                  <label className="loan-purpose">
                    {c("Purpose", "مقصد")}
                    <textarea
                      required
                      maxLength={500}
                      rows={3}
                      value={purpose}
                      onChange={(event) => setPurpose(event.target.value)}
                    />
                  </label>
                  <label>
                    {c(
                      "Supporting documents (optional)",
                      "معاون دستاویزات (اختیاری)",
                    )}
                    <input
                      type="file"
                      multiple
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        event.target.value = "";
                        if (
                          documents.length + files.length >
                            state.limits.maxDocuments ||
                          files.some(
                            (file) =>
                              file.size > 10 * 1024 * 1024 ||
                              ![
                                "application/pdf",
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                              ].includes(file.type),
                          )
                        ) {
                          setError(
                            c(
                              "Choose up to 4 PDF, JPEG, PNG or WebP documents, 10 MB each.",
                              "۴ تک PDF، JPEG، PNG یا WebP دستاویزات منتخب کریں، ہر ایک ۱۰ MB تک۔",
                            ),
                          );
                          return;
                        }
                        setDocuments((current) => [...current, ...files]);
                        setError("");
                      }}
                    />
                    <small>
                      {c(
                        "PDF or photo, up to 10 MB each. Stored privately.",
                        "PDF یا تصویر، ہر ایک ۱۰ MB تک۔ نجی طور پر محفوظ ہوتی ہیں۔",
                      )}
                    </small>
                  </label>
                </div>
                <ul>
                  {documents.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      {file.name}{" "}
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() =>
                          setDocuments((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        {c("Remove", "ہٹائیں")}
                      </button>
                    </li>
                  ))}
                </ul>
                {error ? <p role="alert">{error}</p> : null}
                <div className="flow-pagination">
                  <button className="btn btn-primary" type="submit">
                    {busy
                      ? c("Submitting…", "درخواست جمع ہو رہی ہے…")
                      : c("Submit application", "درخواست جمع کریں")}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    {c("Close form", "فارم بند کریں")}
                  </button>
                </div>
              </fieldset>
            </form>
          ) : null}
          {state.loans.length === 0 ? (
            <div className="flow-state">
              <h2>{c("No applications yet", "ابھی کوئی درخواست نہیں")}</h2>
              <p>
                {c(
                  "Your applications will appear here after you submit one.",
                  "درخواست جمع ہونے کے بعد یہاں نظر آئے گی۔",
                )}
              </p>
            </div>
          ) : (
            <div className="orders-grid">
              {state.loans.map((loan) => (
                <article className="order-card" key={loan.id}>
                  <div className="order-card-header">
                    <h2>{money(loan.amount)}</h2>
                    <span className="badge badge-soft-blue">
                      {statuses[loan.status]}
                    </span>
                  </div>
                  <p>{loan.purpose}</p>
                  <p>
                    {loan.durationMonths} {c("months", "ماہ")} ·{" "}
                    {date(loan.createdAt)}
                  </p>
                  {loan.reviewNote ? (
                    <p>
                      {c("Reviewer note: ", "جائزہ لینے والے کا نوٹ: ")}
                      {loan.reviewNote}
                    </p>
                  ) : null}
                  {loan.repaymentSchedule.length ? (
                    <>
                      <h3>{c("Repayment schedule", "اقساط کا شیڈول")}</h3>
                      <ul className="loan-schedule">
                        {loan.repaymentSchedule.map((item) => (
                          <li key={item.index}>
                            <span>{date(item.dueDate)}</span>
                            <strong>{money(item.amount)}</strong>
                            <span>
                              {item.isPaid
                                ? c("Paid", "ادا شدہ")
                                : c("Due", "واجب الادا")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <small>
                    {loan.documentCount}{" "}
                    {c("supporting documents", "معاون دستاویزات")}
                  </small>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
