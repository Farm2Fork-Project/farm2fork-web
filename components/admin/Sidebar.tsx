'use client'

import { IcClose as X, IcLeaf as Leaf, IcMessage as MessageSquare, IcWheat as Wheat } from "@/components/icons";
import { BookOpen, LayoutDashboard, LogOut, Settings, SlidersHorizontal, Store, TrendingUp } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'


const navItems = [
  { id: 'dashboard', href: '/admin/dashboard', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', href: '/admin/users', title: 'User Management', icon: Settings },
  { id: 'products', href: '/admin/products', title: 'Products', icon: Store },
  { id: 'orders', href: '/admin/orders', title: 'Orders', icon: BookOpen },
  { id: 'payouts', href: '/admin/payouts', title: 'Transporter Payouts', icon: BookOpen },
  { id: 'loans', href: '/admin/loans', title: 'Loan Applications', icon: Wheat },
  { id: 'moderation', href: '/admin/moderation', title: 'Moderation', icon: MessageSquare },
  { id: 'audit', href: '/admin/audit-logs', title: 'Audit Logs', icon: TrendingUp },
  { id: 'config', href: '/admin/config', title: 'System Config', icon: SlidersHorizontal },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const update = () => { setNarrow(media.matches); if (!media.matches) onClose() }
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [onClose])
  useEffect(() => {
    if (!narrow || !isOpen) return
    const opener = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => opener?.focus()
  }, [narrow, isOpen])

  const handleLogout = () => {
    router.push('/admin/logout')
  }

  return (
    <>
      <aside ref={panel} id="admin-navigation" inert={narrow && !isOpen} aria-hidden={narrow && !isOpen ? true : undefined} className={`sidebar${isOpen ? ' open' : ''}`} onKeyDown={event => {
        if (!narrow || !isOpen) return
        if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
        if (event.key !== 'Tab') return
        const items = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        const first = items?.[0], last = items?.[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}>
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
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
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
            type="button"
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
          </button>
        </div>
      </aside>

      {showLogout && <LogoutConfirmation onClose={() => setShowLogout(false)} onConfirm={handleLogout}/>}
    </>
  )
}

function LogoutConfirmation({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => { const node = dialog.current; const opener = document.activeElement as HTMLElement | null; node?.showModal(); return () => { opener?.focus(); }; }, []);
  return <dialog ref={dialog} className="modal" aria-labelledby="admin-signout-title" onCancel={event => { event.preventDefault(); onClose(); }}><h2 id="admin-signout-title">Sign out of administration?</h2><p>You can sign in again to continue managing the platform.</p><div className="modal-actions"><button className="btn btn-secondary" onClick={onClose}>Stay signed in</button><button className="btn btn-primary" onClick={onConfirm}>Sign out</button></div></dialog>;
}
