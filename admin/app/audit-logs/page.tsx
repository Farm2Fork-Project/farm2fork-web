import { Filter, Search } from 'lucide-react'
import AdminPageShell from '../../components/screens/AdminPageShell'

const logs = [
  ['admin@farm2fork.com', 'Updated system fee', 'Config', '2 mins ago'],
  ['junaid@farm2fork.com', 'Approved loan application', 'Loans', '18 mins ago'],
  ['qaim@farm2fork.com', 'Flagged product listing', 'Products', '1h ago'],
  ['system', 'Synced dashboard metrics', 'Dashboard', 'Today'],
]

export default function AuditLogsPage() {
  return (
    <AdminPageShell
      title="Audit Logs"
      description="Filter and inspect platform activity logs from the admin panel."
      actions={<button className="btn btn-secondary"><Filter size={14} /> Filters</button>}
    >
      <div className="card" style={{ marginBottom: 'var(--sp-xl)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} />
          <input placeholder="Search actors, modules, or actions" style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)' }} />
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Module</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(([actor, action, module, time]) => (
              <tr key={`${actor}-${action}`}>
                <td style={{ fontWeight: 600 }}>{actor}</td>
                <td>{action}</td>
                <td>
                  <span className="badge badge-soft-blue" style={{ fontSize: 10 }}>{module}</span>
                </td>
                <td>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  )
}
