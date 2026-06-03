"use client"

import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const r = localStorage.getItem('role')
      setRole(r)
    } catch (e) {
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) return null

  // Allow static/dev preview when no role is configured (local development)
  // In production builds you may set `localStorage.role = 'admin'` or wire real auth.
  const isDevPreview = role === null
  if (role !== 'admin' && !isDevPreview) {
    return (
      <div style={{ padding: 48, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Access denied</h1>
        <p>You must be signed in as an administrator to view this panel.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}
