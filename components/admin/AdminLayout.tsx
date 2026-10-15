'use client';
import './admin-operations.css';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api/client';
import { ApiError, type ApiAuthUser } from '@/lib/api/contracts';
import { LanguageProvider } from '@/components/LanguageContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout({ children }: { children: ReactNode }) {
 const router = useRouter(); const pathname = usePathname();
 const [user, setUser] = useState<ApiAuthUser>(); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [sidebarOpen, setSidebarOpen] = useState(false); const generation = useRef(0);
 const closeSidebar = useCallback(() => setSidebarOpen(false), []);
 const check = useCallback(async () => {
  const current = ++generation.current; setLoading(true); setError('');
  try { const account = await new ApiClient().request<ApiAuthUser>('/auth/me'); if (generation.current !== current) return; if (account.role !== 'admin') { router.replace(`/login?next=${encodeURIComponent(pathname || '/admin/dashboard')}`); return; } setUser(account); }
  catch (error) { if (generation.current !== current) return; if (error instanceof ApiError && (error.status === 401 || error.status === 403)) router.replace(`/login?next=${encodeURIComponent(pathname || '/admin/dashboard')}`); else setError(error instanceof Error ? error.message : 'Could not check your access.'); }
  finally { if (generation.current === current) setLoading(false); }
 }, [router, pathname]);
 const invalidate = useCallback(() => { generation.current++; }, []);
 useEffect(() => { void check(); return invalidate; }, [check, invalidate]);
 if (loading || error) return <div className="app-boundary">{loading ? <><div className="app-spinner"/><p role="status">Checking your access…</p></> : <><p role="alert">{error}</p><button className="btn btn-primary" onClick={check}>Retry access check</button></>}</div>;
 if (!user) return null;
 return <LanguageProvider><div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}><Sidebar isOpen={sidebarOpen} onClose={closeSidebar}/>{sidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.4)', zIndex: 999, border: 0 }}/>}<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}><TopBar navigationOpen={sidebarOpen} user={user} onToggleSidebar={() => setSidebarOpen(value => !value)}/><main style={{ flex: 1, padding: 'clamp(16px, 3vw, 32px)', overflowY: 'auto' }}>{children}</main></div></div></LanguageProvider>;
}
