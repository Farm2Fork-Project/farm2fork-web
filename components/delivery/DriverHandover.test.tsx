import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LanguageProvider } from '@/components/LanguageContext';
import { DriverHandover } from './DriverHandover';
import { BuyerDeliveryCode } from './BuyerDeliveryCode';
import { DeliveryRepository } from '@/lib/delivery/delivery-repository';
import type { ApiShipment } from '@/lib/api/contracts';
afterEach(cleanup);
const shipment: ApiShipment = { id:'s1', orderId:'o1', transporterId:'t1', status:'in_transit', pickupAddress:{}, deliveryAddress:{}, statusHistory:[], createdAt:'2026-10-15', updatedAt:'2026-10-15' };
test('incorrect code retains active delivery and allows corrected retry', async () => {
 const repository = new DeliveryRepository(); repository.complete = vi.fn().mockRejectedValueOnce(new Error('Invalid delivery code')).mockResolvedValue({...shipment,status:'delivered'}); const onUpdated = vi.fn();
 render(<LanguageProvider><DriverHandover shipment={shipment} repository={repository} onUpdated={onUpdated}/></LanguageProvider>);
 await userEvent.type(screen.getByLabelText('Buyer delivery code'),'111111'); await userEvent.click(screen.getByRole('button',{name:'Verify code and complete delivery'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Invalid delivery code'); expect(onUpdated).not.toHaveBeenCalled(); expect(screen.getByDisplayValue('111111')).toBeEnabled();
 await userEvent.clear(screen.getByLabelText('Buyer delivery code')); await userEvent.type(screen.getByLabelText('Buyer delivery code'),'222222'); await userEvent.click(screen.getByRole('button',{name:'Verify code and complete delivery'})); expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({status:'delivered'}));
});
test('buyer code is retrieved on request and replacement requires explicit confirmation', async () => {
 const repository = new DeliveryRepository(); repository.code = vi.fn().mockResolvedValue({code:'123456',shipmentId:'s1'}); repository.reissue = vi.fn().mockResolvedValue({code:'654321',shipmentId:'s1'});
 render(<LanguageProvider><BuyerDeliveryCode shipmentId="s1" repository={repository}/></LanguageProvider>);
 expect(repository.code).not.toHaveBeenCalled(); await userEvent.click(screen.getByRole('button',{name:'Show current code'})); expect(await screen.findByText('123456')).toBeVisible(); await userEvent.click(screen.getByRole('button',{name:'Replace code'})); expect(repository.reissue).not.toHaveBeenCalled(); expect(screen.getByText('The previous code will stop working immediately.')).toBeVisible(); await userEvent.click(screen.getByRole('button',{name:'Confirm replacement'})); expect(await screen.findByText('654321')).toBeVisible(); expect(screen.queryByText('123456')).not.toBeInTheDocument();
});
