import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { adminRepository } from '@/lib/admin/admin-repository';
import type { ApiShipment } from '@/lib/api/contracts';
import { DeliveryRecovery } from './DeliveryRecovery';

beforeEach(() => {
  // Transporter options come from the authenticated API; keep this visibility
  // regression independent of a running backend.
  vi.spyOn(adminRepository, 'users').mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const retriedPickup: ApiShipment = {
  id: 'shipment1', orderId: 'order1', transporterId: 'driver1',
  status: 'assigned', pickupAddress: {}, deliveryAddress: {},
  createdAt: '2026-10-15T08:00:00Z', updatedAt: '2026-10-15T10:00:00Z',
  statusHistory: [
    { status: 'assigned', timestamp: '2026-10-15T08:00:00Z' },
    { status: 'failed', timestamp: '2026-10-15T09:00:00Z' },
    { status: 'assigned', timestamp: '2026-10-15T10:00:00Z', note: 'retry_delivery: Pickup is ready again' },
  ],
  issue: {
    reason: 'pickup_unavailable', stage: 'assigned',
    reportedAt: '2026-10-15T09:00:00Z', resolvedAt: '2026-10-15T10:00:00Z',
    resolution: 'retry_delivery',
  },
};

test('allows reassignment after a pre-pickup issue was resolved by retrying', async () => {
  render(<DeliveryRecovery shipment={retriedPickup} onUpdated={() => {}} />);

  expect(await screen.findByRole('region', { name: 'Delivery recovery' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Resolution' })).toHaveValue('reassign');
  expect(screen.getByRole('option', { name: 'Reassign before pickup' })).toBeEnabled();
  expect(screen.getByRole('combobox', { name: 'New transporter' })).toBeEnabled();
});

test.each(['failed', 'delivered'] as const)('hides recovery for a closed %s shipment', (status) => {
  const shipment = {
    ...retriedPickup, status,
    issue: { ...retriedPickup.issue!, resolution: 'return_to_farmer' },
  };
  render(<DeliveryRecovery shipment={shipment} onUpdated={() => {}} />);

  expect(screen.queryByRole('region', { name: 'Delivery recovery' })).not.toBeInTheDocument();
});
