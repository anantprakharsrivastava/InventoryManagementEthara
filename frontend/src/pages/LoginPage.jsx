import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email.');
      return;
    }
    login(form.name, form.email);
  };

  return (
    <div className="login-page">
      <div className="app-mesh" aria-hidden />
      <div className="app-grid" aria-hidden />

      <motion.div
        className="login-hero"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="pill-tag">Ethara Vault</span>
        <h1>
          Inventory <span className="gradient-text">command</span>
          <br />
          without the clutter.
        </h1>
        <p>Products, customers, and orders — one distinctive operations deck.</p>
        <ul className="login-features">
          <li>
            <Shield size={16} /> Stock validation on every order
          </li>
          <li>
            <Sparkles size={16} /> Live low-stock radar
          </li>
        </ul>
      </motion.div>

      <motion.form
        className="login-card panel panel-glow"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div className="brand brand-compact">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <h1>Sign in</h1>
            <p>Enter the vault</p>
          </div>
        </div>
        {error && <div className="alert error">{error}</div>}
        <label className="field-label">Full name</label>
        <input
          className="input-vault"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <label className="field-label">Email</label>
        <input
          className="input-vault"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <button type="submit" className="btn primary login-btn">
          <LogIn size={18} />
          Enter command deck
        </button>
      </motion.form>
    </div>
  );
}
