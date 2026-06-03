import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true, num: '01' },
  { to: '/products', label: 'Products', icon: Package, num: '02' },
  { to: '/customers', label: 'Customers', icon: Users, num: '03' },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, num: '04' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="app-mesh" aria-hidden />
      <div className="app-grid" aria-hidden />

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <h1>Ethara Vault</h1>
            <p>Inventory command deck</p>
          </div>
        </div>

        <p className="nav-section-label">Navigate</p>
        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end, num }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <span className="nav-num">{num}</span>
              <Icon size={18} strokeWidth={2} />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            <div className="user-meta">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
