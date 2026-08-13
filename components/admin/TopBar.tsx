'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Menu, Search, Bell, HelpCircle, UserPlus, AlertTriangle, Activity, FileText, LifeBuoy, Mail } from 'lucide-react'
import Image from 'next/image'
import SupportTicketModal from './SupportTicketModal'
import AdminDocsModal from './AdminDocsModal'
import EngineeringContactModal from './EngineeringContactModal'

export default function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [name, setName] = useState('Ali')
  const [role, setRole] = useState('Admin')
  const [avatarUrl, setAvatarUrl] = useState('/admin-avatar.svg')

  const [showNotif, setShowNotif] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showDocsModal, setShowDocsModal] = useState(false)
  const [showEngModal, setShowEngModal] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotif(false)
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) setShowHelp(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="topbar">
      <button
        onClick={onToggleSidebar}
        className="topbar-menu-btn"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dark)'
        }}
        aria-label="Toggle menu"
      >
        <Menu size={22} />
      </button>
      <div className="topbar-search">
        <span className="search-icon"><Search size={16} /></span>
        <input type="text" placeholder="Search products, insights, or regions…" />
      </div>

      <div className="topbar-actions">
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="topbar-icon-btn" 
            aria-label="Notifications"
            onClick={() => { setShowNotif(!showNotif); setShowHelp(false); }}
          >
            <Bell size={20} />
            <span className="badge-dot" />
          </button>
          
          {showNotif && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "12px",
              backgroundColor: "var(--white)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              width: "360px",
              zIndex: 100,
              padding: "16px",
              color: "var(--text-main)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>System Alerts</h4>
                <span style={{ fontSize: "13px", color: "var(--primary-green)", cursor: "pointer", fontWeight: 500 }}>Mark all read</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "350px", overflowY: "auto", margin: "0 -8px" }}>
                
                <div style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.05)", cursor: "pointer" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", flexShrink: 0 }}>
                    <UserPlus size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>New Farmer Signup</strong>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", marginTop: "4px" }}></span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>Zafar Farm requests approval for marketplace access.</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>10 mins ago</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", cursor: "pointer" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>Moderation Alert</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>A post was flagged multiple times by community users.</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>2 hours ago</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", padding: "12px 8px", borderRadius: "8px", cursor: "pointer" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-green)", flexShrink: 0 }}>
                    <Activity size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "14px", color: "var(--text-main)" }}>System Health</strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>Daily backup completed successfully across all nodes.</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>Yesterday</div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={helpRef}>
          <button 
            className="topbar-icon-btn" 
            aria-label="Help"
            onClick={() => { setShowHelp(!showHelp); setShowNotif(false); }}
          >
            <HelpCircle size={20} />
          </button>
          
          {showHelp && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "12px",
              backgroundColor: "var(--white)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              width: "240px",
              zIndex: 100,
              padding: "8px",
              color: "var(--text-main)"
            }}>
              <div 
                onClick={() => { setShowDocsModal(true); setShowHelp(false); }}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }} 
                className="hover:bg-gray-50"
              >
                <FileText size={18} color="var(--text-muted)" />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>Admin Documentation</span>
              </div>
              <div 
                onClick={() => { setShowEngModal(true); setShowHelp(false); }}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }} 
                className="hover:bg-gray-50"
              >
                <LifeBuoy size={18} color="var(--text-muted)" />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>Contact Engineering</span>
              </div>
              <div style={{ height: "1px", background: "var(--border-color)", margin: "4px 0" }}></div>
              <div 
                onClick={() => { setShowSupportModal(true); setShowHelp(false); }}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }} 
                className="hover:bg-gray-50"
              >
                <Mail size={18} color="var(--text-muted)" />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>Submit Support Ticket</span>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-user">
          <div className="topbar-avatar" style={{ overflow: 'hidden' }}>
            <Image src={avatarUrl} alt="Admin avatar" width={32} height={32} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{name}</span>
            <span className="topbar-user-role">{role}</span>
          </div>
        </div>
      </div>
      
      {showSupportModal && <SupportTicketModal onClose={() => setShowSupportModal(false)} />}
      {showDocsModal && <AdminDocsModal onClose={() => setShowDocsModal(false)} />}
      {showEngModal && <EngineeringContactModal onClose={() => setShowEngModal(false)} />}
    </header>
  )
}
