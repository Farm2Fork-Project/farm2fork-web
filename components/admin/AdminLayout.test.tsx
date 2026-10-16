import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { ApiError } from '@/lib/api/contracts';
import AdminLayout from './AdminLayout';
const mocks = vi.hoisted(() => ({ request: vi.fn(), replace: vi.fn() }));
vi.mock('@/lib/api/client', () => ({ ApiClient: class { request = mocks.request; } }));
vi.mock('next/navigation', () => { const router = { replace: mocks.replace }; return { useRouter: () => router, usePathname: () => '/admin/users' }; });
vi.mock('./Sidebar', () => ({ default: () => <nav>Admin navigation</nav> }));
vi.mock('./TopBar', () => ({ default: ({ user }: { user: { email: string } }) => <header>{user.email}</header> }));
vi.mock('@/components/LanguageContext', () => ({ LanguageProvider: ({ children }: { children: React.ReactNode }) => children }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
test('a network failure offers retry without redirecting to login or exposing page contents', async () => {
 mocks.request.mockRejectedValueOnce(new ApiError(0, 'Network request failed.')).mockResolvedValueOnce({ role: 'admin', email: 'actual@test.com' });
 render(<AdminLayout><p>Private operations</p></AdminLayout>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Network request failed');
 expect(mocks.replace).not.toHaveBeenCalled();
 expect(screen.queryByText('Private operations')).not.toBeInTheDocument();
 await userEvent.click(screen.getByRole('button', { name: 'Retry access check' }));
 expect(await screen.findByText('Private operations')).toBeInTheDocument();
 expect(screen.getByText('actual@test.com')).toBeInTheDocument();
});
test('expired access keeps the requested admin destination when returning to login', async () => {
 mocks.request.mockRejectedValueOnce(new ApiError(401, 'Your session has expired.'));
 render(<AdminLayout><p>Private operations</p></AdminLayout>);
 await screen.findByText('Checking your access…');
 await vi.waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/login?next=%2Fadmin%2Fusers'));
});
