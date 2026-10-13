'use client'

import React, { useState } from 'react'
import { PortalGate } from '@/components/auth/PortalGate'
import { useRouter } from 'next/navigation'
import { ApiClient } from '@/lib/api/client.ts'
import { FirebaseWebAuthRepository } from '@/lib/auth/firebase-web-auth-repository.ts'
import DashboardScreen from '@/components/financial/DashboardScreen'
import LoanDetailScreen from '@/components/financial/LoanDetailScreen'
import SettingsScreen from '@/components/financial/SettingsScreen'
import LogoutModal from '@/components/financial/LogoutModal'
import { LanguageProvider } from '@/components/LanguageContext'

function FinancialPortal() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'queue' | 'settings' | 'detail'>('queue')
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const triggerLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setLogoutError('');
    try {
      await new FirebaseWebAuthRepository({ client: new ApiClient() }).logout();
      setSelectedLoanId(null);
      setCurrentView('queue');
      setShowLogoutModal(false);
      router.replace('/login?signedout=1');
    } catch {
      setLogoutError('Could not sign out. Please retry.');
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <>
      {logoutError ? <p role="alert">{logoutError}</p> : null}
      {currentView === 'detail' && selectedLoanId && (
        <LoanDetailScreen 
          loanId={selectedLoanId} 
          onBack={() => {
            setSelectedLoanId(null)
            setCurrentView('queue')
          }} 
          onNavigateToSettings={() => setCurrentView('settings')}
        />
      )}

      {currentView === 'settings' && (
        <SettingsScreen 
          onBackToQueue={() => {
            setSelectedLoanId(null)
            setCurrentView('queue')
          }}
          onLogout={triggerLogoutModal}
        />
      )}

      {currentView === 'queue' && (
        <DashboardScreen 
          onSelectLoan={(id) => {
            setSelectedLoanId(id)
            setCurrentView('detail')
          }} 
          onLogout={triggerLogoutModal} 
          onNavigateToSettings={() => setCurrentView('settings')}
        />
      )}

      <LogoutModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  )
}

export default function FinancialPage() {
  return (
    <LanguageProvider>
      <PortalGate role="financial_partner">{() => <FinancialPortal />}</PortalGate>
    </LanguageProvider>
  )
}
