'use client'

import React from 'react'

export default function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(180deg, var(--bg-light) 0%, var(--surface-medium) 100%)', fontFamily: 'var(--font-sans, system-ui, sans-serif)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: 'min(100%, 1200px)', height: 'calc(100vh - 48px)', backgroundColor: 'var(--white)', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 44px rgba(27, 43, 58, 0.18)' }}>
        {/* Left Form Side */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', backgroundColor: 'var(--white)' }}>
          <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
            {children}
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
          background: `url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80") center/cover no-repeat`
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(32, 52, 69, 0.2), rgba(32, 52, 69, 0.85))' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.1 }}>
              Empowering the future of sustainable supply chains.
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginTop: '16px' }}>
              Monitor global harvests, analyze smart pricing trends, and maintain the ledger with real-time agricultural data insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
