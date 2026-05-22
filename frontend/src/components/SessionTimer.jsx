import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'sessionTimer';

const formatTime = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const loadState = (userId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.userId && data.userId !== userId) return null;
    return data;
  } catch {
    return null;
  }
};

const saveState = (userId, state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, ...state }));
  } catch {
    /* ignore */
  }
};

export default function SessionTimer() {
  const { user } = useAuth();
  const userId = user?._id;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const tickRef = useRef(null);
  const startedAtRef = useRef(null);
  const baseRef = useRef(0);
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;
    const saved = loadState(userId);

    let base = 0;
    let isRunning = true;
    let startedAt = Date.now();

    if (saved) {
      base = saved.base || 0;
      isRunning = saved.running ?? true;
      if (isRunning) {
        startedAt = saved.startedAt || Date.now();
      }
    }

    baseRef.current = base;
    startedAtRef.current = startedAt;
    setRunning(isRunning);
    setElapsed(isRunning ? base + (Date.now() - startedAt) : base);

    saveState(userId, {
      base,
      running: isRunning,
      startedAt: isRunning ? startedAt : null,
    });

    initialisedRef.current = true;
  }, [userId]);

  useEffect(() => {
    if (!running) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setElapsed(baseRef.current + (Date.now() - (startedAtRef.current || Date.now())));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  const handleToggle = () => {
    if (!userId || !initialisedRef.current) return;

    if (running) {
      const now = Date.now();
      const accumulated = baseRef.current + (now - (startedAtRef.current || now));
      baseRef.current = accumulated;
      startedAtRef.current = null;
      setElapsed(accumulated);
      setRunning(false);
      saveState(userId, { base: accumulated, running: false, startedAt: null });
    } else {
      const now = Date.now();
      startedAtRef.current = now;
      setRunning(true);
      saveState(userId, { base: baseRef.current, running: true, startedAt: now });
    }
  };

  if (!userId) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-2xl border px-3 py-2"
      style={{
        background: running
          ? 'linear-gradient(135deg, rgba(61, 255, 168, 0.08), rgba(255, 94, 58, 0.05))'
          : 'rgba(255, 255, 255, 0.03)',
        borderColor: running ? 'rgba(61, 255, 168, 0.3)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: running ? '0 0 16px rgba(61, 255, 168, 0.15)' : 'none',
      }}
      title="Session timer"
    >
      <Timer
        className="h-4 w-4 shrink-0"
        style={{ color: running ? '#3dffa8' : 'var(--color-muted)' }}
      />
      <motion.span
        key={running ? 'r' : 'p'}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        className="font-mono text-sm font-semibold tabular-nums text-white"
      >
        {formatTime(elapsed)}
      </motion.span>
      <button
        type="button"
        onClick={handleToggle}
        className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white transition-all hover:border-[var(--color-ember)]/45 hover:bg-[var(--color-ember)]/10"
        aria-label={running ? 'Pause timer' : 'Start timer'}
        title={running ? 'Pause' : 'Start'}
      >
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
