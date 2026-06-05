'use client'

import React, { useEffect, useState } from 'react'
import { Search, Bell, HelpCircle } from 'lucide-react'
import Image from 'next/image'

export default function TopBar() {
  const [name, setName] = useState('Ali')
  const [role, setRole] = useState('Admin')
  const [avatarUrl, setAvatarUrl] = useState('/admin-avatar.svg')

  useEffect(() => {
    try {
      const n = localStorage.getItem('userName')
      const r = localStorage.getItem('role')
      const a = localStorage.getItem('avatarUrl')
      if (n) setName(n)
      if (r) setRole(r)
      if (a) setAvatarUrl(a)
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-icon"><Search size={16} /></span>
        <input type="text" placeholder="Search products, insights, or regions…" />
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="badge-dot" />
        </button>
        <button className="topbar-icon-btn" aria-label="Help">
          <HelpCircle size={20} />
        </button>

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
    </header>
  )
}
