import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring' }}
      className="eth-card-glow group relative overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1"
    >
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: color }}
      />
      <div
        className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110 group-hover:rotate-3"
        style={{
          background: `${color}18`,
          borderColor: `${color}40`,
          boxShadow: `0 0 24px ${color}25`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="font-display text-4xl font-extrabold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)]">{label}</p>
    </motion.div>
  );
}
