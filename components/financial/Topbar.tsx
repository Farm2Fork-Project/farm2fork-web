'use client'

import React, { useState } from 'react'
import { Search, Bell, HelpCircle, ArrowLeft, Leaf, LogOut } from 'lucide-react'
import { TopbarProps } from '../types'

export default function Topbar({
  currentView,
  onNavigateToQueue,
  onNavigateToSettings,
  onLogout,
  title,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  onBack,
  backLabel,
  userName = 'Partner User',
  userRole = 'Lending Partner'
}: TopbarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  return (
    <>
    <header className="topbar">
      
      {/* Left side: Brand Logo / Back Indicator */}
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-lg)' }}>
        <div 
          onClick={onNavigateToQueue} 
          className="cursor-pointer"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)' }}
        >
          <div style={{ backgroundColor: 'var(--primary-green)', color: 'var(--white)', padding: '6px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={18} strokeWidth={2.5} />
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>Farm2Fork</h2>
        </div>

        {onBack && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--surface-medium)', paddingLeft: '16px' }}>
            <button 
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: 'var(--white)', border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-dark)' }}
            >
              <ArrowLeft size={16} />
            </button>
            {backLabel && <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{backLabel}</span>}
          </div>
        )}
      </div>

      {/* Middle side: Horizontal Navigation Links */}
      <nav className="topbar-nav">
        <button
          onClick={onNavigateToQueue}
          className={`topbar-link cursor-pointer ${
            currentView === 'queue' || currentView === 'detail' ? 'active' : ''
          }`}
          style={{ background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
        >
          Credit Queue
        </button>

        <button
          onClick={onNavigateToSettings}
          className={`topbar-link cursor-pointer ${
            currentView === 'settings' ? 'active' : ''
          }`}
          style={{ background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
        >
          Settings
        </button>
      </nav>

      {/* Right side: Search, Actions & User card */}
      <div className="topbar-right">
        
        {showSearch && (
          <div className="marketplace-search" style={{ marginBottom: 0 }}>
            <span className="search-icon">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="topbar-icon-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="badge-dot" />
          </button>
          <button className="topbar-icon-btn" aria-label="Help">
            <HelpCircle size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-surface-medium" style={{ borderLeft: '1px solid var(--surface-medium)', paddingLeft: 'var(--sp-lg)' }}>
          <div className="flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>{userName}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{userRole}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowLogoutModal(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: '#FDECEC', color: 'var(--error-red)', border: 'none', cursor: 'pointer' }}
            title="Logout"
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </header>

    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '16px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
          <div className="flex-between mb-md pb-sm" style={{ borderBottom: '1px solid var(--surface-medium)' }}>
            <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Confirm Logout</h3>
          </div>
          <div className="py-md">
            <p className="text-sm text-dark font-medium">Are you sure you want to end your current session?</p>
            <p className="text-xs text-muted mt-xs">Unsaved changes in active forms may be lost.</p>
          </div>
          <div className="flex-between gap-sm pt-md mt-sm" style={{ borderTop: '1px solid var(--surface-medium)', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowLogoutModal(false)} className="btn btn-outline">
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowLogoutModal(false)
                if (onLogout) onLogout()
              }} 
              className="btn btn-primary" 
              style={{ backgroundColor: 'var(--error-red)' }}
            >
              Confirm Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
