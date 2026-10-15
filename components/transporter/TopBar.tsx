"use client";
import { TopBarProps } from "./types";
import { useLanguage } from "./LanguageContext";
import NotificationBell from "@/components/NotificationBell";
import { IcLeaf } from "@/components/icons";
export default function TopBar({activeTab, setActiveTab, email}: TopBarProps) {
 const { t, language } = useLanguage(); const ur = language === 'ur';
 return <header className="topbar"><div className="topbar-logo"><IcLeaf size={24}/><h2>{t('app.title')}</h2></div><nav className="topbar-nav" aria-label={ur ? 'ٹرانسپورٹر' : 'Transporter'}>{([{tab:'shipments',label:t('tship.pageTitle')},{tab:'earnings',label:ur?'آمدنی':'Earnings'},{tab:'scan',label:t('topbar.trace')}] as const).map(item => <button type="button" key={item.tab} className={`topbar-link${activeTab===item.tab?' active':''}`} onClick={()=>setActiveTab(item.tab)}>{item.label}</button>)}</nav><div className="topbar-right"><NotificationBell role="transporter"/><a className="topbar-user" href="/account">{email}</a></div></header>;
}
