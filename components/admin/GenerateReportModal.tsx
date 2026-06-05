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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ padding: '16px 20px', maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Generate Custom Report</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" style={{ padding: '2px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Data Sources - Row layout */}
        <p className="modal-section-label" style={{ marginTop: 0, marginBottom: '6px' }}>Select Data Source</p>
        <div className="grid-4" style={{ gap: '6px', marginBottom: '12px' }}>
          {dataSources.map((source) => {
            const checked = selectedSources.has(source)
            return (
              <div
                key={source}
                className={`checkbox-card${checked ? ' checked' : ''}`}
                onClick={() => toggleSource(source)}
                style={{ padding: '6px 8px', fontSize: '12px', gap: '6px', borderRadius: 'var(--radius-sm)' }}
              >
                <div className="checkbox-box" style={{ width: '14px', height: '14px', borderWidth: '1px', borderRadius: '3px' }}>
                  {checked && <Check size={10} strokeWidth={3} />}
                </div>
                <span style={{ whiteSpace: 'nowrap' }}>{source}</span>
              </div>
            )
          })}
        </div>

        {/* Date Range & Format Side-by-Side to save vertical space */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '16px', marginBottom: '12px' }}>
          {/* Date Range */}
          <div>
            <p className="modal-section-label" style={{ marginTop: 0, marginBottom: '6px' }}>Date Range Selection</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="filter-group">
                <label className="filter-label" style={{ fontSize: '10px' }}>Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '5px 8px', fontSize: '12px' }}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label" style={{ fontSize: '10px' }}>End Date</label>
                <input
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '5px 8px', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Report Format */}
          <div>
            <p className="modal-section-label" style={{ marginTop: 0, marginBottom: '6px' }}>Report Format</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {formats.map((f) => (
                <label key={f} className="radio-label" onClick={() => setFormat(f)} style={{ fontSize: '12px', gap: '6px' }}>
                  <div
                    className={`radio-dot${format === f ? ' selected' : ''}`}
                    style={{ width: '14px', height: '14px', borderWidth: '1.5px', flexShrink: 0 }}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Filters */}
        <p className="modal-section-label" style={{ marginTop: 0, marginBottom: '6px' }}>Optional Filters</p>
        <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
          <div className="filter-group">
            <label className="filter-label" style={{ fontSize: '10px' }}>Region</label>
            <select className="select" style={{ width: '100%', padding: '5px 24px 5px 8px', fontSize: '12px' }}>
              <option>All Regions</option>
              <option>Pacific Northwest</option>
              <option>Midwest Hub</option>
              <option>East Coast</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label" style={{ fontSize: '10px' }}>Commodity Group</label>
            <select className="select" style={{ width: '100%', padding: '5px 24px 5px 8px', fontSize: '12px' }}>
              <option>All Commodities</option>
              <option>Leafy Greens</option>
              <option>Grains</option>
              <option>Fruits</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ marginTop: '12px', paddingTop: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}>
            <Download size={14} />
            Generate &amp; Download
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
