import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { formatDate } from '../utils/helpers';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const socket = getSocket();
    socket?.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 10));
      setUnreadCount((c) => c + 1);
    });
    return () => socket?.off('notification');
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setUnreadCount(0);
    setNotifications((n) => n.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 eth-card-glow rounded-2xl p-2 shadow-xl z-50"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-500">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`rounded-xl px-3 py-2.5 mb-1 ${!n.read ? 'bg-violet-500/10' : 'hover:bg-white/5'}`}
                  >
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{formatDate(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
