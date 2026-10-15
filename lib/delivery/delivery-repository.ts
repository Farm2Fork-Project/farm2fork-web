import { ApiClient } from '@/lib/api/client';
import type { ApiShipment } from '@/lib/api/contracts';
export type IssueReason = 'pickup_unavailable' | 'recipient_unavailable' | 'vehicle_issue' | 'other';
export interface Earning { id: string; shipmentId: string; orderId: string; transporterId: string; amount: number; status: 'unpaid' | 'paid'; earnedAt: string; payoutId?: string }
export interface Payout { id: string; transporterId: string; amount: number; paidAt: string; reference: string; createdAt: string; earningIds: string[]; reversesPayoutId?: string }
export interface Earnings { totals: { earned: number; unpaid: number; paid: number }; items: Earning[]; payouts: Payout[] }
export class DeliveryRepository {
 constructor(private client = new ApiClient()) {}
 shipments() { return this.client.request<ApiShipment[]>('/shipments'); }
 code(id: string) { return this.client.request<{ code: string; shipmentId: string }>(`/delivery/shipments/${encodeURIComponent(id)}/code`); }
 reissue(id: string) { return this.client.request<{ code: string; shipmentId: string }>(`/delivery/shipments/${encodeURIComponent(id)}/code/reissue`, { method: 'POST' }); }
 complete(id: string, code: string, note: string) { return this.client.request<ApiShipment>(`/delivery/shipments/${encodeURIComponent(id)}/complete`, { method: 'POST', body: { code, note } }); }
 issue(id: string, reason: IssueReason, note: string) { return this.client.request<ApiShipment>(`/delivery/shipments/${encodeURIComponent(id)}/issue`, { method: 'POST', body: { reason, note } }); }
 earnings(admin = false, transporterId = '') { return this.client.request<Earnings>(admin ? `/delivery/admin/earnings${transporterId ? `?transporterId=${encodeURIComponent(transporterId)}` : ''}` : '/delivery/earnings'); }
 payout(body: { transporterId: string; earningIds: string[]; amount: number; paidAt: string; reference: string; reason: string; requestId: string }) { return this.client.request<Payout>('/delivery/admin/payouts', { method: 'POST', body }); }
 reversePayout(id: string, reason: string, requestId: string) { return this.client.request<Payout>(`/delivery/admin/payouts/${encodeURIComponent(id)}/reverse`, {method: 'POST', body: {reason, requestId}}); }
 reassign(id: string, transporterId: string, reason: string) { return this.client.request<ApiShipment>(`/delivery/admin/shipments/${encodeURIComponent(id)}/reassign`, { method: 'POST', body: { transporterId, reason } }); }
 resolve(id: string, resolution: 'retry_delivery' | 'return_to_farmer', reason: string) { return this.client.request<ApiShipment>(`/delivery/admin/shipments/${encodeURIComponent(id)}/resolve`, { method: 'POST', body: { resolution, reason } }); }
}
export const deliveryRepository = new DeliveryRepository();
export const deliveryError = (error: unknown) => error instanceof Error ? error.message : 'Request failed. Please try again.';
export const money = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
