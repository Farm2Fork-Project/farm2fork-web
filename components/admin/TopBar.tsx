'use client';
import Link from 'next/link';
import { IcMenu } from '@/components/icons';
import NotificationBell from '@/components/NotificationBell';
import type { ApiAuthUser } from '@/lib/api/contracts';

export default function TopBar({ onToggleSidebar, user, navigationOpen = false }: { onToggleSidebar: () => void; user: ApiAuthUser; navigationOpen?: boolean }) {
 return <header className="topbar"><button type="button" className="topbar-icon-btn admin-menu-toggle" aria-label="Open navigation" aria-expanded={navigationOpen} aria-controls="admin-navigation" onClick={onToggleSidebar}><IcMenu size={22}/></button><span className="admin-topbar-title" style={{ flex: 1, fontWeight: 600 }}>Administration</span><NotificationBell role="admin"/><Link href="/account" className="topbar-profile admin-topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none' }}><span className="avatar" aria-hidden="true">{(user.fullName || user.email).slice(0, 1).toUpperCase()}</span><span><strong>{user.fullName || user.email}</strong><span style={{ display: 'block', fontSize: 12 }}>Administrator · Account</span></span></Link></header>;
}
