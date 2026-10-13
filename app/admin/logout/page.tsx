"use client";

import { LogOut, RotateCcw } from "lucide-react";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'
import { ApiClient } from '@/lib/api/client.ts'
import { FirebaseWebAuthRepository } from '@/lib/auth/firebase-web-auth-repository.ts'

export default function LogoutPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'complete' | 'failed'>('pending')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true;
    void new FirebaseWebAuthRepository({ client: new ApiClient() }).logout()
      .then(() => { if (active) setStatus('complete'); })
      .catch(() => { if (active) setStatus('failed'); });
    return () => { active = false; };
  }, [attempt])

  return (
    <AdminPageShell title="Logout" description={status === 'complete' ? "Your secure session has been cleared. Return to the login page when you want to sign in again." : "Clearing your session and push notification registration."}>
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(35, 107, 68, 0.12)', display: 'grid', placeItems: 'center', color: 'var(--primary-green)' }}>
            <LogOut size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)' }}>{status === 'complete' ? "You are signed out" : status === 'failed' ? "Could not sign out" : "Signing out…"}</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>The app chrome stays visible so logout feels like part of the admin panel.</p>
          </div>
        </div>

        {status === 'failed' ? <p role="alert">Could not clear your session. Retry signing out.</p> : null}
        {status === 'failed' ? <button type="button" className="btn btn-primary" onClick={() => { setStatus('pending'); setAttempt((value) => value + 1); }}>Retry sign out</button> : null}
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
