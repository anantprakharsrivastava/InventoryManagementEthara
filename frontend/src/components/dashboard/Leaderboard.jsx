import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { getInitials } from '../../utils/helpers';

const LEADERS = [
  { name: 'Anant Prakhar', role: 'Project Lead', tasks: 48, avgMinPerTask: 38 },
  { name: 'Ishaan Mehta', role: 'Tasker', tasks: 42, avgMinPerTask: 41 },
  { name: 'Priya Iyer', role: 'Quality Reviewer', tasks: 38, avgMinPerTask: 45 },
  { name: 'Aanya Sharma', role: 'Tasker', tasks: 35, avgMinPerTask: 49 },
  { name: 'Rohan Kapoor', role: 'Project Lead', tasks: 31, avgMinPerTask: 52 },
  { name: 'Kabir Khanna', role: 'Tasker', tasks: 28, avgMinPerTask: 55 },
  { name: 'Riya Singh', role: 'Quality Reviewer', tasks: 24, avgMinPerTask: 58 },
];

const score = (l) => Math.round(l.tasks * 100 - l.avgMinPerTask * 8);

const formatTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const RANK_STYLES = {
  1: {
    icon: Trophy,
    color: '#f4d35e',
    bg: 'linear-gradient(135deg, rgba(244,211,94,0.18), rgba(255,94,58,0.08))',
    border: 'rgba(244,211,94,0.45)',
    glow: '0 0 32px rgba(244,211,94,0.25)',
    label: 'GOLD',
  },
  2: {
    icon: Medal,
    color: '#cbd5e1',
    bg: 'linear-gradient(135deg, rgba(203,213,225,0.14), rgba(255,255,255,0.04))',
    border: 'rgba(203,213,225,0.35)',
    glow: '0 0 24px rgba(203,213,225,0.18)',
    label: 'SILVER',
  },
  3: {
    icon: Award,
    color: '#ff8a65',
    bg: 'linear-gradient(135deg, rgba(255,138,101,0.16), rgba(255,94,58,0.06))',
    border: 'rgba(255,138,101,0.4)',
    glow: '0 0 24px rgba(255,138,101,0.2)',
    label: 'BRONZE',
  },
};

export default function Leaderboard() {
  const sorted = [...LEADERS]
    .map((l) => ({ ...l, score: score(l), totalMin: l.tasks * l.avgMinPerTask }))
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="eth-card-glow p-6 lg:p-7"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #f4d35e, #ff5e3a)',
              boxShadow: '0 0 24px rgba(244,211,94,0.35)',
            }}
          >
            <Trophy className="h-5 w-5 text-[#050508]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Leaderboard</h2>
            <p className="text-xs text-[var(--color-muted)]">
              Ranked by tasks completed & time efficiency
            </p>
          </div>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#3dffa8]/30 bg-[#3dffa8]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3dffa8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3dffa8] animate-pulse" />
          Live
        </span>
      </div>

      {/* Top performer highlight */}
      {top && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 rounded-2xl border p-4 sm:p-5"
          style={{
            background: RANK_STYLES[1].bg,
            borderColor: RANK_STYLES[1].border,
            boxShadow: RANK_STYLES[1].glow,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-bold text-[#050508]"
              style={{ background: 'linear-gradient(135deg, #f4d35e, #ff8a65)' }}
            >
              {getInitials(top.name)}
              <Trophy className="absolute -top-2 -right-2 h-5 w-5 text-[#f4d35e] drop-shadow-[0_0_8px_rgba(244,211,94,0.8)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f4d35e]">
                  #1 · Top Performer
                </span>
              </div>
              <p className="font-display text-lg font-bold text-white truncate">{top.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{top.role}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
              <span className="font-mono text-2xl font-extrabold text-[#f4d35e]">
                {top.score}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">points</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-muted)] border-t border-white/[0.06] pt-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#3dffa8]" />
              <strong className="text-white">{top.tasks}</strong> tasks
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#a78bfa]" />
              {formatTime(top.totalMin)}
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#f4d35e]" />
              {top.avgMinPerTask}m / task
            </span>
          </div>
        </motion.div>
      )}

      {/* Rest of the list */}
      <ul className="space-y-2">
        {sorted.slice(1).map((leader, idx) => {
          const rank = idx + 2;
          const style = RANK_STYLES[rank];
          const RankIcon = style?.icon;

          return (
            <motion.li
              key={leader.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx + 0.15 }}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-[var(--color-ember)]/25 hover:bg-white/[0.04]"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold"
                style={{
                  background: style ? style.bg : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${style ? style.border : 'rgba(255,255,255,0.08)'}`,
                  color: style ? style.color : 'var(--color-muted)',
                  boxShadow: style?.glow,
                }}
              >
                {RankIcon ? <RankIcon className="h-4 w-4" /> : `#${rank}`}
              </div>

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-[#050508]"
                style={{
                  background: 'linear-gradient(135deg, #ff8a65, #f4d35e)',
                }}
              >
                {getInitials(leader.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{leader.name}</p>
                <p className="truncate text-[11px] text-[var(--color-muted)]">{leader.role}</p>
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs text-[var(--color-muted)]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[#3dffa8]" />
                  <span className="text-white font-semibold">{leader.tasks}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(leader.totalMin)}
                </span>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-bold text-white">{leader.score}</p>
                <p className="text-[9px] uppercase tracking-wider text-[var(--color-muted)]">pts</p>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
        Score = tasks × 100 − avg minutes × 8
      </p>
    </motion.div>
  );
}
