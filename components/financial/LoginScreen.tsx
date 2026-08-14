'use client'

import React, { useEffect, useState } from 'react'
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, Leaf } from 'lucide-react'
import { FinancialLoginScreenProps } from '../types'
import { ApiClient } from '@/lib/api/client.ts'
import {
  FirebaseWebAuthRepository,
  type FirebaseWebAuthResult,
} from '@/lib/auth/firebase-web-auth-repository.ts'


export default function LoginScreen({ onLoginSuccess }: FinancialLoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const completeLogin = async (
    signIn: (auth: FirebaseWebAuthRepository) => Promise<FirebaseWebAuthResult | null>,
  ) => {
    setError('')
    setLoading(true)
    const auth = new FirebaseWebAuthRepository({ client: new ApiClient() })
    try {
      const result = await signIn(auth)
      if (!result) return
      if (result.kind !== 'session' || result.user.role !== 'financial_partner') {
        await auth.logout()
        throw new Error('This account is not authorized for the financial partner dashboard.')
      }
      onLoginSuccess()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const auth = new FirebaseWebAuthRepository({ client: new ApiClient() })
    auth.resumeGoogleRedirect()
      .then(async (result) => {
        if (!active || !result) return
        if (result.kind !== 'session' || result.user.role !== 'financial_partner') {
          await auth.logout()
          throw new Error('This account is not authorized for the financial partner dashboard.')
        }
        onLoginSuccess()
      })
      .catch((loginError) => {
        if (active) setError(loginError instanceof Error ? loginError.message : 'Could not complete Google sign-in.')
      })
    return () => {
      active = false
    }
  }, [onLoginSuccess])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await completeLogin((auth) => auth.signInWithEmail({ email, password }))
  }

  const signInWithGoogle = () => completeLogin((auth) => auth.signInWithGoogle())

  const resetPassword = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }
    try {
      await new FirebaseWebAuthRepository({ client: new ApiClient() }).sendPasswordReset(email.trim())
      setError('If an account exists, Firebase has sent a password-reset email.')
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not send a password-reset email.')
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(180deg, var(--bg-light) 0%, var(--surface-medium) 100%)', fontFamily: 'var(--font-sans, system-ui, sans-serif)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: 'min(100%, 1200px)', height: 'calc(100vh - 48px)', backgroundColor: 'var(--white)', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 44px rgba(27, 43, 58, 0.18)' }}>

        {/* Left Form Side */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', backgroundColor: 'var(--white)' }}>
          <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--primary-green)', color: 'var(--white)', padding: '10px', borderRadius: '12px' }}>
                  <Leaf size={22} />
                </div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>Farm2Fork</span>
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '12px' }}>
                Welcome back
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                Access the Financial Partner dashboard to manage credit evaluations and ledger approvals.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid rgba(200, 70, 58, 0.2)', color: 'var(--error-red)', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircleIcon size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '0 auto 0 16px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="partner.user@farm2fork.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '8px',
                      border: '1px solid var(--surface-medium)',
                      background: 'var(--surface-light)',
                      fontSize: '15px',
                      outline: 'none',
                      color: 'var(--text-dark)',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary-green)';
                      e.target.style.background = 'var(--white)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(35, 107, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--surface-medium)';
                      e.target.style.background = 'var(--surface-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Password
                  </label>
                  <a href="#" onClick={resetPassword} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-green)', textDecoration: 'none', marginLeft: 'auto' }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: '0 auto 0 16px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      borderRadius: '8px',
                      border: '1px solid var(--surface-medium)',
                      background: 'var(--surface-light)',
                      fontSize: '15px',
                      outline: 'none',
                      color: 'var(--text-dark)',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary-green)';
                      e.target.style.background = 'var(--white)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(35, 107, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--surface-medium)';
                      e.target.style.background = 'var(--surface-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', inset: '0 16px 0 auto', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="keepSignedIn" style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--surface-strong)', cursor: 'pointer', accentColor: 'var(--primary-green)' }} />
                <label htmlFor="keepSignedIn" style={{ fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Keep me signed in for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'var(--primary-green)',
                  color: 'var(--white)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  marginTop: '8px',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--primary-green-dark)'
                }}
                onMouseOut={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--primary-green)'
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void signInWithGoogle()}
                style={{
                  width: '100%', padding: '14px', background: 'var(--white)', color: 'var(--text-dark)',
                  borderRadius: '8px', fontSize: '15px', fontWeight: 600, border: '1px solid var(--surface-medium)', cursor: 'pointer',
                }}
              >
                Continue with Google
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--surface-medium)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Need assistance? <a href="#" style={{ color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}>Contact Credit Support</a>
            </div>

          </div>
        </div>

        {/* Right Image Side */}
        <div style={{
          flex: '1 1 50%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          color: 'var(--white)',
          background: `url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80") center/cover no-repeat`
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(32, 52, 69, 0.25), rgba(32, 52, 69, 0.9))' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.1 }}>
              Catalyzing agricultural growth through secure credit ledger.
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginTop: '16px' }}>
              Evaluate credit applications, track farm revenue, manage loan portfolios, and authorize decentralized funding disbursements on the secure credit ledger.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

function AlertCircleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  )
}
