import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { LanguageProvider } from './LanguageContext';
import NotificationSettings from './NotificationSettings';
const fixtures = vi.hoisted(() => ({read: false, fail: true}));
vi.mock('@/lib/api/client', () => ({ApiClient: class {async request(path: string) {
  if (path === '/notifications/read-all') { fixtures.read = true; return; }
  return {data:[{id:'n', title:'Delivery complete', message:'Your order arrived', isRead:fixtures.read}]};
}}}));
vi.mock('@/lib/notifications/firebase-push', () => ({pushOptInKey: () => 'test-push', createBrowserPushSession: () => ({enable: async () => {if (fixtures.fail) throw Error('offline'); return true;}, disable: async () => undefined})}));
test('inbox loads, failed opt-in stays retryable and read-all refreshes persisted state', async () => {
  render(<LanguageProvider><NotificationSettings /></LanguageProvider>);
  expect(await screen.findByText('Delivery complete')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Enable push notifications'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Please try again');
  fixtures.fail = false;
  fireEvent.click(screen.getByText('Enable push notifications'));
  expect(await screen.findByText('Disable push notifications')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Mark all as read'));
  await waitFor(() => expect(screen.queryByText('Unread')).not.toBeInTheDocument());
  expect(fixtures.read).toBe(true);
});
