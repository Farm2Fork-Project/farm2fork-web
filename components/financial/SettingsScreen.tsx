'use client'

import React, { useState, useEffect } from 'react'
import {
  Save,
  CheckCircle,
  User,
  Shield,
  Settings
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile')
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('farm2fork_user_profile')
    if (stored) {
      try {
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
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      
      {/* Top Bar Navigation with horizontal layout links */}
      <Topbar 
        currentView="settings"
        onNavigateToQueue={onBackToQueue}
        onNavigateToSettings={() => {}}
        onLogout={onLogout}
        title="Account Settings"
        userName={profile.fullName}
        userRole={profile.role}
      />

      {/* Dashboard Panels */}
      <div className="app-main">
        <main className="app-content">
        
        <div className="page-header" style={{ paddingBottom: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }}>
          <div className="page-header-row">
            <div>
              <h2 style={{ margin: 0, fontSize: 'calc(24px * var(--font-scale, 1))' }}>Settings</h2>
              <p className="text-sm text-muted mt-xs">
                Manage your user profile details, system preferences, and security notifications.
              </p>
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
            <span>Personal Profile</span>
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
            <span>System Preferences</span>
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
            <span>Notifications &amp; Security</span>
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
                    <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Personal Profile Details</h3>
                    <p className="text-xs text-muted">Manage your personal identification info used in loan evaluation trails.</p>
                  </div>
                </div>

                <div className="grid-2 gap-xl">
                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">Full Legal Name</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="e.g. Partner User"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">Corporate Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="e.g. partner.user@farm2fork.org"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">Assigned Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="input"
                      style={{ backgroundColor: 'var(--surface-medium)', color: 'var(--text-muted)', cursor: 'not-allowed', borderColor: 'transparent' }}
                    />
                    <p className="text-[10px] text-muted mt-xs">Lending team roles are defined by your organization admin.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="flex flex-col gap-xl">
                <div className="flex items-center gap-sm pb-md" style={{ borderBottom: '1px solid var(--surface-medium)' }}>
                  <Settings className="w-5 h-5" style={{ color: 'var(--primary-green)' }} />
                  <div>
                    <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Lending Preferences</h3>
                    <p className="text-xs text-muted">Set up defaults for currency representations and lending terms.</p>
                  </div>
                </div>

                <div className="grid-2 gap-xl">
                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">Display Currency</label>
                    <select
                      value={profile.currency}
                      onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="PKR">Pakistani Rupee (PKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-xs">Default Preferred Repayment Term</label>
                    <select
                      value={profile.defaultRepaymentTerm}
                      onChange={(e) => setProfile({ ...profile, defaultRepaymentTerm: e.target.value })}
                      className="input cursor-pointer"
                    >
                      <option value="12 Months">12 Months</option>
                      <option value="24 Months">24 Months</option>
                      <option value="36 Months">36 Months</option>
                      <option value="48 Months">48 Months</option>
                      <option value="60 Months">60 Months</option>
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
                    <h3 className="card-title" style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Alerts &amp; Access Controls</h3>
                    <p className="text-xs text-muted">Choose when you wish to receive notifications and manage session security.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-lg">
                  <label className="flex items-start gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.newAppAlerts}
                      onChange={(e) => setProfile({ ...profile, newAppAlerts: e.target.checked })}
                      style={{ accentColor: 'var(--primary-green)', marginTop: '2px' }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-dark">New Loan Application Alerts</span>
                      <span className="text-[10px] text-muted">Notify me immediately by email whenever a farmer submits a new evaluation request.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.weeklySummaryAlerts}
                      onChange={(e) => setProfile({ ...profile, weeklySummaryAlerts: e.target.checked })}
                      style={{ accentColor: 'var(--primary-green)', marginTop: '2px' }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-dark">Weekly Summary Reports</span>
                      <span className="text-[10px] text-muted">Send a digested summary of ledger approvals and rejection statistics every Monday morning.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-sm cursor-pointer pt-md" style={{ borderTop: '1px solid var(--surface-medium)' }}>
                    <input
                      type="checkbox"
                      checked={profile.twoFactorAuth}
                      onChange={(e) => setProfile({ ...profile, twoFactorAuth: e.target.checked })}
                      style={{ accentColor: 'var(--primary-green)', marginTop: '2px' }}
                    />
                    <div>
                      <span className="block text-xs font-bold text-dark font-sans">Enable Two-Factor Authentication</span>
                      <span className="text-[10px] text-muted">Require verification code alongside standard login credentials to evaluation board.</span>
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
                  <span>Your preferences were updated successfully!</span>
                </div>
              ) : (
                <div className="text-[11px] text-muted">
                  <span>Changes take effect immediately on current dashboard session.</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>

        </main>
      </div>
    </div>
  )
}
