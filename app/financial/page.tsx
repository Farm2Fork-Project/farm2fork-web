'use client'

import { useHydrated } from '@/lib/react/use-hydrated';

import React, { useState, useEffect } from 'react'
import LoginScreen from '@/components/financial/LoginScreen'
import DashboardScreen from '@/components/financial/DashboardScreen'
import LoanDetailScreen from '@/components/financial/LoanDetailScreen'
import SettingsScreen from '@/components/financial/SettingsScreen'
import LogoutModal from '@/components/financial/LogoutModal'
import { ApiClient } from '@/lib/api/client.ts'
import { FirebaseWebAuthRepository } from '@/lib/auth/firebase-web-auth-repository.ts'
import { webSession } from '@/lib/auth/web-session.ts'
import type { ApiAuthUser } from '@/lib/api/contracts.ts'
import { LanguageProvider } from '@/components/LanguageContext'

function FinancialPortal() {
  const mounted = useHydrated();
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<'queue' | 'settings' | 'detail'>('queue')
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    new ApiClient().request<ApiAuthUser>('/auth/me')
      .then((user) => {
        if (user.role === 'financial_partner') webSession.save({ user });
        setIsAuthenticated(user.role === 'financial_partner');
      })
      .catch(() => setIsAuthenticated(false))
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setCurrentView('queue')
  }

  const triggerLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setLogoutError('');
    try {
      await new FirebaseWebAuthRepository({ client: new ApiClient() }).logout();
      setIsAuthenticated(false);
      setSelectedLoanId(null);
      setCurrentView('queue');
      setShowLogoutModal(false);
    } catch {
      setLogoutError('Could not sign out. Please retry.');
    } finally {
      setLogoutBusy(false);
    }
  }

  if (!mounted) return null

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
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
      <FinancialPortal />
    </LanguageProvider>
  )
}
