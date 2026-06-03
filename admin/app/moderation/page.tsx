import AdminPageShell from '../../components/screens/AdminPageShell'
import { ShieldAlert, CheckCircle, XCircle, Search, Filter } from 'lucide-react'

const mockReviews = [
  {
    id: 'REV-001',
    user: 'Aisha Malik',
    email: 'aisha.m@example.com',
    type: 'Product Review',
    target: 'Organic Wheat (10kg)',
    content: 'The quality of the wheat was exceptionally good this season. Highly recommended!',
    status: 'pending',
    date: '2026-06-02'
  },
  {
    id: 'REP-089',
    user: 'Imran Khan',
    email: 'imran.k@example.com',
    type: 'User Report',
    target: 'Vendor: FreshFarms',
    content: 'Vendor did not respond to my messages for 3 days after payment was escrowed.',
    status: 'flagged',
    date: '2026-06-01'
  },
  {
    id: 'REV-002',
    user: 'Sarah Ahmed',
    email: 'sarah.a@example.com',
    type: 'Platform Feedback',
    target: 'Mobile App',
    content: 'The new crop price tracker is very helpful, but the charts load slowly on my device.',
    status: 'resolved',
    date: '2026-05-28'
  },
  {
    id: 'REP-090',
    user: 'Tariq Mahmood',
    email: 'tariq.m@example.com',
    type: 'User Report',
    target: 'Logistics Partner',
    content: 'Delivery was delayed by 48 hours without any prior notification from the driver.',
    status: 'pending',
    date: '2026-05-27'
  }
]

export default function ModerationPage() {
  return (
    <AdminPageShell
      title="Moderation Queue"
      description="Read and moderate user-submitted reviews, reports, and platform feedback."
      actions={
        <>
          <button className="btn btn-secondary"><Filter size={14} /> Filter</button>
        </>
      }
    >
      <div className="card" style={{ marginBottom: 'var(--sp-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-lg)' }}>
          <div className="topbar-search" style={{ flex: '0 1 400px' }}>
            <Search className="search-icon" size={16} />
            <input type="text" placeholder="Search by user or content..." />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Submitted By</th>
                <th>Type & Target</th>
                <th style={{ width: '40%' }}>Reason / Content</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockReviews.map((review) => (
                <tr key={review.id}>
                  <td style={{ fontWeight: 600, color: 'var(--secondary-blue)' }}>{review.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{review.user}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{review.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{review.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{review.target}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    "{review.content}"
                  </td>
                  <td>
                    {review.status === 'pending' && <span className="badge badge-soft-yellow">Pending</span>}
                    {review.status === 'flagged' && <span className="badge badge-soft-red">Action Required</span>}
                    {review.status === 'resolved' && <span className="badge badge-soft-green">Resolved</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-icon btn-secondary" title="Approve / Resolve" style={{ color: 'var(--success)' }}>
                        <CheckCircle size={16} />
                      </button>
                      <button className="btn btn-icon btn-secondary" title="Reject / Delete" style={{ color: 'var(--error-red)' }}>
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  )
}
