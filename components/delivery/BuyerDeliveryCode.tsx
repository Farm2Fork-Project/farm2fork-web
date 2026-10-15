'use client';
import './delivery.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { deliveryRepository, deliveryError } from '@/lib/delivery/delivery-repository';
export function BuyerDeliveryCode({ shipmentId, repository = deliveryRepository }: { shipmentId: string; repository?: typeof deliveryRepository }) {
 const { language } = useLanguage(); const ur = language === 'ur';
 const [code, setCode] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState(false); const lock = useRef(false); const generation = useRef(0);
 const invalidate = useCallback(() => { generation.current++; }, []);
 useEffect(() => { generation.current++; setBusy(false); setCode(''); setError(''); return invalidate; }, [shipmentId, invalidate]);
 async function load(reissue = false) { if (lock.current) return; lock.current = true; const version = generation.current; setBusy(true); setError(''); try { const result = await (reissue ? repository.reissue(shipmentId) : repository.code(shipmentId)); if (version === generation.current) { setCode(result.code); setConfirm(false); } } catch (e) { if (version === generation.current) setError(deliveryError(e)); } finally { lock.current = false; if (version === generation.current) setBusy(false); } }
 return <section className="delivery-panel" aria-label={ur ? 'ڈیلیوری کوڈ' : 'Delivery code'}><h3>{ur ? 'وصولی کا کوڈ' : 'Handover code'}</h3><p>{ur ? 'سامان وصول کرنے کے بعد ہی یہ کوڈ ڈرائیور کو دیں۔' : 'Share this code with the driver only after you receive your goods.'}</p>{code && <p><strong style={{ fontSize: '1.5rem', letterSpacing: '.15em' }}>{code}</strong></p>}<button className="btn btn-secondary" disabled={busy} onClick={() => void load()}>{busy ? (ur ? 'انتظار کریں…' : 'Please wait…') : ur ? 'کوڈ دکھائیں' : 'Show current code'}</button>{code && <button className="btn btn-outline" disabled={busy} onClick={() => setConfirm(!confirm)}>{ur ? 'نیا کوڈ حاصل کریں' : 'Replace code'}</button>}{confirm && <div><p>{ur ? 'پرانا کوڈ فوراً منسوخ ہو جائے گا۔' : 'The previous code will stop working immediately.'}</p><button disabled={busy} className="btn btn-secondary" onClick={() => void load(true)}>{ur ? 'نئے کوڈ کی تصدیق' : 'Confirm replacement'}</button><button disabled={busy} onClick={() => setConfirm(false)}>{ur ? 'منسوخ' : 'Cancel'}</button></div>}{error && <p role="alert">{error}</p>}</section>;
}
