'use client'

import React, { ReactNode } from 'react'
import AdminLayout from '../AdminLayout'

export default function AdminPageShell({
  title,
  description,
  badge,
  actions,
  children,
}: {
  title: string
  description: string
  badge?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <AdminLayout>
      <div className="animate-in" style={{ position: 'relative', minHeight: 'calc(100vh - 100px)', paddingBottom: '80px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 760 }}>
            {badge && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(35, 107, 68, 0.1)', color: 'var(--primary-green)', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                {badge}
              </div>
            )}
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {actions && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {actions}
            </div>
          )}
        </div>

        {children}
      </div>
    </AdminLayout>
  )
}
