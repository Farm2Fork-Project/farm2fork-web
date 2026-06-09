'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Download } from 'lucide-react'

type DataSource = 'Marketplace' | 'Harvests' | 'Ledger' | 'Price Trends'
type ReportFormat = 'PDF (Standard)' | 'CSV' | 'XLSX'

const dataSources: DataSource[] = ['Marketplace', 'Harvests', 'Ledger', 'Price Trends']
const formats: ReportFormat[] = ['PDF (Standard)', 'CSV', 'XLSX']

export default function GenerateReportModal({ onClose }: { onClose: () => void }) {
  const [selectedSources, setSelectedSources] = useState<Set<DataSource>>(
    new Set(['Harvests', 'Price Trends'])
  )
  const [format, setFormat] = useState<ReportFormat>('PDF (Standard)')
  const [startDate, setStartDate] = useState('2023-10-01')
  const [endDate, setEndDate] = useState('2023-11-20')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const toggleSource = (source: DataSource) => {
    setSelectedSources((prev) => {
      const next = new Set(prev)
      if (next.has(source)) next.delete(source)
      else next.add(source)
      return next
    })
  }

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2>Generate Custom Report</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Data Sources - Row layout */}
        <div style={{ marginBottom: 'var(--sp-xl)' }}>
          <p className="modal-section-label">Select Data Source</p>
          <div className="grid-4">
            {dataSources.map((source) => {
              const checked = selectedSources.has(source)
              return (
                <div
                  key={source}
                  className={`checkbox-card${checked ? ' checked' : ''}`}
                  onClick={() => toggleSource(source)}
                >
                  <div className="checkbox-box">
                    {checked && <Check size={14} strokeWidth={3} />}
                  </div>
                  <span>{source}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Date Range & Format Side-by-Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--sp-xl)', marginBottom: 'var(--sp-xl)' }}>
          {/* Date Range */}
          <div>
            <p className="modal-section-label">Date Range Selection</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
              <div className="filter-group">
                <label className="filter-label">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Report Format */}
          <div>
            <p className="modal-section-label">Report Format</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', marginTop: 'var(--sp-xs)' }}>
              {formats.map((f) => (
                <label key={f} className="radio-label" onClick={() => setFormat(f)}>
                  <div className={`radio-dot${format === f ? ' selected' : ''}`} />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Filters */}
        <div style={{ marginBottom: 'var(--sp-xl)' }}>
          <p className="modal-section-label">Optional Filters</p>
          <div className="grid-2">
            <div className="filter-group">
              <label className="filter-label">Region</label>
              <select className="select">
                <option>All Regions</option>
                <option>Pacific Northwest</option>
                <option>Midwest Hub</option>
                <option>East Coast</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Commodity Group</label>
              <select className="select">
                <option>All Commodities</option>
                <option>Leafy Greens</option>
                <option>Grains</option>
                <option>Fruits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ paddingTop: 'var(--sp-md)', borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ gap: '8px' }}>
            <Download size={16} />
            Generate &amp; Download
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
