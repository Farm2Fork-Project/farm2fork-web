'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Mail, Lock, Eye, Tractor, Leaf } from 'lucide-react'
import AuthPageShell from '@/components/admin/screens/AuthPageShell'
import Link from 'next/link'
import { useState } from 'react'
import { ApiClient } from '@/lib/api/client.ts'
import { FirebaseWebAuthRepository } from '@/lib/auth/firebase-web-auth-repository.ts'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const completeAdminLogin = async (
    signIn: (auth: FirebaseWebAuthRepository) => ReturnType<FirebaseWebAuthRepository['signInWithEmail']>,
  ) => {
    setError('')
    setIsSubmitting(true)
    const auth = new FirebaseWebAuthRepository({ client: new ApiClient() })
    try {
      const result = await signIn(auth)
      if (result.kind !== 'session' || result.user.role !== 'admin') {
        await auth.logout()
        throw new Error('This account is not authorized for the admin dashboard.')
      }
      router.push('/admin/dashboard')
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const enterAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    await completeAdminLogin((auth) => auth.signInWithEmail({ email, password }))
  }

  const signInWithGoogle = () => completeAdminLogin((auth) => auth.signInWithGoogle())

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
    <AuthPageShell>
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
          Access the Supply Chain Admin dashboard to manage your harvests and marketplace.
        </p>
      </div>

      <form onSubmit={enterAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              placeholder="admin@farm2fork.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
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
            <a href="#" onClick={resetPassword} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-green)', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '0 auto 0 16px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Enter password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
            <button type="button" style={{ position: 'absolute', inset: '0 16px 0 auto', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Eye size={18} />
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
          disabled={isSubmitting}
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
            marginTop: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-green-dark)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-green)'}
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'} <ArrowRight size={18} />
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void signInWithGoogle()}
          style={{
            width: '100%', padding: '14px', background: 'var(--white)', color: 'var(--text-dark)',
            borderRadius: '8px', fontSize: '15px', fontWeight: 600, border: '1px solid var(--surface-medium)', cursor: 'pointer',
          }}
        >
          Continue with Google
        </button>
      </form>

      {error ? <p role="alert" style={{ color: 'var(--error-red)', marginTop: '16px' }}>{error}</p> : null}

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--surface-medium)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        Need assistance? <a href="#" style={{ color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}>Contact Supply Support</a>
      </div>
    </AuthPageShell>
  )
}
