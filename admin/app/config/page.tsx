import { Save, Settings2, SlidersHorizontal } from 'lucide-react'
import AdminPageShell from '../../components/screens/AdminPageShell'

export default function ConfigPage() {
  return (
    <AdminPageShell
      title="System Config"
      description="Manage global system settings and configuration parameters."
      actions={<button className="btn btn-secondary"><Save size={14} /> Save Changes</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-xl)' }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={16} /> Platform Fee
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>platform_fee_percent</span>
              <input defaultValue="6.5" style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)' }} />
            </label>
            <label>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Description</span>
              <textarea defaultValue="Percentage fee applied to every order." rows={4} style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)', resize: 'vertical' }} />
            </label>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings2 size={16} /> Other Keys
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['payment_gateway', 'jazzcash'],
              ['loan_auto_review_limit', '250000'],
              ['admin_notice_banner', 'Enabled'],
            ].map(([key, value]) => (
              <div key={key} style={{ padding: 14, borderRadius: 16, background: 'var(--surface-light)', border: '1px solid var(--surface-medium)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{key}</div>
                <div style={{ fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
