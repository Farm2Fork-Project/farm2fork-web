import { Filter, Flag, PackageSearch, Search } from 'lucide-react'
import AdminPageShell from '@/components/admin/screens/AdminPageShell'

const products = [
  ['Fresh Tomatoes', 'Vegetables', 'A', 'Active'],
  ['Basmati Rice', 'Grains', 'B', 'Under review'],
  ['Mango Box', 'Fruits', 'A', 'Sold out'],
  ['Milk Crates', 'Dairy', 'B', 'Active'],
]

export default function ProductsPage() {
  return (
    <AdminPageShell
      title="Products"
      description="View and moderate product listings before they reach the marketplace."
      actions={
        <>
          <button className="btn btn-secondary"><Filter size={14} /> Filter</button>
          <button className="btn btn-secondary"><Flag size={14} /> Flag Selected</button>
        </>
      }
    >
      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        {[
          ['Listed', '412'],
          ['Pending review', '28'],
          ['Flagged', '9'],
          ['Sold out', '47'],
        ].map(([label, value]) => (
          <div key={label} className="stat-card">
            <span className="stat-card-label">{label}</span>
            <div className="stat-card-row">
              <span className="stat-card-value">{value}</span>
              <span className="stat-card-change" style={{ background: 'var(--secondary-blue-soft)', color: 'var(--secondary-blue)' }}>Static</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 'var(--sp-xl)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-muted)' }} />
          <input placeholder="Search products, farmer, or category" style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: 14, border: '1px solid var(--surface-strong)', background: 'var(--surface-light)' }} />
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Grade</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(([name, category, grade, status]) => (
              <tr key={name}>
                <td style={{ fontWeight: 600 }}>{name}</td>
                <td>{category}</td>
                <td>
                  <span className="badge badge-soft-green" style={{ fontSize: 10 }}>{grade}</span>
                </td>
                <td>{status}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>
                    <PackageSearch size={14} />
                    Review
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
