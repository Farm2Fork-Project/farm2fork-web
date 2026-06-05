'use client'

import React, { useState } from 'react'
import {
  Tractor,
  Wallet,
  Truck,
  AlertTriangle,
  ExternalLink,
  SlidersHorizontal,
  MoreVertical,
  Plus,
  CloudSun,
  CheckCircle2,
  Info,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

export default function DashboardScreen() {
  const [activeToggle, setActiveToggle] = useState<'daily' | 'monthly'>('monthly')

  return (
    <div className="animate-in" style={{ position: 'relative', minHeight: 'calc(100vh - 100px)', paddingBottom: '80px' }}>
      {/* Header Row */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Operations Dashboard</h1>
          <p>Real-time supply chain overview for May 24, 2024</p>
        </div>
        <div className="weather-pill">
          <CloudSun size={18} style={{ color: '#0284C7' }} />
          <span>Local Weather: 24°C Sunny</span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        {/* Card 1: Active Harvests */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-card-label">Total Active Harvests</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'rgba(35, 107, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Tractor size={18} style={{ color: 'var(--primary-green)' }} />
            </div>
          </div>
          <div className="stat-card-row">
            <span className="stat-card-value">1,284</span>
            <span className="stat-card-change" style={{ background: 'var(--primary-green-soft)', color: 'var(--primary-green)' }}>+12%</span>
          </div>
        </div>

        {/* Card 2: Marketplace Revenue */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-card-label">Marketplace Revenue</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'rgba(46, 111, 142, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Wallet size={18} style={{ color: 'var(--secondary-blue)' }} />
            </div>
          </div>
          <div className="stat-card-row">
            <span className="stat-card-value">$42,905</span>
            <span className="stat-card-label" style={{ fontSize: '11px', fontWeight: 600 }}>Last 24h</span>
          </div>
        </div>

        {/* Card 3: Outstanding Orders */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-card-label">Outstanding Orders</span>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'rgba(107, 119, 108, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Truck size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div className="stat-card-row">
            <span className="stat-card-value">842</span>
            <span className="stat-card-change" style={{ background: '#FEE2E2', color: 'var(--error-red)' }}>High</span>
          </div>
        </div>

        {/* Card 4: Weather Alerts - RED Border Accent */}
        <div className="stat-card card-alert-red" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--error-red)' }} />
              <span className="stat-card-label" style={{ fontWeight: 600, color: 'var(--error-red)' }}>Active Weather Alerts</span>
            </div>
            <ExternalLink size={14} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>
          <div className="stat-card-row" style={{ marginTop: 'var(--sp-md)' }}>
            <span className="stat-card-value" style={{ color: 'var(--error-red)' }}>03 Regions</span>
          </div>
        </div>
      </div>

      {/* Middle Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 'var(--sp-xl)', marginBottom: 'var(--sp-xl)' }}>
        {/* Harvest Progress Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>Harvest Progress</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Comparison between Projected vs Actual yield (k/tons)</p>
            </div>
            {/* Toggle */}
            <div className="tab-group">
              <button
                className={`tab-item ${activeToggle === 'daily' ? 'active' : ''}`}
                onClick={() => setActiveToggle('daily')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                Daily
              </button>
              <button
                className={`tab-item ${activeToggle === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveToggle('monthly')}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* SVG Double Bar Chart */}
          <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
            <svg width="100%" height="220" viewBox="0 0 500 220" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="30" y1="30" x2="480" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="75" x2="480" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="480" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="165" x2="480" y2="165" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="30" y1="190" x2="480" y2="190" stroke="#CBD5E1" strokeWidth="1" />

              {/* Chart Legend */}
              <g transform="translate(320, 10)" style={{ fontSize: '11px', fontWeight: 600 }}>
                <rect x="0" y="0" width="12" height="12" fill="var(--primary-green)" rx="2" />
                <text x="18" y="10" fill="var(--text-dark)">Projected</text>
                <rect x="90" y="0" width="12" height="12" fill="#CBD5E1" rx="2" />
                <text x="108" y="10" fill="var(--text-muted)">Actual</text>
              </g>

              {/* Data Bars */}
              {/* Jan */}
              <g>
                <rect x="65" y="90" width="16" height="100" fill="var(--primary-green)" rx="3" />
                <rect x="83" y="110" width="16" height="80" fill="#CBD5E1" rx="3" />
                <text x="79" y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '11px', fontWeight: 600 }}>JAN</text>
              </g>
              {/* Feb */}
              <g>
                <rect x="150" y="70" width="16" height="120" fill="var(--primary-green)" rx="3" />
                <rect x="168" y="95" width="16" height="95" fill="#CBD5E1" rx="3" />
                <text x="164" y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '11px', fontWeight: 600 }}>FEB</text>
              </g>
              {/* Mar */}
              <g>
                <rect x="235" y="80" width="16" height="110" fill="var(--primary-green)" rx="3" />
                <rect x="253" y="90" width="16" height="100" fill="#CBD5E1" rx="3" />
                <text x="249" y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '11px', fontWeight: 600 }}>MAR</text>
              </g>
              {/* Apr */}
              <g>
                <rect x="320" y="50" width="16" height="140" fill="var(--primary-green)" rx="3" />
                <rect x="338" y="55" width="16" height="135" fill="#CBD5E1" rx="3" />
                <text x="334" y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '11px', fontWeight: 600 }}>APR</text>
              </g>
              {/* May */}
              <g>
                <rect x="405" y="40" width="16" height="150" fill="var(--primary-green)" rx="3" />
                <rect x="423" y="70" width="16" height="120" fill="#CBD5E1" rx="3" />
                <text x="419" y="208" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '11px', fontWeight: 600 }}>MAY</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Live Marketplace Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
              Live Marketplace Feed
              <span className="pulse-dot" />
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {/* Feed Row 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--surface-medium)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>Bulk Tomato Order</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Symmetry Farms • 2.5 Tons</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>+$4,200</span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>2 mins ago</div>
              </div>
            </div>

            {/* Feed Row 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--surface-medium)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>Wheat Futures Listed</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>North Basin Co-op</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-soft-blue" style={{ fontSize: '10px', fontWeight: 700 }}>Contract</span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>12 mins ago</div>
              </div>
            </div>

            {/* Feed Row 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--surface-medium)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>Artisan Honey Sold</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>BeeKeeper Collective</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>+$850</span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>45 mins ago</div>
              </div>
            </div>

            {/* Feed Row 4 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>Kale Logistics Update</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>GreenPath Logistics</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge" style={{ background: '#CBD5E1', color: 'var(--text-dark)', fontSize: '10px', fontWeight: 700 }}>Shipped</span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>1h ago</div>
              </div>
            </div>
          </div>

          <a href="/ledger" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--primary-green)', textDecoration: 'none', marginTop: 'auto', paddingTop: '15px' }}>
            View All Transactions
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Bottom Section: Regional Risk Assessment */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>Regional Risk Assessment</h3>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <SlidersHorizontal size={14} />
            Filter Regions
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ background: 'transparent' }}>Region</th>
              <th style={{ background: 'transparent' }}>Current Status</th>
              <th style={{ background: 'transparent' }}>Alert Level</th>
              <th style={{ background: 'transparent' }}>Yield Impact</th>
              <th style={{ background: 'transparent', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Central Valley (Sector A)</td>
              <td>
                <span className="badge badge-soft-green" style={{ fontSize: '10px' }}>Optimal</span>
              </td>
              <td>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  Clear
                </span>
              </td>
              <td style={{ fontWeight: 600, color: 'var(--success)' }}>+4.2% Projection</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                <MoreVertical size={16} style={{ cursor: 'pointer' }} />
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Northern Highlands</td>
              <td>
                <span className="badge badge-soft-red" style={{ fontSize: '10px', background: '#FEE2E2', color: 'var(--error-red)' }}>Frost Warning</span>
              </td>
              <td>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--error-red)', fontWeight: 600 }}>
                  <AlertTriangle size={14} />
                  High Risk
                </span>
              </td>
              <td style={{ fontWeight: 600, color: 'var(--error-red)' }}>-12.5% Potential Loss</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                <MoreVertical size={16} style={{ cursor: 'pointer' }} />
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Eastern Seaboard Plains</td>
              <td>
                <span className="badge badge-soft-blue" style={{ fontSize: '10px' }}>Drought Risk</span>
              </td>
              <td>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--secondary-blue)', fontWeight: 600 }}>
                  <Info size={14} />
                  Moderate
                </span>
              </td>
              <td style={{ fontWeight: 600, color: 'var(--secondary-blue)' }}>-2.0% Monitor</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                <MoreVertical size={16} style={{ cursor: 'pointer' }} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Floating Action Button (FAB) */}
      <button className="floating-btn" title="Add New Item">
        <Plus size={24} />
      </button>
    </div>
  )
}