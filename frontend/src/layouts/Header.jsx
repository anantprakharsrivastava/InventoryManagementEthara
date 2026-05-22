import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';
import SessionTimer from '../components/SessionTimer';

export default function Header({ onMenuClick, search, onSearchChange }) {
  const navigate = useNavigate();
  const { theme, toggleTheme, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-[72px] items-center gap-4 px-4 lg:px-8"
      style={{
        background: 'rgba(5, 5, 8, 0.72)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="rounded-2xl p-2.5 text-[var(--color-muted)] transition-all hover:bg-white/5 hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {onSearchChange && (
        <div className="relative hidden flex-1 max-w-lg md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search your universe..."
            value={search || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-eth w-full py-2.5 pl-11 pr-4 text-sm"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <SessionTimer />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-2xl border border-white/[0.06] px-3 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-all hover:border-[var(--color-ember)]/35 hover:bg-[var(--color-ember)]/10 hover:text-[var(--color-ember)]"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-2xl border border-white/[0.06] p-2.5 text-[var(--color-muted)] transition-all hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)]"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationDropdown />
      </div>
    </header>
  );
}
