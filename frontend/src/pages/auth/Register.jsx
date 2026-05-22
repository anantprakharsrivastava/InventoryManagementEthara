import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/brand/Logo';
import toast from 'react-hot-toast';
import { useCelebration, CELEBRATION_TYPES } from '../../hooks/useCelebration';

const ROLES = [
  { value: 'tasker', label: 'Tasker' },
  { value: 'project_lead', label: 'Project Lead (PL)' },
  { value: 'quality_reviewer', label: 'Quality Reviewer (QR)' },
  { value: 'admin', label: 'Admin' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'tasker' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { celebrate } = useCelebration();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const backendRole = form.role === 'admin' ? 'admin' : 'member';
      await register({ name: form.name, email: form.email, password: form.password, role: backendRole });
      localStorage.setItem('selectedRole', form.role);
      celebrate(CELEBRATION_TYPES.SIGNUP_SUCCESS);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="app-mesh" />
      <div className="relative z-10 flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md eth-card-glow p-8 lg:p-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-[var(--color-muted)] hover:text-white mb-8">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
          <Logo className="mb-8" />
          <h1 className="font-display text-3xl font-bold text-white mb-2">Join Ethara</h1>
          <p className="text-sm text-[var(--color-muted)] mb-8">Build your crew&apos;s command center.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" icon={User} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" icon={Mail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" icon={Lock} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Input label="Confirm" type="password" icon={Lock} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />

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

            <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
            Have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--color-mint)] hover:text-white">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
