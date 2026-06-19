'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Bug, Upload } from 'lucide-react'

export default function EngineeringContactModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [issueType, setIssueType] = useState('Bug Report')
  const [details, setDetails] = useState('')

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h2>Escalate to Engineering</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: 'var(--sp-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Use this form to escalate critical system bugs or infrastructure issues directly to the platform engineering team.
          </p>

          <div className="filter-group">
            <label className="filter-label">Issue Category</label>
            <select className="select" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
              <option>Bug Report</option>
              <option>Server Downtime</option>
              <option>Database Error</option>
              <option>Security Vulnerability</option>
              <option>Feature Request</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Steps to Reproduce / Details</label>
            <textarea
              className="input"
              style={{ minHeight: '140px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
              placeholder="1. Go to...\n2. Click on...\n3. Expected behavior...\n4. Actual behavior..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', border: '1px dashed var(--surface-strong)', borderRadius: '8px', cursor: 'pointer' }} className="hover:bg-gray-50">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} color="var(--text-main)" />
            </div>
            <div>
              <strong style={{ fontSize: '14px', display: 'block' }}>Attach System Logs or Screenshots</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max file size: 25MB (.log, .png, .jpg)</span>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ paddingTop: 'var(--sp-md)', borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ backgroundColor: '#1e293b', gap: '8px' }}
            onClick={() => {
              alert(`Escalated to Engineering:\nCategory: ${issueType}`);
              onClose();
            }}
          >
            <Bug size={16} />
            Submit Escalation
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
