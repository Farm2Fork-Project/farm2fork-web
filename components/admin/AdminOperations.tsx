'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { adminRepository, type AdminRepository, type AdminConfig, type AdminUser, type AuditEntry, type Page } from '@/lib/admin/admin-repository';
import './admin-operations.css';

function message(error: unknown) { return error instanceof Error ? error.message : 'The request could not be completed. Please try again.'; }
function useResource<T>(load: () => Promise<T>) {
 const [data, setData] = useState<T>();
 const [error, setError] = useState('');
 const [pending, setPending] = useState(true);
 const generation = useRef(0);
 const refresh = useCallback(async () => {
   const current = ++generation.current; setPending(true); setError('');
   try { const result = await load(); if (generation.current === current) setData(result); }
   catch (error) { if (generation.current === current) setError(message(error)); }
   finally { if (generation.current === current) setPending(false); }
 }, [load]);
 const invalidate = useCallback(() => { generation.current++; }, []);
 useEffect(() => { void refresh(); return invalidate; }, [refresh, invalidate]);
 return { data, error, pending, refresh };
}
function ReadState({ error, pending, hasData, retry }: { error: string; pending: boolean; hasData: boolean; retry: () => void }) {
 return <>{error && <div className="admin-alert" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={retry}>Retry</button></div>}{pending && <p role="status" aria-live="polite">{hasData ? 'Refreshing…' : 'Loading…'}</p>}</>;
}
function Pager({ page, total, limit, onPage, pending }: { page: number; total: number; limit: number; onPage: (page: number) => void; pending: boolean }) {
 return <nav className="admin-pager" aria-label="Results pages"><p>{total === 0 ? '0 results' : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}</p><button className="btn btn-secondary" disabled={pending || page <= 1} onClick={() => onPage(page - 1)}>Previous</button><button className="btn btn-secondary" disabled={pending || page * limit >= total} onClick={() => onPage(page + 1)}>Next</button></nav>;
}
export function DashboardScreen({ repository = adminRepository }: { repository?: AdminRepository }) {
 const load = useCallback(() => repository.overview(), [repository]);
 const { data, error, pending, refresh } = useResource(load);
 return <div className="admin-operations"><div className="admin-toolbar"><p>All-time platform totals. Orders by day use UTC.</p><button className="btn btn-secondary" disabled={pending} onClick={refresh}>Refresh overview</button></div><ReadState error={error} pending={pending} hasData={!!data} retry={refresh} />{data && <>
 <dl className="admin-totals"><div><dt>Users</dt><dd>{data.counts.users.toLocaleString()}</dd></div><div><dt>Products</dt><dd>{data.counts.products.toLocaleString()}</dd></div><div><dt>Orders</dt><dd>{data.counts.orders.toLocaleString()}</dd></div></dl>
 <section className="admin-section"><h2>Delivery operations</h2><dl className="admin-summary"><div><dt>Paid orders awaiting a driver</dt><dd><Link href="/admin/orders?status=paid&assignment=unassigned">{data.counts.unassignedPaidOrders}</Link></dd></div><div><dt>Active shipments</dt><dd><Link href="/admin/orders?deliveryIssue=active">{data.counts.activeShipments}</Link></dd></div><div><dt>Deliveries needing resolution</dt><dd><Link href="/admin/orders?deliveryIssue=unresolved">{data.counts.failedShipments}</Link></dd></div></dl><Link href="/admin/orders" className="btn btn-secondary">Inspect orders and shipments</Link></section>
 <div className="admin-columns"><section className="admin-section"><h2>Orders placed in the last 7 days</h2><div className="admin-table-wrap"><table className="data-table"><thead><tr><th scope="col">Date (UTC)</th><th scope="col">Orders</th></tr></thead><tbody>{data.weeklyOrders.map(day => <tr key={day.date}><td>{day.date}</td><td>{day.count}</td></tr>)}</tbody></table></div></section><section className="admin-section"><h2>Recent activity</h2>{data.recentActivity.length ? <ul className="admin-activity">{data.recentActivity.map(item => <li key={item.id}><strong>{item.action}</strong><p>{item.targetEntity} · {date(item.createdAt)}</p></li>)}</ul> : <p>No platform activity recorded yet.</p>}<Link href="/admin/audit-logs">View audit history</Link></section></div>
 <p className="admin-muted">Updated {date(data.generatedAt)}</p></>}</div>;
}
export function UsersScreen({ repository = adminRepository, initialUserId }: { repository?: AdminRepository; initialUserId?: string }) {
 const [searchInput, setSearchInput] = useState(''); const [search, setSearch] = useState(''); const [role, setRole] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1); const [selected, setSelected] = useState<string | undefined>(initialUserId);
 const load = useCallback(() => repository.users({ search, role, status, page }), [repository, search, role, status, page]);
 const state = useResource(load);
 const filter = (update: () => void) => { update(); setPage(1); setSelected(undefined); };
 return <div className="admin-operations"><form className="admin-toolbar" onSubmit={event => { event.preventDefault(); filter(() => setSearch(searchInput.trim())); }}><label>Search users<input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Name or email" maxLength={100} /></label><button className="btn btn-secondary" type="submit">Search</button><label>Role<select value={role} onChange={event => filter(() => setRole(event.target.value))}><option value="">All roles</option>{['farmer', 'buyer', 'transporter', 'financial_partner', 'admin'].map(value => <option value={value} key={value}>{value.replaceAll('_', ' ')}</option>)}</select></label><label>Account status<select value={status} onChange={event => filter(() => setStatus(event.target.value))}><option value="">All accounts</option><option value="active">Active</option><option value="inactive">Deactivated</option></select></label></form>
 <ReadState error={state.error} pending={state.pending} hasData={!!state.data} retry={state.refresh} />
 {state.data && <><div className="admin-table-wrap" aria-busy={state.pending}><table className="data-table"><caption className="admin-sr-only">User accounts</caption><thead><tr>{['Name and email', 'Role', 'Account', 'Joined', 'Action'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{state.data.items.map(account => <tr key={account.id}><td><strong>{account.fullName || account.email}</strong>{account.fullName && <p>{account.email}</p>}</td><td>{account.role.replaceAll('_', ' ')}</td><td>{account.isActive ? 'Active' : 'Deactivated'}</td><td>{date(account.createdAt)}</td><td><button className="btn btn-secondary" aria-label={`View ${account.fullName || account.email}`} onClick={() => setSelected(account.id)}>View</button></td></tr>)}</tbody></table>{!state.data.items.length && <p className="admin-empty">No users match these filters.</p>}</div><Pager {...state.data} onPage={setPage} pending={state.pending} /></>}
 {selected && <UserDetail key={selected} id={selected} repository={repository} onClose={() => setSelected(undefined)} onUpdated={state.refresh} />}</div>;
}
function UserDetail({ id, repository, onClose, onUpdated }: { id: string; repository: AdminRepository; onClose: () => void; onUpdated: () => Promise<void> }) {
 const load = useCallback(() => repository.user(id), [repository, id]); const state = useResource(load);
 const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
 const lock = useRef(false);
 const detailRef = useRef<HTMLElement>(null);
 useEffect(() => { detailRef.current?.focus(); }, []);
 const changeStatus = async (account: AdminUser) => {
  if (lock.current) return; lock.current = true; setBusy(true); setError(''); setSuccess('');
  try { await repository.setStatus(account.id, !account.isActive, reason.trim()); setSuccess(account.isActive ? 'Account deactivated.' : 'Account reactivated.'); setReason(''); await Promise.all([state.refresh(), onUpdated()]); }
  catch (error) { setError(message(error)); } finally { lock.current = false; setBusy(false); }
 };
 return <section className="admin-section admin-user-detail" aria-label="Account details" tabIndex={-1} ref={detailRef}><div className="admin-toolbar"><h2>Account details</h2><button className="btn btn-secondary" onClick={onClose} disabled={busy}>Close details</button></div><ReadState error={state.error} pending={state.pending} hasData={!!state.data} retry={state.refresh}/>{state.data && <><dl className="admin-summary"><div><dt>Name</dt><dd>{state.data.fullName || 'Not provided'}</dd></div><div><dt>Email</dt><dd>{state.data.email}</dd></div><div><dt>Phone</dt><dd>{state.data.phone || 'Not provided'}</dd></div><div><dt>Role</dt><dd>{state.data.role.replaceAll('_', ' ')}</dd></div><div><dt>Account</dt><dd>{state.data.isActive ? 'Active' : 'Deactivated'}</dd></div><div><dt>Email verification</dt><dd>{state.data.isVerified ? 'Verified' : 'Unverified'}</dd></div></dl>
 {state.data.role === 'admin' ? <p>Administrator access is managed outside this account action.</p> : <form onSubmit={event => { event.preventDefault(); void changeStatus(state.data!); }}><p>Resolve any active delivery or paid orders before deactivating an account.</p><label>Reason for account change<textarea value={reason} onChange={event => setReason(event.target.value)} required minLength={5} maxLength={500} rows={3} disabled={busy} /></label><button className="btn btn-primary" disabled={busy || state.pending || reason.trim().length < 5}>{busy ? 'Saving…' : state.data.isActive ? 'Deactivate account' : 'Reactivate account'}</button></form>}
 {error && <p role="alert" className="admin-alert">{error}</p>}{success && <p role="status">{success}</p>}</>}</section>;
}
export function AuditScreen({ repository = adminRepository }: { repository?: AdminRepository }) {
 const [input, setInput] = useState(''); const [search, setSearch] = useState(''); const [entity, setEntity] = useState(''); const [page, setPage] = useState(1);
 const load = useCallback(() => repository.audit({ page, search, entity }), [repository, page, search, entity]); const state = useResource(load);
 return <div className="admin-operations"><form className="admin-toolbar" onSubmit={event => { event.preventDefault(); setSearch(input.trim()); setPage(1); }}><label>Search actions<input value={input} onChange={event => setInput(event.target.value)} placeholder="For example, user.deactivated" maxLength={100}/></label><button className="btn btn-secondary">Search</button><label>Entity<select value={entity} onChange={event => { setEntity(event.target.value); setPage(1); }}><option value="">All entities</option>{['User', 'Product', 'Order', 'Shipment', 'LoanApplication', 'SystemConfig', 'Post'].map(value => <option key={value}>{value}</option>)}</select></label><button className="btn btn-secondary" type="button" disabled={state.pending} onClick={state.refresh}>Refresh history</button></form><ReadState error={state.error} pending={state.pending} hasData={!!state.data} retry={state.refresh}/>{state.data && <AuditTable data={state.data} onPage={setPage} pending={state.pending}/>}</div>;
}
function AuditTable({ data, onPage, pending }: { data: Page<AuditEntry>; onPage: (page: number) => void; pending: boolean }) {
 return <><div className="admin-table-wrap"><table className="data-table"><thead><tr>{['Time', 'Action', 'Actor', 'Record', 'Changes'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{data.items.map(item => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{item.action}</td><td>{item.actorRole}<p className="admin-muted"><Link href={`/admin/users?userId=${encodeURIComponent(item.actorId)}`}>{item.actorId}</Link></p></td><td><Link href={auditDestination(item.targetEntity, item.targetId)}>{item.targetEntity}</Link>{item.targetId && <p className="admin-muted">{item.targetId}</p>}</td><td><details><summary>Inspect recorded changes</summary><p>Only permitted fields are shown.</p><pre>{JSON.stringify(item.metadata, null, 2)}</pre></details></td></tr>)}</tbody></table>{!data.items.length && <p className="admin-empty">No audit entries match these filters.</p>}</div><Pager {...data} onPage={onPage} pending={pending}/></>;
}
export function ConfigScreen({ repository = adminRepository }: { repository?: AdminRepository }) {
 const [notice, setNotice] = useState('');
 const load = useCallback(() => repository.config(), [repository]); const state = useResource(load);
 return <div className="admin-operations"><div className="admin-toolbar"><p>Changes apply to future quotes and orders. Existing order fees stay unchanged.</p><button className="btn btn-secondary" disabled={state.pending} onClick={state.refresh}>Reload saved configuration</button></div><ReadState error={state.error} pending={state.pending} hasData={!!state.data} retry={state.refresh}/>{notice && <p role="status">{notice}</p>}{state.data && <ConfigForm key={state.data.revision} config={state.data} repository={repository} onSaved={async () => { setNotice('Configuration saved.'); await state.refresh(); }}/>}</div>;
}
function ConfigForm({ config, repository, onSaved }: { config: AdminConfig; repository: AdminRepository; onSaved: () => Promise<void> }) {
 const [values, setValues] = useState<Record<string, number | ''>>(() => Object.fromEntries(config.items.map(field => [field.key, field.effectiveValue])));
 const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const lock = useRef(false);
 const save = async () => {
  if (lock.current) return; lock.current = true; setBusy(true); setError(''); setSuccess('');
  try { await repository.saveConfig(values as Record<string, number>, config.revision, reason.trim()); setSuccess('Configuration saved.'); await onSaved(); }
  catch (error) { setError(message(error)); } finally { lock.current = false; setBusy(false); }
 };
 return <form className="admin-section" onSubmit={event => { event.preventDefault(); void save(); }}><h2>Platform settings</h2><p>Revision {config.revision}. Default values are used when a setting has not been configured or is invalid.</p><div className="admin-config-fields">{config.items.map(field => <label key={field.key}>{field.label}<input aria-label={field.label} type="number" min={field.min} max={field.max} step={field.step} required value={values[field.key]} disabled={busy} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value === '' ? '' : Number(event.target.value) }))}/><span className="admin-muted">{field.source === 'default' ? 'Using default' : 'Saved value'} · {field.min}–{field.max}</span></label>)}</div><label>Reason for configuration change<textarea required minLength={5} maxLength={500} rows={3} disabled={busy} value={reason} onChange={event => setReason(event.target.value)} /></label>{error && <p role="alert" className="admin-alert">{error}</p>}{success && <p role="status">{success}</p>}<button className="btn btn-primary" disabled={busy || reason.trim().length < 5 || Object.values(values).some(value => value === '')}>{busy ? 'Saving…' : 'Save configuration'}</button></form>;
}
function date(value: string) { const result = new Date(value); return Number.isNaN(result.getTime()) ? 'Unavailable' : result.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }); }

function auditDestination(entity: string, id?: string) {
 const query = id ? encodeURIComponent(id) : '';
 if (entity === 'User') return `/admin/users${query ? `?userId=${query}` : ''}`;
 if (entity === 'Order' || entity === 'Shipment') return `/admin/orders${query ? `?search=${query}` : ''}`;
 if (entity === 'Product') return `/admin/products${query ? `?search=${query}` : ''}`;
 if (entity === 'LoanApplication') return '/admin/loans';
 if (entity === 'SystemConfig') return '/admin/config';
 if (entity === 'DeliveryPayout') return '/admin/payouts';
 return '/admin/moderation';
}
