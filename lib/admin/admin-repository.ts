import { ApiClient } from '@/lib/api/client';
import type { UserRole } from '@/lib/api/contracts';
export interface Page<T> { items: T[]; total: number; page: number; limit: number }
export interface AdminUser { id: string; email: string; fullName?: string; phone?: string; role: UserRole; isActive: boolean; isVerified: boolean; createdAt: string; updatedAt: string }
export interface AuditEntry { id: string; actorId: string; actorRole: string; action: string; targetEntity: string; targetId?: string; createdAt: string; metadata: { before: Record<string, unknown>; after: Record<string, unknown> } }
export interface AdminOverview { counts: { users: number; products: number; orders: number; unassignedPaidOrders: number; activeShipments: number; failedShipments: number }; weeklyOrders: { date: string; count: number }[]; recentActivity: AuditEntry[]; generatedAt: string }
export interface ConfigField { key: string; label: string; min: number; max: number; step: number; effectiveValue: number; source: 'stored' | 'default'; updatedAt?: string }
export interface AdminConfig { revision: number; items: ConfigField[] }
export class AdminRepository {
  constructor(private readonly client = new ApiClient()) {}
  overview() { return this.client.request<AdminOverview>('/admin/overview'); }
  users(query: { search?: string; role?: string; status?: string; page: number }) { return this.client.request<Page<AdminUser>>(`/admin/users?${params(query)}`); }
  user(id: string) { return this.client.request<AdminUser>(`/admin/users/${encodeURIComponent(id)}`); }
  setStatus(id: string, isActive: boolean, reason: string) { return this.client.request<AdminUser>(`/admin/users/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { isActive, reason } }); }
  audit(query: { search?: string; entity?: string; page: number }) { return this.client.request<Page<AuditEntry>>(`/admin/audit-logs?${params(query)}`); }
  config() { return this.client.request<AdminConfig>('/admin/config'); }
  saveConfig(values: Record<string, number>, revision: number, reason: string) { return this.client.request<AdminConfig>('/admin/config', { method: 'PATCH', body: { values, revision, reason } }); }
}
function params(query: Record<string, string | number | undefined>) { const result = new URLSearchParams(); for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== '') result.set(key, String(value)); return result.toString(); }
export const adminRepository = new AdminRepository();
