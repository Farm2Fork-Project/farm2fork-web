'use client'

import { useLanguage } from '@/components/LanguageContext'

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
import { STATUS_BADGE, money, shortDate } from './loan-format'

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
  const { t, language } = useLanguage()
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
    <div dir={language === 'ur' ? 'rtl' : 'ltr'} className="app-shell" style={{ flexDirection: 'column' }}>
      <Topbar
        currentView="queue"
        onNavigateToQueue={() => {}}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />
      <div className="app-main">
        <main className="app-content">
          <div className="page-header">
            <h1>{t("financial.farmerLoanApplications")}</h1>
            <p>
              {t("financial.reviewEachFarmAndItsFarm2Fork")}
            </p>
          </div>

          <div className="grid-4 mb-xl">
            <Stat label={t("financial.totalRequested")} value={money(stats.requested, language)} icon={<Wallet className="w-4 h-4" />} />
            <Stat label={t("financial.approvedAmount")} value={money(stats.approvedAmount, language)} icon={<CheckCircle className="w-4 h-4" />} />
            <Stat label={t("financial.approvalRateDecided")} value={stats.approvalRate} icon={<TrendingUp className="w-4 h-4" />} />
            <Stat label={t("financial.awaitingADecision")} value={String(stats.awaiting)} icon={<Clock className="w-4 h-4" />} />
          </div>

          <div className="card">
            <div className="loan-queue-toolbar">
              <div className="loan-queue-filters" role="tablist" aria-label={t("financial.filterByStatus")}>
                {(['all', ...LOAN_STATUSES] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === status}
                    className={statusFilter === status ? 'btn btn-primary' : 'btn btn-outline'}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? t("financial.all") : t("financial." + "status." + status)}
                  </button>
                ))}
              </div>
              <label className="loan-queue-search">
                <Search className="w-4 h-4" aria-hidden="true" />
                <input
                  placeholder={t("financial.searchFarmCityOrPurpose")}
                  aria-label={t("financial.searchApplications")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>

            {state.kind === 'loading' ? (
              <p className="text-muted">{t("financial.loadingApplications")}</p>
            ) : state.kind === 'error' ? (
              <div role="alert">
                <p>{t("financial.couldnTLoadApplications")}</p>
                <button type="button" className="btn btn-outline" onClick={() => setReloadKey((k) => k + 1)}>
                  {t("financial.tryAgain")}
                </button>
              </div>
            ) : visible.length === 0 ? (
              <p className="text-muted">{t("financial.noApplicationsMatch")}</p>
            ) : (
              <ul className="loan-queue-list">
                {visible.map((loan) => (
                  <li key={loan.id}>
                    <button type="button" className="loan-queue-row" onClick={() => onSelectLoan(loan.id)}>
                      <span className="loan-queue-main">
                        <strong>{loan.applicant?.farmName ?? t("financial.farm")}</strong>
                        <span className="text-muted">
                          {[loan.applicant?.city, loan.applicant?.province].filter(Boolean).join(', ')}
                          {' · '}
                          {shortDate(loan.createdAt, language)}
                        </span>
                        <span className="loan-queue-purpose">{loan.purpose}</span>
                      </span>
                      <span className="loan-queue-amount">
                        {money(loan.amount, language)}
                        <span className="text-muted">{loan.durationMonths} {t("financial.word.months")}</span>
                      </span>
                      <span className={`badge ${STATUS_BADGE[loan.status]}`}>{t("financial." + "status." + loan.status)}</span>
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
