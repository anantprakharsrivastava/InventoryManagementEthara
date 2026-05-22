import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/brand/Logo';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'tasker' });

  const ROLES = [
    { value: 'tasker', label: 'Tasker' },
    { value: 'project_lead', label: 'Project Lead (PL)' },
    { value: 'quality_reviewer', label: 'Quality Reviewer (QR)' },
    { value: 'admin', label: 'Admin' },
  ];
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedIn = await login({ email: form.email, password: form.password });

      const selected = form.role;
      const actual = loggedIn?.role;
      const adminSelected = selected === 'admin';
      const adminActual = actual === 'admin';

      if (adminSelected !== adminActual) {
        toast.error(
          adminSelected
            ? 'You are not registered as Admin. Pick the correct role.'
            : 'Your account is Admin. Please select Admin role.'
        );
      }

      localStorage.setItem('selectedRole', selected);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="app-mesh" />
      <div className="app-grid fixed inset-0 opacity-25 pointer-events-none" />

      <div className="relative z-10 hidden lg:flex flex-1 flex-col justify-between p-14 border-r border-white/[0.06]">
        <Logo size="lg" showTagline />
        <div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight max-w-md">
            Enter the <span className="gradient-text-warm">command deck</span>
          </h2>
          <p className="mt-4 text-[var(--color-muted)] max-w-sm">
            Projects, tasks, and crew — one distinctive workspace.
          </p>
        </div>
        <p className="text-xs text-[var(--color-muted)]">Demo: admin@ethara.com / admin123</p>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md eth-card-glow p-8 lg:p-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-[var(--color-muted)] hover:text-white mb-8 lg:hidden">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-sm text-[var(--color-muted)] mb-8">Authenticate to resume control.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" icon={Mail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" icon={Lock} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Role
              </label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="input-eth w-full pl-11 pr-4 py-3 text-sm appearance-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-slate-900">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
            New here?{' '}
            <Link to="/register" className="font-semibold text-[var(--color-ember)] hover:text-[var(--color-gold)]">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
