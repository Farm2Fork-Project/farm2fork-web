import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LanguageProvider } from '@/components/LanguageContext';
import { adminRepository } from '@/lib/admin/admin-repository';
import { DeliveryRepository } from '@/lib/delivery/delivery-repository';
import { EarningsScreen, PayoutCorrection } from './EarningsScreen';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
test('admin records selected external payout once and distinguishes a failed totals refresh', async () => {
 vi.spyOn(adminRepository,'users').mockResolvedValue({items:[{id:'t1',email:'driver@example.com',role:'transporter',isActive:true,isVerified:true,createdAt:'2026-10-15',updatedAt:'2026-10-15'}],total:1,page:1,limit:20});
 const repository = new DeliveryRepository(); const data = {totals:{earned:100,paid:0,unpaid:100},items:[{id:'e1',shipmentId:'s1',orderId:'o1',transporterId:'t1',amount:100,status:'unpaid' as const,earnedAt:'2026-10-15'}],payouts:[]};
 repository.earnings = vi.fn().mockResolvedValue(data); repository.payout = vi.fn().mockResolvedValue({id:'p1',transporterId:'t1',amount:100,reference:'bank-123',paidAt:'2026-10-15',createdAt:'2026-10-15',earningIds:['e1']});
 render(<LanguageProvider><EarningsScreen admin repository={repository}/></LanguageProvider>);
 await screen.findByText('driver@example.com'); await userEvent.selectOptions(screen.getByLabelText('Transporter'),'t1'); await userEvent.click(await screen.findByLabelText('Select earning e1')); await userEvent.type(screen.getByLabelText('Transfer reference'),'bank-123'); await userEvent.type(screen.getByLabelText('Reason / payment evidence'),'Bank transfer confirmed'); fireEvent.change(screen.getByLabelText('Paid at'),{target:{value:'2026-10-15T10:00'}}); await userEvent.click(screen.getByRole('button',{name:'Review payout'})); expect(repository.payout).not.toHaveBeenCalled();
 repository.earnings = vi.fn().mockRejectedValue(new Error('Connection lost')); await userEvent.click(screen.getByRole('button',{name:'Confirm payment record'}));
 await waitFor(() => expect(repository.payout).toHaveBeenCalledTimes(1)); expect(repository.payout).toHaveBeenCalledWith(expect.objectContaining({transporterId:'t1',earningIds:['e1'],amount:100,reference:'bank-123',requestId:expect.any(String)})); expect(await screen.findByRole('alert')).toHaveTextContent('Payout saved.'); expect(screen.getByRole('status')).toHaveTextContent('External payout recorded'); expect(screen.queryByRole('button',{name:'Confirm payment record'})).not.toBeInTheDocument();
});

test('clerical correction requires explicit no-transfer confirmation and preserves its request identity on retry', async () => {
 const repository = new DeliveryRepository();
 repository.reversePayout = vi.fn().mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValue({id:'r1'});
 const onSaved = vi.fn().mockResolvedValue(undefined);
 render(<PayoutCorrection payoutId="p1" repository={repository} onSaved={onSaved}/>);
 await userEvent.click(screen.getByText('Correct a mistaken payment record'));
 const submit = screen.getByRole('button',{name:'Record clerical correction'});
 expect(submit).toBeDisabled();
 await userEvent.type(screen.getByLabelText('Reason for payout correction'),'Entered against wrong transfer');
 expect(submit).toBeDisabled();
 await userEvent.click(screen.getByRole('checkbox'));
 await userEvent.click(submit);
 expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost');
 expect(onSaved).not.toHaveBeenCalled();
 await userEvent.click(submit);
 await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
 const calls = vi.mocked(repository.reversePayout).mock.calls;
 expect(calls[0]).toEqual(['p1','Entered against wrong transfer',expect.any(String)]);
 expect(calls[1]).toEqual(calls[0]);
});
