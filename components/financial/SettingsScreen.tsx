'use client'

import { useLanguage } from '@/components/LanguageContext'

import { IcCheckCircle as CheckCircle, IcUser as User } from "@/components/icons";
import { Save, Settings, Shield } from "lucide-react";
import React, { useState, useEffect } from 'react'
import { SettingsScreenProps, UserProfile } from '../types'
import Topbar from './Topbar'

const defaultProfile: UserProfile = {
  fullName: 'Partner User',
  email: 'partner.user@farm2fork.org',
  role: 'Lending Partner Manager',
  currency: 'PKR',
  defaultRepaymentTerm: '36 Months',
  newAppAlerts: true,
  weeklySummaryAlerts: false,
  twoFactorAuth: false
}

export default function SettingsScreen({ onBackToQueue, onLogout }: SettingsScreenProps) {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile')
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('farm2fork_user_profile')
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only saved form preferences after hydration.
        setProfile(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('farm2fork_user_profile', JSON.stringify(profile))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div dir={language === 'ur' ? 'rtl' : 'ltr'} className="app-shell" style={{ flexDirection: 'column' }}>

      {/* Top Bar Navigation with horizontal layout links */}
      <Topbar
        currentView="settings"
        onNavigateToQueue={onBackToQueue}
        onNavigateToSettings={() => {}}
        onLogout={onLogout}
        title={t("financial.accountSettings")}
        userName={profile.fullName}
        userRole={profile.role}
      />

      {/* Dashboard Panels */}
      <div className="app-main">
        <main className="app-content">

        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>{t("financial.settings")}</h1>
              <p>{t("financial.manageYourUserProfileDetailsSystem")}</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex-between gap-xs p-xs mb-xl" style={{ border: '1px solid var(--surface-medium)', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--white)' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeTab === 'profile' ? 'var(--primary-green-soft)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--primary-green)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 16px'
            }}
          >
            <User className="w-4 h-4" />
            <span>{t("financial.personalProfile")}</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className="btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeTab === 'preferences' ? 'var(--primary-green-soft)' : 'transparent',
              color: activeTab === 'preferences' ? 'var(--primary-green)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 16px'
            }}
          >
            <Settings className="w-4 h-4" />
            <span>{t("financial.systemPreferences")}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: activeTab === 'notifications' ? 'var(--primary-green-soft)' : 'transparent',
              color: activeTab === 'notifications' ? 'var(--primary-green)' : 'var(--text-muted)',
              border: 'none',
              padding: '8px 16px'
            }}
          >
            <Shield className="w-4 h-4" />
            <span>{t("financial.notificationsSecurity")}</span>
          </button>
        </div>

        {/* Tab Content Form */}
        <div className="card">
          <form onSubmit={handleSave} className="flex flex-col gap-xl">

            {activeTab === 'profile' && (
              <div className="flex flex-col gap-xl">
                <div className="flex items-center gap-sm pb-md" style={{ borderBottom: '1px solid var(--surface-medium)' }}>
                  <User className="w-5 h-5" style={{ color: 'var(--primary-green)' }} />
                  <div>
                    <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>{t("financial.personalProfileDetails")}</h3>
                    <p className="text-xs text-muted">{t("financial.manageYourPersonalIdentificationInfoUsed")}</p>
                  </div>
                </div>

                <div className="grid-2 gap-xl">
                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">{t("financial.fullLegalName")}</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder={t("financial.eGPartnerUser")}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">{t("financial.corporateEmailAddress")}</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder={t("financial.eGPartnerUserFarm2ForkOrg")}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">{t("financial.assignedRole")}</label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="input"
                      style={{ backgroundColor: 'var(--surface-medium)', color: 'var(--text-muted)', cursor: 'not-allowed', borderColor: 'transparent' }}
                    />
                    <p className="text-[10px] text-muted mt-xs">{t("financial.lendingTeamRolesAreDefinedBy")}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="flex flex-col gap-xl">
                <div className="flex items-center gap-sm pb-md" style={{ borderBottom: '1px solid var(--surface-medium)' }}>
                  <Settings className="w-5 h-5" style={{ color: 'var(--primary-green)' }} />
                  <div>
                    <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>{t("financial.lendingPreferences")}</h3>
                    <p className="text-xs text-muted">{t("financial.setUpDefaultsForCurrencyRepresentations")}</p>
                  </div>
                </div>

                <div className="grid-2 gap-xl">
                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">{t("financial.displayCurrency")}</label>
                    <select
                      value={profile.currency}
                      onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="PKR">{t("financial.pakistaniRupeePkr")}</option>
                      <option value="USD">{t("financial.usDollarUsd")}</option>
                      <option value="EUR">{t("financial.euroEur")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">{t("financial.defaultPreferredRepaymentTerm")}</label>
                    <select
                      value={profile.defaultRepaymentTerm}
                      onChange={(e) => setProfile({ ...profile, defaultRepaymentTerm: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="12 Months">{t("financial.12Months")}</option>
                      <option value="24 Months">{t("financial.24Months")}</option>
                      <option value="36 Months">{t("financial.36Months")}</option>
                      <option value="48 Months">{t("financial.48Months")}</option>
                      <option value="60 Months">{t("financial.60Months")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-xl">
                <div className="flex items-center gap-sm pb-md" style={{ borderBottom: '1px solid var(--surface-medium)' }}>
                  <Shield className="w-5 h-5" style={{ color: 'var(--primary-green)' }} />
                  <div>
                    <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>{t("financial.alertsAccessControls")}</h3>
                    <p className="text-xs text-muted">{t("financial.chooseWhenYouWishToReceive")}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-lg">
                  <label className="flex items-start gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      onChange={(e) => setProfile({ ...profile, newAppAlerts: e.target.checked })}
                      style={{ accentColor: 'var(--primary-green)', marginTop: '2px' }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-dark">{t("financial.newLoanApplicationAlerts")}</span>
                      <span className="text-[10px] text-muted">{t("financial.notifyMeImmediatelyByEmailWhenever")}</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      onChange={(e) => setProfile({ ...profile, weeklySummaryAlerts: e.target.checked })}
                      style={{ accentColor: 'var(--primary-green)', marginTop: '2px' }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-dark">{t("financial.weeklySummaryReports")}</span>
                      <span className="text-[10px] text-muted">{t("financial.sendADigestedSummaryOfLedger")}</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-sm cursor-pointer pt-md" style={{ borderTop: '1px solid var(--surface-medium)' }}>
                    <input
                      type="checkbox"
                      disabled
                      checked={false}
                      onChange={(e) => setProfile({ ...profile, twoFactorAuth: e.target.checked })}
                      style={{ accentColor: 'var(--primary-green)', marginTop: '2px' }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-dark font-sans">{t("financial.enableTwoFactorAuthentication")}</span>
                      <span className="text-[10px] text-muted">{t("financial.requireVerificationCodeAlongsideStandardLogin")}</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Action Section */}
            <div className="flex-between pt-lg mt-lg" style={{ borderTop: '1px solid var(--surface-medium)' }}>
              {isSaved ? (
                <div className="flex items-center gap-sm text-success font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t("financial.yourPreferencesWereUpdatedSuccessfully")}</span>
                </div>
              ) : (
                <div className="text-[11px] text-muted">
                  <span>{t("financial.changesTakeEffectImmediatelyOnCurrent")}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                <span>{t("financial.saveSettings")}</span>
              </button>
            </div>
          </form>
        </div>

        </main>
      </div>
    </div>
  )
}
