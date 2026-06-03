import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { api } from '../services/inventoryApi';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-ring" />
        <p>Syncing inventory pulse…</p>
      </div>
    );
  }
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="page-content">
      <PageHeader
        tag="Live overview"
        title="Stock"
        highlight="command"
        subtitle="Real-time counts, low-stock radar, and order momentum."
      />

      <div className="stat-grid">
        <StatCard label="Total products" value={data.total_products} icon={Package} accent="coral" index={0} />
        <StatCard label="Total customers" value={data.total_customers} icon={Users} accent="teal" index={1} />
        <StatCard label="Total orders" value={data.total_orders} icon={ShoppingCart} accent="gold" index={2} />
        <StatCard
          label="Low stock ≤10"
          value={data.low_stock_products.length}
          icon={AlertTriangle}
          accent="violet"
          index={3}
        />
      </div>

      <section className="panel panel-glow">
        <div className="panel-head">
          <h3>Low stock radar</h3>
          <Link to="/products" className="link-btn">
            Manage products <ArrowUpRight size={14} />
          </Link>
        </div>
        {data.low_stock_products.length === 0 ? (
          <p className="muted empty-hint">All SKUs are above the safety threshold.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-strong">{p.name}</td>
                    <td>
                      <span className="sku-badge">{p.sku}</span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-pill ${p.quantity_in_stock === 0 ? 'critical' : 'low'}`}>
                        {p.quantity_in_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
