'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send } from 'lucide-react'

export default function SupportTicketModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('Normal')

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2>Submit Support Ticket</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ marginBottom: 'var(--sp-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <div className="filter-group">
            <label className="filter-label">Priority Level</label>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Subject</label>
            <input
              type="text"
              className="input"
              placeholder="Briefly describe the issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Details</label>
            <textarea
              className="input"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Provide as much context as possible..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ paddingTop: 'var(--sp-md)', borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ gap: '8px' }}
            onClick={() => {
              // Mock submission
              alert(`Ticket Submitted:\nSubject: ${subject}\nPriority: ${priority}`);
              onClose();
            }}
          >
            <Send size={16} />
            Submit Ticket
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
