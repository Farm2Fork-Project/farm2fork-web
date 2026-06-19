"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    try {
      const r = localStorage.getItem('role')
      setRole(r)
      if (r !== 'admin') {
        router.replace('/admin/login')
      }
    } catch (e) {
      setRole(null)
      router.replace('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading || role !== 'admin') return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}
