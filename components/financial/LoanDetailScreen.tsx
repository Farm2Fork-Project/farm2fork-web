'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building, 
  TrendingUp, 
  Check, 
  FileText, 
  Shield, 
  X,
  Clock,
  Sparkles
} from 'lucide-react'
import { LoanApplication, LoanDetailScreenProps } from '../types'
import Topbar from './Topbar'

export default function LoanDetailScreen({ loanId, onBack, onNavigateToSettings }: LoanDetailScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [loans, setLoans] = useState<LoanApplication[]>([])
  const [loan, setLoan] = useState<LoanApplication | null>(null)
  
  // Interactive UI States
  const [rejectComments, setRejectComments] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showNeedsDocsModal, setShowNeedsDocsModal] = useState(false)
  
  // Document checklists
  const [missingDocs, setMissingDocs] = useState<string[]>([])
  const [docsStatus, setDocsStatus] = useState({
    landDeed: 'Verified',
    taxReturns: 'Verified',
    harvestLogs: 'Verified',
    bankStatements: 'Pending Review'
  })

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('partner_loans_data')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LoanApplication[]
        setLoans(parsed)
        const found = parsed.find(l => l.id === loanId)
        if (found) {
          setLoan(found)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [loanId])

  const updateLoanStatus = (newStatus: LoanApplication['status']) => {
    if (!loan) return
    const updatedLoans = loans.map(l => {
      if (l.id === loan.id) {
        return { ...l, status: newStatus }
      }
      return l
    })
    setLoans(updatedLoans)
    localStorage.setItem('partner_loans_data', JSON.stringify(updatedLoans))
    setLoan({ ...loan, status: newStatus })
  }

  const handleApprove = () => {
    if (window.confirm(`Are you sure you want to approve the credit line of ${loan?.amount} for ${loan?.farmName}?`)) {
      updateLoanStatus('Ledger Approved')
    }
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectComments.trim()) {
      alert('Please specify a rejection reason for the audit trail.')
      return
    }
    updateLoanStatus('Ledger Rejected')
    setShowRejectModal(false)
    alert(`Application rejected. Ledger entry: "${rejectComments}"`)
  }

  const handleNeedsDocsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (missingDocs.length === 0) {
      alert('Please select at least one document to request.')
      return
    }
    updateLoanStatus('Ledger Needs Docs')
    setShowNeedsDocsModal(false)
    alert(`Documentation request submitted for: ${missingDocs.join(', ')}`)
  }

  const toggleMissingDoc = (docName: string) => {
    if (missingDocs.includes(docName)) {
      setMissingDocs(missingDocs.filter(d => d !== docName))
    } else {
      setMissingDocs([...missingDocs, docName])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('financial_partner_authenticated')
    window.location.reload()
  }

  if (!mounted) return null
  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <p className="text-text-muted mb-4">Loan application not found in ledger.</p>
          <button onClick={onBack} className="px-4 py-2 bg-primary-green text-white rounded-xl font-semibold text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      
      {/* Top Bar Navigation with horizontal layout links */}
      <Topbar 
        currentView="detail"
        onNavigateToQueue={onBack}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={handleLogout}
        onBack={onBack}
        backLabel={`Assessment > ${loan.id}`}
      />

      {/* Main Panel Content */}
      <div className="app-main">
        <main className="app-content">
        
        {/* Back button and title */}
        <div className="page-header" style={{ paddingBottom: 'var(--sp-xl)', marginBottom: 'var(--sp-xl)', borderBottom: '1px solid var(--surface-medium)' }}>
          <div className="page-header-row">
            <div>
              <div className="flex-between gap-sm" style={{ justifyContent: 'flex-start' }}>
                <h2 style={{ margin: 0, fontSize: 'calc(20px * var(--font-scale, 1))' }}>Credit Review: {loan.id}</h2>
                <span className={`badge ${
                  loan.status === 'Ledger Approved' ? 'badge-soft-green' :
                  loan.status === 'Ledger Rejected' ? 'badge-soft-red' :
                  loan.status === 'Ledger Needs Docs' ? 'badge-soft-yellow' :
                  'badge-soft-blue'
                }`}>
                  {loan.status}
                </span>
              </div>
              <p className="text-sm text-muted mt-xs">Verify creditworthiness score and authorize multi-sig token ledger release.</p>
            </div>
          </div>
        </div>

        {/* Details Layout Grid */}
        <div className="grid-3 gap-xl">
          
          {/* Left Columns - Details Panels */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 'var(--sp-xl)' }}>
            
            {/* Card 1: Farmer & Farm Overview */}
            <div className="card">
              <h3 className="card-title mb-md pb-md" style={{ borderBottom: '1px solid var(--surface-medium)', display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
                <Building className="w-5 h-5" style={{ color: 'var(--primary-green)' }} />
                Applicant & Farm Registration Profile
              </h3>

              <div className="grid-2 gap-lg">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-xs">Full Legal Name</label>
                  <p className="text-sm font-bold text-dark">{loan.applicant}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-xs">Registered Farm Entity</label>
                  <p className="text-sm font-bold text-dark">{loan.farmName}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-xs">Entity Address / Location</label>
                  <p className="text-sm font-bold text-dark">{loan.location}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-xs">Borrower Status</label>
                  <p className="text-sm font-bold text-success flex-between gap-sm" style={{ justifyContent: 'flex-start' }}>
                    <span className="w-2 h-2 rounded-full bg-success"></span> Verified Active Farmer
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Financial & Credit Metrics */}
            <div className="card">
              <h3 className="card-title mb-md pb-md" style={{ borderBottom: '1px solid var(--surface-medium)', display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--secondary-blue)' }} />
                Credit Worthiness & Risk Ratios
              </h3>

              <div className="grid-3 gap-lg mb-xl">
                <div className="stat-card">
                  <span className="stat-card-label block mb-sm">FICO Credit Score</span>
                  <div className="stat-card-row">
                    <span className="stat-card-value">{loan.creditScore}</span>
                    <span className="text-xs font-bold text-muted">/ 850</span>
                  </div>
                  <div className="progress-bar mt-md">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${(loan.creditScore / 850) * 100}%`,
                        backgroundColor: loan.creditScore >= 700 ? 'var(--success)' : loan.creditScore >= 600 ? 'var(--accent-yellow)' : 'var(--error-red)' 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-card-label block mb-sm">Debt-to-Income (DTI)</span>
                  <div className="stat-card-row">
                    <span className="stat-card-value">{loan.dti}</span>
                  </div>
                  <div className="progress-bar mt-md">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${parseInt(loan.dti)}%`,
                        backgroundColor: parseInt(loan.dti) <= 25 ? 'var(--success)' : 'var(--error-red)' 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-card-label block mb-sm">Annual Crop Revenue</span>
                  <span className="stat-card-value" style={{ color: 'var(--primary-green)', display: 'block', marginTop: 'var(--sp-xs)' }}>{loan.revenue}</span>
                  <span className="text-xs text-muted font-bold block mt-xs">Yield capacity verified</span>
                </div>
              </div>

              {/* Requested Credit Terms */}
              <div className="pt-lg" style={{ borderTop: '1px solid var(--surface-medium)' }}>
                <h4 className="text-sm font-bold text-dark mb-md">Proposed Credit Terms</h4>
                <div className="grid-3 gap-lg p-lg" style={{ backgroundColor: 'var(--primary-green-soft)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-xs">Requested Funding</span>
                    <span className="text-base font-extrabold text-primary-green">{loan.amount}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-xs">Payback Schedule</span>
                    <span className="text-sm font-bold text-dark">{loan.term}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Proposed Interest Rate</span>
                    <span className="text-sm font-bold text-text-dark">{loan.interestRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Checklist / Document Verification */}
            <div className="card">
              <h3 className="card-title mb-md pb-md flex-between" style={{ borderBottom: '1px solid var(--surface-medium)' }}>
                <span className="flex items-center gap-sm">
                  <FileText className="w-5 h-5 text-dark" />
                  Documentary Verification Audit
                </span>
                <span className="text-xs text-muted font-normal">All docs are secured cryptographically</span>
              </h3>

              <div className="gap-sm flex flex-col">
                {[
                  { key: 'landDeed', title: 'Land Title Registry Deeds', desc: 'Confirms ownership / cultivation rights of Sonoma Valley estate' },
                  { key: 'taxReturns', title: 'Tax Filings & Audited Financials', desc: 'Last 2 consecutive years of declared income and capital assets' },
                  { key: 'harvestLogs', title: 'Verified Harvest Yield Logs', desc: 'IoT sensor records of previous season crop metrics and weight logs' },
                  { key: 'bankStatements', title: 'Primary Escrow Account Statements', desc: 'Cashflow analysis and credit transactional records' }
                ].map((doc) => {
                  const currentStatus = docsStatus[doc.key as keyof typeof docsStatus]
                  return (
                    <div key={doc.key} className="flex-between p-sm" style={{ border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-lg)' }}>
                      <div>
                        <h4 className="text-xs font-bold text-dark">{doc.title}</h4>
                        <p className="text-[11px] text-muted mt-xs">{doc.desc}</p>
                      </div>
                      <div className="flex items-center gap-md">
                        <span className={`badge ${
                          currentStatus === 'Verified' ? 'badge-soft-green' : 'badge-soft-yellow'
                        }`}>
                          {currentStatus}
                        </span>
                        {currentStatus !== 'Verified' ? (
                          <button 
                            onClick={() => setDocsStatus({ ...docsStatus, [doc.key]: 'Verified' })}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            Mark Verified
                          </button>
                        ) : (
                          <span className="w-5 h-5" style={{ color: 'var(--success)' }}>
                            <Check className="w-5 h-5" />
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Actions Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-xl)' }}>
            
            <div className="card" style={{ position: 'sticky', top: 'var(--sp-xxl)' }}>
              <h3 className="card-title mb-md pb-md" style={{ textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid var(--surface-medium)' }}>
                Ledger Assessment Board
              </h3>

              {/* Current Application Info */}
              <div className="gap-sm flex flex-col mb-lg">
                <div className="flex-between text-xs">
                  <span className="text-muted font-bold">Application Status</span>
                  <span className="font-bold text-dark">{loan.status}</span>
                </div>
                <div className="flex-between text-xs">
                  <span className="text-muted font-bold">Risk Exposure Assessment</span>
                  <span className={`font-bold ${
                    loan.riskProfile === 'Low' ? 'text-success' :
                    loan.riskProfile === 'Medium' ? 'text-secondary-blue' :
                    'text-error-red'
                  }`}>{loan.riskProfile} Risk</span>
                </div>
                <div className="flex-between text-xs">
                  <span className="text-muted font-bold">Interest Rate Setup</span>
                  <span className="font-bold text-dark">{loan.interestRate}</span>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="gap-sm flex flex-col mt-lg">
                {loan.status !== 'Ledger Approved' && (
                  <button
                    onClick={handleApprove}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Approve Application
                  </button>
                )}

                <button
                  onClick={() => setShowNeedsDocsModal(true)}
                  className="btn"
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-yellow)', color: 'var(--white)', border: 'none' }}
                >
                  <Clock className="w-5 h-5" />
                  Request Documentation
                </button>

                {loan.status !== 'Ledger Rejected' && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', color: 'var(--error-red)', borderColor: 'var(--surface-medium)' }}
                  >
                    <X className="w-5 h-5" />
                    Reject & Deny Credit
                  </button>
                )}
              </div>

              <div className="mt-xl pt-lg" style={{ borderTop: '1px solid var(--surface-medium)' }}>
                <div className="flex items-center gap-sm text-[11px] text-muted">
                  <Shield className="w-4 h-4" style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                  <span>Actions here directly update core system records on blockchain block consensus.</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        </main>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="flex-between mb-md">
              <h3 className="card-title">Reject Credit Request</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <p className="text-xs text-muted mb-md">Please specify a refusal rationale. This reason will be published as an immutable log on the decentralised credit ledger.</p>
              <textarea
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                placeholder="Applicant Debt-To-Income exceeds threshold..."
                rows={4}
                required
                className="input mb-md"
              />
              <div className="flex-between gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--error-red)' }}>
                  Reject Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Needs Docs Modal */}
      {showNeedsDocsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="flex-between mb-md">
              <h3 className="card-title">Request Documentation</h3>
              <button onClick={() => setShowNeedsDocsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNeedsDocsSubmit}>
              <p className="text-xs text-muted mb-md">Select the document files that require revision or resubmission by the applicant:</p>
              
              <div className="gap-sm flex flex-col mb-lg">
                {[
                  'Land Deed Deeds',
                  'Audited Financial statements',
                  'Farming registration & licenses',
                  'Recent 6-months Bank Statements',
                  'Agri-insurance policies'
                ].map((item) => (
                  <label key={item} className="flex items-center gap-sm text-xs text-dark font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={missingDocs.includes(item)}
                      onChange={() => toggleMissingDoc(item)}
                      style={{ accentColor: 'var(--primary-green)' }}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className="flex-between gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNeedsDocsModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-yellow)', color: 'var(--text-dark)' }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
