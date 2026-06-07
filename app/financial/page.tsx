'use client'

import React, { useState, useEffect } from 'react'
import LoginScreen from '@/components/financial/LoginScreen'
import DashboardScreen from '@/components/financial/DashboardScreen'
import LoanDetailScreen from '@/components/financial/LoanDetailScreen'
import SettingsScreen from '@/components/financial/SettingsScreen'
import LogoutModal from '@/components/financial/LogoutModal'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<'queue' | 'settings' | 'detail'>('queue')
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    const auth = sessionStorage.getItem('financial_partner_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setCurrentView('queue')
  }

  const triggerLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    sessionStorage.removeItem('financial_partner_authenticated')
    setIsAuthenticated(false)
    setSelectedLoanId(null)
    setCurrentView('queue')
    setShowLogoutModal(false)
  }

  if (!mounted) return null

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <>
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
