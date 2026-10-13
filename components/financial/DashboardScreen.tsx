'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, ChevronRight, Clock, Search, Wallet, TrendingUp } from 'lucide-react'
import { DashboardScreenProps } from '../types'
import Topbar from './Topbar'
import {
  LOAN_STATUSES,
  LoanRepository,
  type LoanApplication,
  type LoanStatus,
} from '@/lib/loans/loan-repository.ts'
import { STATUS_BADGE, STATUS_LABEL, money, shortDate } from './loan-format'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; loans: LoanApplication[] }

/**
 * Financial-partner queue over the real /loans API. Every number on this
 * page is computed from the applications themselves.
 */
export default function DashboardScreen({
  onSelectLoan,
  onLogout,
  onNavigateToSettings,
  repository,
}: DashboardScreenProps & { repository?: LoanRepository }) {
  const loans = useMemo(() => repository ?? new LoanRepository(), [repository])
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('pending')
  const [query, setQuery] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    loans
      .list()
      .then((page) => {
        if (!cancelled) setState({ kind: 'ready', loans: page.data })
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [loans, reloadKey])

  const all = state.kind === 'ready' ? state.loans : []
  const decided = all.filter((l) => l.status !== 'pending' && l.status !== 'under_review')
  const approved = all.filter((l) => l.status === 'approved' || l.status === 'repaid')
  const stats = {
    requested: all.reduce((sum, l) => sum + l.amount, 0),
    approvedAmount: approved.reduce((sum, l) => sum + l.amount, 0),
    approvalRate: decided.length ? `${Math.round((approved.length / decided.length) * 100)}%` : '—',
    awaiting: all.filter((l) => l.status === 'pending' || l.status === 'under_review').length,
  }

  const needle = query.trim().toLowerCase()
  const visible = all.filter(
    (l) =>
      (statusFilter === 'all' || l.status === statusFilter) &&
      (!needle ||
        l.purpose.toLowerCase().includes(needle) ||
        (l.applicant?.farmName ?? '').toLowerCase().includes(needle) ||
        (l.applicant?.city ?? '').toLowerCase().includes(needle)),
  )

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      <Topbar
        currentView="queue"
        onNavigateToQueue={() => {}}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />
      <div className="app-main">
        <main className="app-content">
          <div className="page-header">
            <h1>Farmer loan applications</h1>
            <p>
              Review each farm and its Farm2Fork sales history, then approve with a monthly
              repayment plan or reject with a reason the farmer will see.
            </p>
          </div>

          <div className="grid-4 mb-xl">
            <Stat label="Total requested" value={money(stats.requested)} icon={<Wallet className="w-4 h-4" />} />
            <Stat label="Approved amount" value={money(stats.approvedAmount)} icon={<CheckCircle className="w-4 h-4" />} />
            <Stat label="Approval rate (decided)" value={stats.approvalRate} icon={<TrendingUp className="w-4 h-4" />} />
            <Stat label="Awaiting a decision" value={String(stats.awaiting)} icon={<Clock className="w-4 h-4" />} />
          </div>

          <div className="card">
            <div className="loan-queue-toolbar">
              <div className="loan-queue-filters" role="tablist" aria-label="Filter by status">
                {(['all', ...LOAN_STATUSES] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === status}
                    className={statusFilter === status ? 'btn btn-primary' : 'btn btn-outline'}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
              <label className="loan-queue-search">
                <Search className="w-4 h-4" aria-hidden="true" />
                <input
                  placeholder="Search farm, city or purpose"
                  aria-label="Search applications"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>

            {state.kind === 'loading' ? (
              <p className="text-muted">Loading applications…</p>
            ) : state.kind === 'error' ? (
              <div role="alert">
                <p>Couldn&apos;t load applications.</p>
                <button type="button" className="btn btn-outline" onClick={() => setReloadKey((k) => k + 1)}>
                  Try again
                </button>
              </div>
            ) : visible.length === 0 ? (
              <p className="text-muted">No applications match.</p>
            ) : (
              <ul className="loan-queue-list">
                {visible.map((loan) => (
                  <li key={loan.id}>
                    <button type="button" className="loan-queue-row" onClick={() => onSelectLoan(loan.id)}>
                      <span className="loan-queue-main">
                        <strong>{loan.applicant?.farmName ?? 'Farm'}</strong>
                        <span className="text-muted">
                          {[loan.applicant?.city, loan.applicant?.province].filter(Boolean).join(', ')}
                          {' · '}
                          {shortDate(loan.createdAt)}
                        </span>
                        <span className="loan-queue-purpose">{loan.purpose}</span>
                      </span>
                      <span className="loan-queue-amount">
                        {money(loan.amount)}
                        <span className="text-muted">{loan.durationMonths} months</span>
                      </span>
                      <span className={`badge ${STATUS_BADGE[loan.status]}`}>{STATUS_LABEL[loan.status]}</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div className="flex-between">
        <span className="stat-card-label">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary-green-soft flex items-center justify-center text-primary-green">
          {icon}
        </div>
      </div>
      <div className="stat-card-row">
        <span className="stat-card-value">{value}</span>
      </div>
    </div>
  )
}
