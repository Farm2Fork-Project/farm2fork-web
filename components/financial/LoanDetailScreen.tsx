'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Circle, FileText } from 'lucide-react'
import { LoanDetailScreenProps } from '../types'
import Topbar from './Topbar'
import {
  LoanRepository,
  resolveApiUrl,
  type LoanApplication,
} from '@/lib/loans/loan-repository.ts'
import { STATUS_BADGE, STATUS_LABEL, money, shortDate } from './loan-format'

/** One application: farm summary, private documents, decision, repayments. */
export default function LoanDetailScreen({
  loanId,
  onBack,
  onNavigateToSettings,
  repository,
}: LoanDetailScreenProps & { repository?: LoanRepository }) {
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
      setActionError('That didn’t work. Refresh the application and try again.')
    } finally {
      setBusy(false)
    }
  }

  const repaid = loan?.repaymentSchedule.filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0) ?? 0

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      <Topbar
        currentView="detail"
        onNavigateToQueue={onBack}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onBack}
      />
      <div className="app-main">
        <main className="app-content">
          <button type="button" className="btn btn-outline mb-lg" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </button>

          {loadError ? (
            <p role="alert">Couldn&apos;t load this application.</p>
          ) : !loan ? (
            <p className="text-muted">Loading…</p>
          ) : (
            <div className="loan-detail-grid">
              <section className="card">
                <div className="flex-between mb-md">
                  <h1 className="card-title" style={{ margin: 0 }}>{money(loan.amount)}</h1>
                  <span className={`badge ${STATUS_BADGE[loan.status]}`}>{STATUS_LABEL[loan.status]}</span>
                </div>
                <p className="text-muted">
                  {loan.durationMonths} months · submitted {shortDate(loan.createdAt)}
                </p>
                <p>{loan.purpose}</p>
                {loan.reviewNote ? <p className="text-muted">Reviewer note: {loan.reviewNote}</p> : null}

                {loan.status === 'pending' ? (
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => loans.startReview(loan.id))}>
                    Start review
                  </button>
                ) : null}

                {loan.status === 'under_review' && !rejecting ? (
                  <div className="loan-detail-actions">
                    <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => loans.decide(loan.id, 'approved'))}>
                      Approve ({loan.durationMonths} monthly instalments)
                    </button>
                    <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setRejecting(true)}>
                      Reject…
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
                      Reason (the farmer will see this)
                      <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} />
                    </label>
                    <div className="loan-detail-actions">
                      <button type="submit" className="btn btn-primary" disabled={busy || !reason.trim()}>
                        Confirm rejection
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => setRejecting(false)}>
                        Cancel
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
                    <dt>Land</dt>
                    <dd>{loan.applicant.landSizeAcres != null ? `${loan.applicant.landSizeAcres} acres` : 'Not stated'}</dd>
                    <dt>Crops</dt>
                    <dd>{loan.applicant.cropTypes.length ? loan.applicant.cropTypes.join(', ') : 'Not stated'}</dd>
                    <dt>Delivered orders</dt>
                    <dd>{loan.applicant.deliveredOrders}</dd>
                    <dt>Revenue from delivered orders</dt>
                    <dd>{money(loan.applicant.deliveredRevenue)}</dd>
                  </dl>
                </section>
              ) : null}

              <section className="card">
                <h2 className="card-title">Documents</h2>
                {loan.documents?.length ? (
                  <>
                    <ul className="loan-docs">
                      {loan.documents.map((doc) => (
                        <li key={doc.index}>
                          <a href={resolveApiUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" aria-hidden="true" /> Document {doc.index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted text-sm">Links expire after about 10 minutes; reload the page for new ones.</p>
                  </>
                ) : (
                  <p className="text-muted">No documents were attached.</p>
                )}
              </section>

              {loan.repaymentSchedule.length ? (
                <section className="card">
                  <h2 className="card-title">Repayment</h2>
                  <p className="text-muted">
                    Repaid {money(repaid)} of {money(loan.amount)}
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
                          Instalment {i.index + 1}: {money(i.amount)} ·{' '}
                          {i.isPaid && i.paidAt ? `paid ${shortDate(i.paidAt)}` : `due ${shortDate(i.dueDate)}`}
                        </span>
                        {!i.isPaid && loan.status === 'approved' ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={busy}
                            onClick={() => run(() => loans.markInstalmentPaid(loan.id, i.index))}
                          >
                            Mark paid
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
