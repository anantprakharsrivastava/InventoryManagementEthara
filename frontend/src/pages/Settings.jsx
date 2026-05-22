import { useState } from 'react';
import { Sun, Moon, Bell, Mail, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, theme, setTheme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    tasks: true,
    projects: true,
  });

  const handleThemeSave = async () => {
    try {
      await authAPI.updateProfile({ theme });
      toast.success('Theme preference saved');
    } catch {
      toast.error('Failed to save theme');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="glass rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-violet-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
            Appearance
          </h3>
          <div className="flex items-center justify-between rounded-xl glass p-4">
            <div>
              <p className="text-sm text-white">Theme</p>
              <p className="text-xs text-slate-500">Switch between dark and light mode</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`rounded-xl px-4 py-2 text-sm transition-all ${theme === 'dark' ? 'bg-violet-500/30 text-violet-300' : 'text-slate-400 hover:bg-white/5'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`rounded-xl px-4 py-2 text-sm transition-all ${theme === 'light' ? 'bg-violet-500/30 text-violet-300' : 'text-slate-400 hover:bg-white/5'}`}
              >
                Light
              </button>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="mt-3" onClick={handleThemeSave}>Save Theme</Button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-400" />
            Notifications
          </h3>
          {Object.entries({ email: 'Email notifications', tasks: 'Task updates', projects: 'Project invites' }).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-xl glass p-4 mb-2 cursor-pointer">
              <span className="text-sm text-slate-300">{label}</span>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                className="h-4 w-4 rounded accent-violet-500"
              />
            </label>
          ))}
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Mail className="h-3 w-3" /> Email delivery ready — connect SendGrid/Resend in production
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Account
          </h3>
          <div className="rounded-xl glass p-4 text-sm text-slate-400">
            <p>Role: <span className="text-white capitalize">{user?.role}</span></p>
            <p className="mt-1">Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <Button variant="danger" icon={LogOut} onClick={handleLogout} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
