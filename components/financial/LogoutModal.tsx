'use client'

import React from 'react'
import { LogOut, X } from 'lucide-react'
import { LogoutModalProps } from '../types'


export default function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '400px' }}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', color: 'var(--error-red)' }}>
            <LogOut className="w-5 h-5" />
            <h2 style={{ margin: 0 }}>Confirm Logout</h2>
          </div>
          <button onClick={onCancel} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ marginBottom: 'var(--sp-xxl)' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Are you sure you want to sign out?
          </p>
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            className="modal-btn-cancel"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="modal-btn-danger"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}
