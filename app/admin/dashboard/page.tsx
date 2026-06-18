'use client'

import React, { useState } from 'react'
import { ClipboardList, Leaf, TrendingUp } from 'lucide-react'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'

const metrics = [
  { label: 'Users', value: '1,248' },
  { label: 'Products', value: '412' },
  { label: 'Orders', value: '96' },
  { label: 'Open Alerts', value: '3' },
] as const

export default function DashboardPage() {
  const [harvestView, setHarvestView] = useState<'monthly' | 'daily'>('monthly')

  return (
    <AdminPageShell
      title="Dashboard"
      description="Overview, recent activity, and weekly order chart."
      actions={
        <>
          <a className="btn btn-secondary" href="/admin/audit-logs">View Audit Logs</a>
          <a className="btn btn-secondary" href="/admin/products">Moderate Products</a>
        </>
      }
    >
      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        {metrics.map((metric) => (
          <div key={metric.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-card-label">{metric.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(35, 107, 68, 0.1)', display: 'grid', placeItems: 'center' }}>
                <Leaf size={18} style={{ color: 'var(--primary-green)' }} />
              </div>
            </div>
            <div className="stat-card-row">
              <span className="stat-card-value">{metric.value}</span>
              <span className="stat-card-change" style={{ background: 'var(--primary-green-soft)', color: 'var(--primary-green)' }}>Live</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 'var(--sp-xl)', marginBottom: 'var(--sp-xl)' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-lg)' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Harvest Progress</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Comparison between Projected vs Actual yield (k/ton)</p>
            </div>
            
            <div style={{ display: 'flex', background: 'var(--surface-medium)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
              <button 
                onClick={() => setHarvestView('monthly')}
                style={{ 
                  background: harvestView === 'monthly' ? 'var(--white)' : 'transparent', 
                  color: harvestView === 'monthly' ? 'var(--text-dark)' : 'var(--text-muted)', 
                  border: 'none', 
                  padding: '4px 14px', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  borderRadius: 'var(--radius-pill)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  boxShadow: harvestView === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' 
                }}
              >
                Monthly
              </button>
              <button 
                onClick={() => setHarvestView('daily')}
                style={{ 
                  background: harvestView === 'daily' ? 'var(--white)' : 'transparent', 
                  color: harvestView === 'daily' ? 'var(--text-dark)' : 'var(--text-muted)', 
                  border: 'none', 
                  padding: '4px 14px', 
                  fontSize: 12, 
                  fontWeight: 600, 
                  borderRadius: 'var(--radius-pill)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s', 
                  boxShadow: harvestView === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' 
                }}
              >
                Daily
              </button>
            </div>
          </div>
          <svg width="100%" height="220" viewBox="0 0 500 220" preserveAspectRatio="none" style={{ transition: 'all 0.3s' }}>
            <line x1="30" y1="190" x2="480" y2="190" stroke="#CBD5E1" />
            {harvestView === 'monthly' ? (
              [60, 120, 180, 240, 300, 360, 420].map((x, index) => (
                <g key={`month-${x}`}>
                  <rect x={x} y={70 + index * 8} width="28" height={120 - index * 8} rx="6" fill={index % 2 === 0 ? 'var(--primary-green)' : '#CBD5E1'} />
                  <text x={x + 14} y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 11, fontWeight: 600 }}>W{index + 1}</text>
                </g>
              ))
            ) : (
              [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440].map((x, index) => (
                <g key={`day-${x}`}>
                  <rect x={x} y={90 + Math.sin(index) * 30} width="16" height={100 - Math.sin(index) * 30} rx="4" fill={index % 3 === 0 ? 'var(--primary-green)' : 'var(--surface-strong)'} />
                  <text x={x + 8} y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: 10, fontWeight: 600 }}>D{index + 1}</text>
                </g>
              ))
            )}
          </svg>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['User account deactivated', '2 mins ago'],
              ['New product listed for review', '18 mins ago'],
              ['Loan application approved', '44 mins ago'],
              ['Config updated successfully', '1 hour ago'],
            ].map(([title, time]) => (
              <div key={title} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--surface-medium)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin action</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Quick Access</h3>
          <ClipboardList size={16} color="var(--secondary-blue)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {[
            ['Users', '/users'],
            ['Orders', '/orders'],
            ['System Config', '/config'],
          ].map(([label, href]) => (
            <a key={label} href={href} style={{ padding: 16, borderRadius: 16, background: 'var(--surface-light)', border: '1px solid var(--surface-medium)', textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 700 }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </AdminPageShell>
  )
}
