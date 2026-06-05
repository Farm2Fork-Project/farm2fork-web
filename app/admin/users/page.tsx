import { Eye, Search, ShieldAlert, UserRound } from 'lucide-react'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'

const users = [
  ['Amina Khan', 'Farmer', 'Verified', '2m ago'],
  ['Babar Ali', 'Buyer', 'Active', '15m ago'],
  ['Nida Rahman', 'Transporter', 'Active', '1h ago'],
  ['Ali Raza', 'Financial Partner', 'Pending review', 'Today'],
]

export default function UsersPage() {
  return (
    <AdminPageShell
      title="User Management"
      description="Search, filter, view, and deactivate user accounts."
      actions={
        <>
          <a className="btn btn-secondary" href="/logout">Logout</a>
          <button className="btn btn-secondary">
            <UserRound size={14} />
            Export CSV
          </button>
        </>
      }
    >
      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        {[
          ['Total Users', '1,248'],
          ['Farmers', '712'],
          ['Buyers', '410'],
          ['Inactive', '19'],
        ].map(([label, value]) => (
          <div key={label} className="stat-card">
            <span className="stat-card-label">{label}</span>
            <div className="stat-card-row">
              <span className="stat-card-value">{value}</span>
              <span className="stat-card-change" style={{ background: 'var(--primary-green-soft)', color: 'var(--primary-green)' }}>Live</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 'var(--sp-xl)' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} />
            <input placeholder="Search by name, CNIC, or email" style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)' }} />
          </div>
          <select style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)' }}>
            <option>All roles</option>
            <option>Farmer</option>
            <option>Buyer</option>
            <option>Transporter</option>
            <option>Financial Partner</option>
          </select>
          <button className="btn btn-secondary">
            <ShieldAlert size={14} />
            Show deactivated
          </button>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(([name, role, status, lastActive]) => (
              <tr key={name}>
                <td style={{ fontWeight: 600 }}>{name}</td>
                <td>{role}</td>
                <td>
                  <span className="badge badge-soft-green" style={{ fontSize: 10 }}>{status}</span>
                </td>
                <td>{lastActive}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  )
}
