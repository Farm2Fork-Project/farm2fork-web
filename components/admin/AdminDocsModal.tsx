'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Book, Server, Shield, Users } from 'lucide-react'

export default function AdminDocsModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Admin Documentation Hub</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: 'var(--sp-xl)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-md)' }}>
          <div style={{ padding: 'var(--sp-lg)', border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }} className="hover:bg-gray-50">
            <Users size={24} color="var(--primary-green)" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>User Management</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Learn how to onboard farmers, verify KYC, and manage buyer access limits.</p>
          </div>
          
          <div style={{ padding: 'var(--sp-lg)', border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }} className="hover:bg-gray-50">
            <Shield size={24} color="var(--secondary-blue)" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Moderation & Safety</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Guidelines for handling flagged posts, banning accounts, and dispute resolution.</p>
          </div>

          <div style={{ padding: 'var(--sp-lg)', border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }} className="hover:bg-gray-50">
            <Book size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Platform Policies</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Review terms of service, marketplace commission structures, and shipping rules.</p>
          </div>

          <div style={{ padding: 'var(--sp-lg)', border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }} className="hover:bg-gray-50">
            <Server size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>System Configuration</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage global variables, SMS gateway integrations, and payment hooks.</p>
          </div>
        </div>

        <div className="modal-actions" style={{ paddingTop: 'var(--sp-md)', borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Close Documentation
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
