import { useEffect, useState } from 'react';
import { api } from '../services/inventoryApi';
import PageHeader from '../components/PageHeader';
import { useCelebration, CELEBRATION_TYPES } from '../hooks/useCelebration';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function CustomersPage() {
  const { celebrate } = useCelebration();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.customers
      .list()
      .then(setCustomers)
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await api.customers.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      celebrate(CELEBRATION_TYPES.CUSTOMER_CREATED);
      setForm(emptyForm);
      setMessage({ type: 'success', text: 'Customer created.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.customers.remove(id);
      setMessage({ type: 'success', text: 'Customer deleted.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="page-content">
      <PageHeader tag="CRM" title="Customer" highlight="registry" subtitle="Unique emails, contact records, order history links." />

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form className="panel panel-glow form-grid" onSubmit={handleSubmit}>
        <h3 className="panel-title">Onboard customer</h3>
        <input className="input-vault" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input className="input-vault" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input-vault" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <button type="submit" className="btn primary">
          Add customer
        </button>
      </form>

      <section className="panel panel-glow">
        <h3 className="panel-title">All customers</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="cell-strong">{c.full_name}</td>
                  <td><span className="email-chip">{c.email}</span></td>
                  <td>{c.phone}</td>
                  <td>
                    <button type="button" className="btn sm danger" onClick={() => handleDelete(c.id)}>
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
