"use client"

import { useState } from 'react'
import { Search } from 'lucide-react'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'

const extendedLoans = [
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

export default function LoansPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredLoans = extendedLoans.filter(loan => {
    const matchesSearch =
      loan.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || loan.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <AdminPageShell
      title="Loan Applications"
      description="View loan applications processed by our financial partner."
    >
      <div style={{ display: 'flex', gap: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by farm name, applicant, or ID..."
            className="input"
            style={{ paddingLeft: 40 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: 220 }}>
          <select
            className="select"
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Ledger Pending">Ledger Pending</option>
            <option value="Ledger Approved">Ledger Approved</option>
            <option value="Ledger Rejected">Ledger Rejected</option>
            <option value="Ledger Needs Docs">Ledger Needs Docs</option>
          </select>
        </div>
      </div>

      {filteredLoans.length === 0 ? (
        <div style={{ padding: 'var(--sp-xxl)', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-light)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--surface-medium)' }}>
          No loan applications found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 'var(--sp-xl)' }}>
          {filteredLoans.map(loan => (
            <div key={loan.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{loan.id}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dark)' }}>{loan.farmName}</h3>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {loan.status}
                </span>
              </div>

              {/* Applicant Info */}
              <div style={{ background: 'var(--surface-light)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-md)', border: '1px solid var(--surface-medium)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)', fontSize: 13 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Full Name</div>
                    <div style={{ fontWeight: 600 }}>{loan.applicant}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Location</div>
                    <div style={{ fontWeight: 600 }}>{loan.location}</div>
                  </div>
                </div>
              </div>

              {/* Financial & Loan Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
                {/* Financial Overview */}
                <div style={{ background: 'var(--surface-light)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-md)', border: '1px solid var(--surface-medium)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Revenue</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>{loan.revenue}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Credit Score</span>
                    <span style={{ fontWeight: 700 }}>{loan.creditScore}</span>
                  </div>
                </div>

                {/* Loan Details */}
                <div style={{ background: 'var(--surface-light)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-md)', border: '1px solid var(--surface-medium)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                    <span style={{ fontWeight: 700 }}>{loan.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Term</span>
                    <span style={{ fontWeight: 700 }}>{loan.term}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
