import { useEffect, useState } from 'react';
import { api } from '../services/inventoryApi';
import PageHeader from '../components/PageHeader';
import { useCelebration, CELEBRATION_TYPES } from '../hooks/useCelebration';

export default function OrdersPage() {
  const { celebrate } = useCelebration();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [o, c, p] = await Promise.all([api.orders.list(), api.customers.list(), api.products.list()]);
      setOrders(o);
      setCustomers(c);
      setProducts(p);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addLine = () => setItems([...items, { product_id: '', quantity: 1 }]);

  const updateLine = (idx, field, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: field === 'quantity' ? Number(value) : value };
    setItems(next);
  };

  const removeLine = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    const payload = {
      customer_id: customerId,
      items: items.filter((i) => i.product_id && i.quantity > 0),
    };
    if (!payload.customer_id || payload.items.length === 0) {
      setMessage({ type: 'error', text: 'Select customer and at least one product.' });
      return;
    }
    try {
      await api.orders.create(payload);
      celebrate(CELEBRATION_TYPES.ORDER_PLACED);
      setMessage({ type: 'success', text: 'Order created. Stock updated automatically.' });
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const viewOrder = async (id) => {
    try {
      setSelected(await api.orders.get(id));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel/delete this order? Stock will be restored.')) return;
    try {
      await api.orders.remove(id);
      setMessage({ type: 'success', text: 'Order deleted.' });
      setSelected(null);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="page-content">
      <PageHeader tag="Fulfillment" title="Order" highlight="pipeline" subtitle="Auto stock deduction, backend-calculated totals." />

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form className="panel panel-glow" onSubmit={handleCreate}>
        <h3 className="panel-title">Compose order</h3>
        <label className="field-label">
          Customer
          <select className="input-vault" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>
        </label>

        <div className="order-lines">
          <h4>Products</h4>
          {items.map((line, idx) => (
            <div key={idx} className="order-line">
              <select className="input-vault" value={line.product_id} onChange={(e) => updateLine(idx, 'product_id', e.target.value)} required>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — stock: {p.quantity_in_stock} — ${p.price}
                  </option>
                ))}
              </select>
              <input className="input-vault" type="number" min="1" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} />
              {items.length > 1 && (
                <button type="button" className="btn sm danger" onClick={() => removeLine(idx)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn ghost" onClick={addLine}>
            + Add product line
          </button>
        </div>

        <button type="submit" className="btn primary">
          Place order
        </button>
      </form>

      <section className="panel panel-glow">
        <h3 className="panel-title">Order history</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="cell-strong">{o.customer_name}</td>
                  <td><span className="sku-badge">{o.items.length} lines</span></td>
                  <td className="price-cell">${o.total_amount.toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td className="actions">
                    <button type="button" className="btn sm" onClick={() => viewOrder(o.id)}>
                      Details
                    </button>
                    <button type="button" className="btn sm danger" onClick={() => handleDelete(o.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="panel panel-glow detail-panel">
          <h3>Order details</h3>
          <p>
            <strong>Customer:</strong> {selected.customer_name}
          </p>
          <p>
            <strong>Total:</strong> ${selected.total_amount.toFixed(2)}
          </p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${item.line_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn ghost" onClick={() => setSelected(null)}>
            Close
          </button>
        </section>
      )}
    </div>
  );
}
