import { useEffect, useState } from 'react';
import { api } from '../services/inventoryApi';
import PageHeader from '../components/PageHeader';
import { useCelebration, CELEBRATION_TYPES } from '../hooks/useCelebration';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function ProductsPage() {
  const { celebrate } = useCelebration();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.products
      .list()
      .then(setProducts)
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };
    if (!payload.name || !payload.sku || payload.price <= 0 || payload.quantity_in_stock < 0) {
      setMessage({ type: 'error', text: 'Please fill all fields with valid values.' });
      return;
    }
    try {
      if (editId) {
        await api.products.update(editId, payload);
        setMessage({ type: 'success', text: 'Product updated.' });
      } else {
        await api.products.create(payload);
        celebrate(CELEBRATION_TYPES.PRODUCT_CREATED);
        setMessage({ type: 'success', text: 'Product created.' });
      }
      resetForm();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      price: String(p.price),
      quantity_in_stock: String(p.quantity_in_stock),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.products.remove(id);
      setMessage({ type: 'success', text: 'Product deleted.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="page-content">
      <PageHeader tag="Catalog" title="Product" highlight="vault" subtitle="SKUs, pricing, and live stock levels." />

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form className="panel panel-glow form-grid" onSubmit={handleSubmit}>
        <h3 className="panel-title">{editId ? 'Edit SKU' : 'Register new product'}</h3>
        <input className="input-vault" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-vault" placeholder="SKU / code" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
        <input className="input-vault" type="number" step="0.01" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="input-vault" type="number" min="0" placeholder="Quantity in stock" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} required />
        <div className="form-actions">
          <button type="submit" className="btn primary">{editId ? 'Update' : 'Add'} product</button>
          {editId && (
            <button type="button" className="btn ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="panel panel-glow">
        <h3 className="panel-title">Inventory table</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="cell-strong">{p.name}</td>
                  <td><span className="sku-badge">{p.sku}</span></td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-pill ${p.quantity_in_stock <= 10 ? (p.quantity_in_stock === 0 ? 'critical' : 'low') : 'ok'}`}>
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td className="actions">
                    <button type="button" className="btn sm" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className="btn sm danger" onClick={() => handleDelete(p.id)}>
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
    </div>
  );
}
