'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Download,
  X,
  Check,
  Search
} from 'lucide-react'
import { LoanApplication, DashboardScreenProps } from '../types'
import Topbar from './Topbar'

const initialLoans: LoanApplication[] = [
  {
    id: 'APP-8842-FG',
    applicant: "Samuel 'Sammy' Greene",
    farmName: 'Evergreen Hydroponics Co.',
    location: 'Sonoma Valley, CA',
    amount: 'PKR 12,500,000',
    term: '60 Months',
    interestRate: '5.25% Fixed',
    revenue: 'PKR 42,850,000',
    creditScore: 742,
    dti: '18%',
    riskProfile: 'Low',
    status: 'Ledger Pending',
  },
  {
    id: 'APP-9102-XF',
    applicant: "Fatima Ali",
    farmName: 'Green Valley Farms',
    location: 'Punjab, PK',
    amount: 'PKR 8,000,000',
    term: '36 Months',
    interestRate: '6.00% Fixed',
    revenue: 'PKR 18,000,000',
    creditScore: 690,
    dti: '24%',
    riskProfile: 'Medium',
    status: 'Ledger Approved',
  },
  {
    id: 'APP-7731-MN',
    applicant: "David Chen",
    farmName: 'Rural Growers Orchards',
    location: 'Gilgit, PK',
    amount: 'PKR 3,200,000',
    term: '24 Months',
    interestRate: '4.50% Fixed',
    revenue: 'PKR 9,500,000',
    creditScore: 710,
    dti: '12%',
    riskProfile: 'Low',
    status: 'Ledger Needs Docs',
  },
  {
    id: 'APP-6544-JK',
    applicant: "Imran Khan",
    farmName: 'Harvest Trust Ltd.',
    location: 'Sindh, PK',
    amount: 'PKR 14,000,000',
    term: '48 Months',
    interestRate: '7.25% Fixed',
    revenue: 'PKR 11,200,000',
    creditScore: 580,
    dti: '45%',
    riskProfile: 'High',
    status: 'Ledger Rejected',
  }
]

export default function DashboardScreen({ onSelectLoan, onLogout, onNavigateToSettings }: DashboardScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [loans, setLoans] = useState<LoanApplication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Report options
  const [reportFormat, setReportFormat] = useState<'PDF' | 'CSV' | 'XLSX'>('PDF')
  const [includeRisks, setIncludeRisks] = useState(true)
  const [includeLedger, setIncludeLedger] = useState(true)

  const [stats, setStats] = useState({
    totalFunds: 'PKR 37.7M',
    activeLoans: 0,
    approvalRate: '0%',
    pendingRequests: 0
  })

  useEffect(() => {
    setMounted(true)
    // Load Loans
    const stored = localStorage.getItem('partner_loans_data')
    let currentLoans = initialLoans
    if (stored) {
      try {
        currentLoans = JSON.parse(stored)
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('partner_loans_data', JSON.stringify(initialLoans))
    }
    setLoans(currentLoans)
  }, [])

  useEffect(() => {
    if (!mounted || loans.length === 0) return

    // Recalculate metrics
    const active = loans.filter(l => l.status === 'Ledger Approved').length
    const pending = loans.filter(l => l.status === 'Ledger Pending').length
    const rejected = loans.filter(l => l.status === 'Ledger Rejected').length
    const totalProcessed = active + rejected
    const approvalPct = totalProcessed > 0 ? Math.round((active / totalProcessed) * 100) : 0

    // Calculate sum format
    const totalVal = loans.reduce((acc, curr) => {
      const numStr = curr.amount.replace(/[^0-9]/g, '')
      return acc + parseInt(numStr || '0', 10)
    }, 0)
    
    setStats({
      totalFunds: `PKR ${(totalVal / 1000000).toFixed(1)}M`,
      activeLoans: active,
      approvalRate: `${approvalPct}%`,
      pendingRequests: pending
    })
  }, [loans, mounted])

  if (!mounted) return null

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const triggerDownload = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Generating credit ledger report as ${reportFormat}...\nReport downloaded successfully!`)
    setShowReportModal(false)
  }

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      
      {/* Top Bar Navigation with horizontal layout links */}
      <Topbar 
        currentView="queue"
        onNavigateToQueue={() => {}}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* Main Panel Content */}
      <div className="app-main">
        <main className="app-content">
        
        {/* Page Title & Intro */}
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Agricultural Credit Ledger</h1>
              <p>Review farmer risk parameters, view credit scores, and manage loan disbursements.</p>
            </div>
            
            <button
              onClick={() => setShowReportModal(true)}
              className="btn btn-primary"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid-4 mb-xl">
          {/* Card 1 */}
          <div className="stat-card">
            <div className="flex-between">
              <span className="stat-card-label">Total Application Volume</span>
              <div className="w-8 h-8 rounded-lg bg-primary-green-soft flex items-center justify-center text-primary-green">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="stat-card-row">
              <span className="stat-card-value">{stats.totalFunds}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex-between">
              <span className="stat-card-label">Approved Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-success">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="stat-card-row">
              <span className="stat-card-value">{stats.activeLoans}</span>
              <span className="stat-card-change bg-primary-green-soft text-primary-green">Active Ledger</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex-between">
              <span className="stat-card-label">Approval Rate</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-secondary-blue">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="stat-card-row">
              <span className="stat-card-value">{stats.approvalRate}</span>
              <span className="stat-card-change bg-secondary-blue-soft text-secondary-blue">Processed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex-between">
              <span className="stat-card-label">Pending Reviews</span>
              <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="stat-card-row">
              <span className="stat-card-value">{stats.pendingRequests}</span>
              <span className="stat-card-change badge-soft-yellow">Needs Decision</span>
            </div>
          </div>
        </div>

        {/* Analytics & Volume Chart Block */}
        <div className="grid-3 mb-xl">
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="flex-between mb-lg">
              <div>
                <h3 className="card-title mb-xs">Monthly Credit Outflow</h3>
                <p className="text-sm text-muted">Accumulative disbursed funds comparison (Projected vs Disbursed)</p>
              </div>
              <div className="flex-between gap-md text-sm">
                <span className="flex-between gap-sm text-primary-green font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-green"></span>
                  Disbursed
                </span>
                <span className="flex-between gap-sm text-muted font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--surface-strong)' }}></span>
                  Target
                </span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="chart-placeholder mt-md">
              <div className="chart-line">
                <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                  {/* Horizontal Guide Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="var(--surface-medium)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="var(--surface-medium)" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="var(--surface-strong)" strokeWidth="1" />

                  {/* Target Polyline */}
                  <polyline
                    fill="none"
                    stroke="var(--surface-strong)"
                    strokeWidth="3"
                    strokeDasharray="4"
                    points="10,110 90,95 170,85 250,75 330,60 410,40 480,25"
                  />

                  {/* Disbursed Polyline */}
                  <polyline
                    fill="none"
                    stroke="var(--primary-green)"
                    strokeWidth="4"
                    points="10,120 90,105 170,90 250,70 330,85 410,45"
                  />

                  {/* Data Points */}
                  <circle cx="250" cy="70" r="5" fill="var(--primary-green)" stroke="var(--white)" strokeWidth="2" />
                  <circle cx="330" cy="85" r="5" fill="var(--primary-green)" stroke="var(--white)" strokeWidth="2" />
                  <circle cx="410" cy="45" r="5" fill="var(--primary-green)" stroke="var(--white)" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div className="flex-between mt-sm text-xs font-bold text-muted px-2">
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun (Active)</span>
            </div>
          </div>

          <div className="card">
            <div>
              <h3 className="card-title mb-xs">Risk Profile Summary</h3>
              <p className="text-sm text-muted mb-lg">Risk exposure analysis across the lending queue.</p>
              
              <div className="gap-md flex flex-col">
                <div>
                  <div className="flex-between text-sm font-semibold mb-xs">
                    <span>Low Risk Profile</span>
                    <span className="text-success font-bold">2 Applications</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex-between text-sm font-semibold mb-xs">
                    <span>Medium Risk Profile</span>
                    <span style={{ color: 'var(--secondary-blue)' }} className="font-bold">1 Application</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '25%', background: 'var(--secondary-blue)' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex-between text-sm font-semibold mb-xs">
                    <span>High Risk Profile</span>
                    <span style={{ color: 'var(--error-red)' }} className="font-bold">1 Application</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '25%', background: 'var(--error-red)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loans Management Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header Filter Panel */}
          <div className="filter-bar" style={{ margin: 0, border: 'none', borderBottom: '1px solid var(--surface-medium)', borderRadius: 0 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Credit Applications Queue</h3>
            
            <div className="flex-between gap-md w-full" style={{ maxWidth: '600px' }}>
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search farmer name, farm, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                />
              </div>

              {/* Status Select Filter */}
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
              >
                <option value="All">All Application Statuses</option>
                <option value="Ledger Pending">Pending Assessment</option>
                <option value="Ledger Approved">Ledger Approved</option>
                <option value="Ledger Rejected">Ledger Rejected</option>
                <option value="Ledger Needs Docs">Needs Documentation</option>
              </select>
            </div>
          </div>

          {/* Table / Queue */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application ID & Farm</th>
                  <th>Farmer Name</th>
                  <th>Amount / Term</th>
                  <th>Credit Score & Risk</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      No matching credit applications found in the ledger.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <div className="font-bold" style={{ color: 'var(--secondary-blue)', textTransform: 'uppercase' }}>{loan.id}</div>
                        <div className="font-bold text-dark">{loan.farmName}</div>
                        <div className="text-xs text-muted">{loan.location}</div>
                      </td>
                      <td>
                        <div className="font-bold text-dark">{loan.applicant}</div>
                        <div className="text-xs text-muted">Verified Applicant</div>
                      </td>
                      <td>
                        <div className="font-bold" style={{ color: 'var(--primary-green)' }}>{loan.amount}</div>
                        <div className="text-xs text-muted">{loan.term}</div>
                      </td>
                      <td>
                        <div className="flex-between gap-sm" style={{ justifyContent: 'flex-start', marginBottom: '4px' }}>
                          <span className="font-bold text-dark">{loan.creditScore}</span>
                          <span className="badge" style={{ background: 'var(--surface-strong)', color: 'var(--text-dark)' }}>FICO</span>
                        </div>
                        <span className={`badge ${
                          loan.riskProfile === 'Low' ? 'badge-soft-green' :
                          loan.riskProfile === 'Medium' ? 'badge-soft-yellow' :
                          'badge-soft-red'
                        }`}>
                          {loan.riskProfile} Risk
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          loan.status === 'Ledger Approved' ? 'badge-soft-green' :
                          loan.status === 'Ledger Rejected' ? 'badge-soft-red' :
                          loan.status === 'Ledger Needs Docs' ? 'badge-soft-yellow' :
                          'badge-soft-blue'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => onSelectLoan(loan.id)}
                          className="btn btn-outline"
                        >
                          Evaluate Application <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        </main>
      </div>

      {/* Generate Report Modal Component */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h2>Generate Ledger Audit Report</h2>
              <button onClick={() => setShowReportModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={triggerDownload}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: 'var(--sp-lg)' }}>
                Configure the scope of the credit ledger report. All downloads are cryptographically signed for regulatory compliance.
              </p>

              {/* Scope Selection */}
              <div>
                <label className="modal-section-label block">Include Data Scopes</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setIncludeLedger(!includeLedger)}
                    className={`checkbox-card ${includeLedger ? 'checked' : ''}`}
                  >
                    <div className="checkbox-box">
                      {includeLedger && <Check className="w-4 h-4" strokeWidth={3} />}
                    </div>
                    <span>Ledger Entries</span>
                  </div>

                  <div 
                    onClick={() => setIncludeRisks(!includeRisks)}
                    className={`checkbox-card ${includeRisks ? 'checked' : ''}`}
                  >
                    <div className="checkbox-box">
                      {includeRisks && <Check className="w-4 h-4" strokeWidth={3} />}
                    </div>
                    <span>Risk Metrics</span>
                  </div>
                </div>
              </div>

              {/* Format Radio Selection */}
              <div>
                <label className="modal-section-label block">Report Format</label>
                <div className="radio-group">
                  {(['PDF', 'CSV', 'XLSX'] as const).map((fmt) => (
                    <label key={fmt} className="radio-label">
                      <div className={`radio-dot ${reportFormat === fmt ? 'selected' : ''}`} />
                      <input 
                        type="radio" 
                        name="reportFormat" 
                        checked={reportFormat === fmt}
                        onChange={() => setReportFormat(fmt)}
                        style={{ display: 'none' }}
                      />
                      <span>{fmt} (Standard)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="modal-section-label block">Start Date</label>
                  <input type="date" defaultValue="2026-01-01" className="input" />
                </div>
                <div>
                  <label className="modal-section-label block">End Date</label>
                  <input type="date" defaultValue="2026-06-30" className="input" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: 'var(--sp-xxl)' }}>
                <button type="button" onClick={() => setShowReportModal(false)} className="modal-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download className="w-4 h-4" />
                  Generate &amp; Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
