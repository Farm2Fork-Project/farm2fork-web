'use client'

import { useLanguage } from '@/components/LanguageContext'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Circle, FileText } from 'lucide-react'
import { LoanDetailScreenProps } from '../types'
import Topbar from './Topbar'
import {
  LoanRepository,
  resolveApiUrl,
  type LoanApplication,
} from '@/lib/loans/loan-repository.ts'
import { STATUS_BADGE, money, shortDate } from './loan-format'

/** One application: farm summary, private documents, decision, repayments. */
export default function LoanDetailScreen({
  loanId,
  onLogout = () => {},
  onBack,
  onNavigateToSettings,
  repository,
}: LoanDetailScreenProps & { repository?: LoanRepository }) {
  const { t, language } = useLanguage()
  const loans = useMemo(() => repository ?? new LoanRepository(), [repository])
  const [loan, setLoan] = useState<LoanApplication | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    let cancelled = false
    loans
      .get(loanId)
      .then((result) => {
        if (!cancelled) setLoan(result)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [loans, loanId])

  const run = async (action: () => Promise<LoanApplication>) => {
    setBusy(true)
    setActionError('')
    try {
      // Re-read so document links are fresh after each change.
      await action()
      setLoan(await loans.get(loanId))
      setRejecting(false)
      setReason('')
    } catch {
      setActionError(t("financial.thatDidnTWorkRefreshThe"))
    } finally {
      setBusy(false)
    }
  }

  const repaid = loan?.repaymentSchedule.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0) ?? 0

  return (
    <div dir={language === 'ur' ? 'rtl' : 'ltr'} className="app-shell" style={{ flexDirection: 'column' }}>
      <Topbar
        currentView="detail"
        onNavigateToQueue={onBack}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />
      <div className="app-main">
        <main className="app-content">
          <button type="button" className="btn btn-outline mb-lg" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> {t("financial.backToApplications")}
          </button>

          {loadError ? (
            <p role="alert">{t("financial.couldnTLoadThisApplication")}</p>
          ) : !loan ? (
            <p className="text-muted">{t("financial.loading")}</p>
          ) : (
            <div className="loan-detail-grid">
              <section className="card">
                <div className="flex-between mb-md">
                  <h1 className="card-title" style={{ margin: 0 }}>{money(loan.amount, language)}</h1>
                  <span className={`badge ${STATUS_BADGE[loan.status]}`}>{t("financial." + "status." + loan.status)}</span>
                </div>
                <p className="text-muted">
                  {loan.durationMonths} {t("financial.word.months")} · {t("financial.word.submitted")} {shortDate(loan.createdAt, language)}
                </p>
                <p>{loan.purpose}</p>
                {loan.reviewNote ? <p className="text-muted">{t("financial.word.Reviewer note:")} {loan.reviewNote}</p> : null}

                {loan.status === 'pending' ? (
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => loans.startReview(loan.id))}>
                    {t("financial.startReview")}
                  </button>
                ) : null}

                {loan.status === 'under_review' && !rejecting ? (
                  <div className="loan-detail-actions">
                    <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => loans.decide(loan.id, 'approved'))}>
                      {t("financial.word.Approve")} ({loan.durationMonths} {t("financial.word.monthly instalments")})
                    </button>
                    <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setRejecting(true)}>
                      {t("financial.reject")}
                    </button>
                  </div>
                ) : null}

                {rejecting ? (
                  <form
                    className="loan-reject-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (reason.trim()) void run(() => loans.decide(loan.id, 'rejected', reason.trim()))
                    }}
                  >
                    <label>
                      {t("financial.reasonTheFarmerWillSeeThis")}
                      <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} />
                    </label>
                    <div className="loan-detail-actions">
                      <button type="submit" className="btn btn-primary" disabled={busy || !reason.trim()}>
                        {t("financial.confirmRejection")}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setRejecting(false)}>
                        {t("financial.cancel")}
                      </button>
                    </div>
                  </form>
                ) : null}
                {actionError ? <p role="alert" className="text-error">{actionError}</p> : null}
              </section>

              {loan.applicant ? (
                <section className="card">
                  <h2 className="card-title">{loan.applicant.farmName}</h2>
                  <p className="text-muted">
                    {[loan.applicant.city, loan.applicant.province].filter(Boolean).join(', ')}
                  </p>
                  <dl className="loan-facts">
                    <dt>{t("financial.land")}</dt>
                    <dd>{loan.applicant.landSizeAcres != null ? `${loan.applicant.landSizeAcres} ${t("financial.word.acres")}` : t("financial.notStated")}</dd>
                    <dt>{t("financial.crops")}</dt>
                    <dd>{loan.applicant.cropTypes.length ? loan.applicant.cropTypes.join(', ') : t("financial.notStated")}</dd>
                    <dt>{t("financial.deliveredOrders")}</dt>
                    <dd>{loan.applicant.deliveredOrders}</dd>
                    <dt>{t("financial.revenueFromDeliveredOrders")}</dt>
                    <dd>{money(loan.applicant.deliveredRevenue, language)}</dd>
                  </dl>
                </section>
              ) : null}

              <section className="card">
                <h2 className="card-title">{t("financial.documents")}</h2>
                {loan.documents?.length ? (
                  <>
                    <ul className="loan-docs">
                      {loan.documents.map((doc) => (
                        <li key={doc.index}>
                          <a href={resolveApiUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" aria-hidden="true" /> {t("financial.word.Document")} {doc.index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted text-sm">{t("financial.linksExpireAfterAbout10Minutes")}</p>
                  </>
                ) : (
                  <p className="text-muted">{t("financial.noDocumentsWereAttached")}</p>
                )}
              </section>

              {loan.repaymentSchedule.length ? (
                <section className="card">
                  <h2 className="card-title">{t("financial.repayment")}</h2>
                  <p className="text-muted">
                    {t("financial.word.Repaid")} {money(repaid, language)} {t("financial.word.of")} {money(loan.amount, language)}
                  </p>
                  <ul className="loan-schedule">
                    {loan.repaymentSchedule.map((i) => (
                      <li key={i.index}>
                        {i.isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
                        ) : (
                          <Circle className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span>
                          {t("financial.word.Instalment")} {i.index + 1}: {money(i.amount, language)} ·{' '}
                          {i.isPaid && i.paidAt ? `${t("financial.word.paid")} ${shortDate(i.paidAt, language)}` : `${t("financial.word.due")} ${shortDate(i.dueDate, language)}`}
                        </span>
                        {!i.isPaid && loan.status === 'approved' ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={busy}
                            onClick={() => run(() => loans.markInstalmentPaid(loan.id, i.index))}
                          >
                            {t("financial.markPaid")}
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
