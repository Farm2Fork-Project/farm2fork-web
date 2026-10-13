import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
const { redirect } = vi.hoisted(() => ({ redirect: vi.fn((url: string): never => { throw new Error(`redirect:${url}`); }) }));
vi.mock('next/navigation', () => ({ redirect }));
import Complete from '../app/order/complete/page';
import Cancel from '../app/order/cancel/page';
afterEach(() => { cleanup(); redirect.mockClear(); });
const orderId = '66a2fe77bb77795516febc50';
test.each([['complete', Complete], ['cancel', Cancel]] as const)('mobile %s bridge returns to the saved order', async (result, Page) => {
  render(await Page({ searchParams: Promise.resolve({ mobileOrderId: orderId }) }));
  expect(screen.getByRole('link', { name: 'Return to Farm2Fork' })).toHaveAttribute('href', `farm2fork://app/payments?orderId=${orderId}&result=${result}`);
  expect(screen.queryByText('Payment successful')).not.toBeInTheDocument();
});
test.each([undefined, 'https://attacker.example', ['66a2fe77bb77795516febc50']])('invalid mobile markers preserve the web redirect', async (mobileOrderId) => {
  await expect(Complete({ searchParams: Promise.resolve({ mobileOrderId }) })).rejects.toThrow('redirect:/?payment_return=complete');
});
