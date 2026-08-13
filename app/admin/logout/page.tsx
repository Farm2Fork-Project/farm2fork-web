'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RotateCcw } from 'lucide-react'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'
import { ApiClient } from '@/lib/api/client.ts'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    void new ApiClient().request('/auth/web/logout', { method: 'POST' }).catch(() => undefined)
  }, [])

  return (
    <AdminPageShell title="Logout" description="Your secure session has been cleared. Return to the login page when you want to sign in again.">
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(35, 107, 68, 0.12)', display: 'grid', placeItems: 'center', color: 'var(--primary-green)' }}>
            <LogOut size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>You are signed out</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>The app chrome stays visible so logout feels like part of the admin panel.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="sidebar-report-btn" onClick={() => router.push('/admin/login')} style={{ minWidth: 180, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RotateCcw size={16} />
            Back to Login
          </button>
          <a href="/admin/dashboard" style={{ minWidth: 180, textAlign: 'center', padding: '12px 14px', borderRadius: 14, border: '1px solid var(--surface-strong)', textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 700 }}>
            Open Dashboard
          </a>
        </div>
      </div>
    </AdminPageShell>
  )
}
