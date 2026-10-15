import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { UsersScreen, ConfigScreen, DashboardScreen } from './AdminOperations';
import type { AdminRepository } from '@/lib/admin/admin-repository';

afterEach(cleanup);
const account = { id: 'driver', email: 'driver@test.com', role: 'transporter', fullName: 'Test Driver', isActive: true, isVerified: true, createdAt: '2026-10-15T00:00:00Z', updatedAt: '2026-10-15T00:00:00Z' };
test('users distinguish failure from empty and retry loads real accounts', async () => {
 const repo = { users: vi.fn().mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValue({ items: [account], total: 1, page: 1, limit: 20 }) };
 render(<UsersScreen repository={repo as unknown as AdminRepository} />);
 expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost');
 await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
 expect(await screen.findByText('Test Driver')).toBeInTheDocument();
 expect(screen.queryByText('No users match these filters.')).not.toBeInTheDocument();
});
test('a status failure preserves the account and reason so it can be recovered', async () => {
 const repo = { users: vi.fn().mockResolvedValue({ items: [account], total: 1, page: 1, limit: 20 }), user: vi.fn().mockResolvedValue(account), setStatus: vi.fn().mockRejectedValue(new Error('Resolve the active delivery first')) };
 render(<UsersScreen repository={repo as unknown as AdminRepository} />);
 await userEvent.click(await screen.findByRole('button', { name: 'View Test Driver' }));
 await userEvent.type(await screen.findByLabelText('Reason for account change'), 'Reported account misuse');
 await userEvent.click(screen.getByRole('button', { name: 'Deactivate account' }));
 expect(await screen.findByRole('alert')).toHaveTextContent('Resolve the active delivery first');
 expect(screen.getByLabelText('Reason for account change')).toHaveValue('Reported account misuse');
 expect(repo.setStatus).toHaveBeenCalledWith('driver', false, 'Reported account misuse');
});
test('config sends its revision and keeps unsaved values after a conflicting save', async () => {
 const repo = { config: vi.fn().mockResolvedValue({ revision: 4, items: [{ key: 'platform_fee_percent', label: 'Platform fee (%)', min: 0, max: 100, step: 0.1, effectiveValue: 5, source: 'default' }] }), saveConfig: vi.fn().mockRejectedValue(new Error('Configuration changed. Reload before saving again.')) };
 render(<ConfigScreen repository={repo as unknown as AdminRepository} />);
 const field = await screen.findByLabelText('Platform fee (%)');
 await userEvent.clear(field); await userEvent.type(field, '6');
 await userEvent.type(screen.getByLabelText('Reason for configuration change'), 'Updated fee schedule');
 await userEvent.click(screen.getByRole('button', { name: 'Save configuration' }));
 expect(await screen.findByRole('alert')).toHaveTextContent('Configuration changed');
 expect(field).toHaveValue(6);
 expect(repo.saveConfig).toHaveBeenCalledWith({ platform_fee_percent: 6 }, 4, 'Updated fee schedule');
});
test('dashboard renders persisted totals and a seven-day order history without prototype metrics', async () => {
 const repo = { overview: vi.fn().mockResolvedValue({ counts: { users: 2, products: 1, orders: 3, unassignedPaidOrders: 1, activeShipments: 0, failedShipments: 0 }, weeklyOrders: [{ date: '2026-10-15', count: 3 }], recentActivity: [], generatedAt: '2026-10-15T00:00:00Z' }) };
 render(<DashboardScreen repository={repo as unknown as AdminRepository} />);
 await waitFor(() => expect(screen.getByText('Paid orders awaiting a driver')).toBeInTheDocument());
 expect(screen.getByText('2026-10-15')).toBeInTheDocument();
 expect(screen.queryByText('Harvest Progress')).not.toBeInTheDocument();
});
