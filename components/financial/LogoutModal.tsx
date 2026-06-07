'use client'

import React from 'react'
import { LogOut, X } from 'lucide-react'
import { LogoutModalProps } from '../types'


export default function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-surface-medium rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface-medium">
          <div className="flex items-center gap-2 text-error-red">
            <LogOut className="w-5 h-5" />
            <h3 className="text-base font-bold text-text-dark">Confirm Logout</h3>
          </div>
          <button onClick={onCancel} className="text-text-muted hover:text-text-dark cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 mb-6">
          <p className="text-xs text-text-muted leading-relaxed">
            Are you sure you want to sign out?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-3 border-t border-surface-medium">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-surface-medium rounded-xl text-xs font-bold text-text-dark hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-error-red hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}
