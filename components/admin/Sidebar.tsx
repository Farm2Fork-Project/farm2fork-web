'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Wheat,
  BookOpen,
  TrendingUp,
  Settings,
  SlidersHorizontal,
  HelpCircle,
  Leaf,
  LogOut,
  MessageSquare,
  X
} from 'lucide-react'
import GenerateReportModal from './GenerateReportModal'

const navItems = [
  { id: 'dashboard', href: '/admin/dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', href: '/admin/users', title: 'User Management', icon: Settings },
  { id: 'products', href: '/admin/products', title: 'Products', icon: Store },
  { id: 'orders', href: '/admin/orders', title: 'Orders', icon: BookOpen },
  { id: 'loans', href: '/admin/loans', title: 'Loan Applications', icon: Wheat },
  { id: 'moderation', href: '/admin/moderation', title: 'Moderation', icon: MessageSquare },
  { id: 'audit', href: '/admin/audit-logs', title: 'Audit Logs', icon: TrendingUp },
  { id: 'config', href: '/admin/config', title: 'System Config', icon: SlidersHorizontal },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [showReport, setShowReport] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('role')
    localStorage.removeItem('userName')
    localStorage.removeItem('avatarUrl')
    router.push('/admin/login')
  }

  return (
    <>
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Leaf size={22} />
              Farm2Fork
            </h1>
            <p>Supply Chain Admin</p>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: '4px'
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="icon"><Icon size={18} /></span>
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button
            className={`sidebar-report-btn${showReport ? ' active' : ''}`}
            onClick={() => setShowReport(true)}
          >
            Generate Report
          </button>
          <div
            onClick={() => setShowLogout(true)}
            className="sidebar-link hover:-translate-y-[1px] hover:brightness-110 transition-all duration-200"
            style={{ 
              cursor: 'pointer', 
              marginTop: '12px', 
              color: '#ffffff',
              backgroundColor: '#ef4444',
              border: 'none',
              fontWeight: 600
            }}
          >
            <span className="icon" style={{ color: '#ffffff' }}><LogOut size={18} /></span>
            Logout
          </div>
        </div>
      </aside>

      {showReport && (
        <GenerateReportModal onClose={() => setShowReport(false)} />
      )}

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Logout</h2>
              <button className="modal-close" onClick={() => setShowLogout(false)}>
                ✕
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogout(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--error-red)' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
