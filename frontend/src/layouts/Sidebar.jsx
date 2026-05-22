import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Settings,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Logo from '../components/brand/Logo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', num: '01' },
  { to: '/projects', icon: FolderKanban, label: 'Projects', num: '02' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', num: '03' },
  { to: '/chat', icon: MessageSquare, label: 'Chat', num: '04' },
  { to: '/profile', icon: User, label: 'Identity', num: '05' },
  { to: '/settings', icon: Settings, label: 'System', num: '06' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <motion.aside
        initial={false}
        className={`fixed left-0 top-0 z-50 flex h-full w-[272px] flex-col border-r border-white/[0.06] transition-transform duration-500 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(12,12,18,0.98) 0%, rgba(5,5,8,0.99) 100%)',
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-ember)] via-transparent to-[var(--color-mint)] opacity-50" />

        <div className="flex items-center justify-between p-6 pb-4">
          <Logo size="md" />
          <button onClick={onClose} className="lg:hidden rounded-lg p-2 text-[var(--color-muted)] hover:text-white hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-5 mb-6 rounded-2xl border border-[var(--color-ember)]/20 bg-[var(--color-ember)]/5 px-4 py-3">
          <div className="flex items-center gap-2 text-[var(--color-ember)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Live workspace</span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">
            Your command deck — not another generic board.
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-muted)]">
            Navigate
          </p>
          {navItems.map(({ to, icon: Icon, label, num }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'nav-active-glow pl-4'
                    : 'text-[var(--color-muted)] hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`font-mono text-[10px] ${isActive ? 'text-[var(--color-ember)]' : 'text-white/20'}`}
                  >
                    {num}
                  </span>
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[var(--color-mint)]' : 'text-[var(--color-muted)] group-hover:text-white'}`}
                  />
                  <span className="font-display tracking-tight">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4 m-4 mt-0 rounded-2xl eth-card">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white font-display">{user?.name}</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-[var(--color-mint)]">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
