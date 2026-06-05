import { Filter, PackageCheck, Search, Truck } from 'lucide-react'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'

const orders = [
  ['#ORD-1034', 'Amina Khan', 'PKR 18,400', 'Paid'],
  ['#ORD-1035', 'Babar Ali', 'PKR 9,800', 'Processing'],
  ['#ORD-1036', 'Nida Rahman', 'PKR 24,100', 'Shipped'],
  ['#ORD-1037', 'Ali Raza', 'PKR 11,250', 'Pending'],
]

export default function OrdersPage() {
  return (
    <AdminPageShell
      title="Orders"
      description="View all orders and inspect status changes from the operations board."
      actions={
        <>
          <button className="btn btn-secondary"><Filter size={14} /> Filter</button>
          <button className="btn btn-secondary"><Truck size={14} /> Assign Shipment</button>
        </>
      }
    >
      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        {[
          ['All orders', '96'],
          ['Paid', '61'],
          ['In transit', '18'],
          ['Cancelled', '4'],
        ].map(([label, value]) => (
          <div key={label} className="stat-card">
            <span className="stat-card-label">{label}</span>
            <div className="stat-card-row">
              <span className="stat-card-value">{value}</span>
              <span className="stat-card-change" style={{ background: '#FEE2E2', color: 'var(--error-red)' }}>Live</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 'var(--sp-xl)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} />
          <input placeholder="Search order ID, farmer, or buyer" style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)' }} />
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(([orderId, buyer, total, status]) => (
              <tr key={orderId}>
                <td style={{ fontWeight: 600 }}>{orderId}</td>
                <td>{buyer}</td>
                <td>{total}</td>
                <td>
                  <span className="badge badge-soft-blue" style={{ fontSize: 10 }}>{status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>
                    <PackageCheck size={14} />
                    Open
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
