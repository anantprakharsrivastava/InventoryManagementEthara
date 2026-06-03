import { motion } from 'framer-motion';

const accents = {
  teal: { glow: 'rgba(45, 212, 191, 0.35)', border: 'rgba(45, 212, 191, 0.35)', iconBg: 'rgba(45, 212, 191, 0.12)' },
  coral: { glow: 'rgba(255, 107, 74, 0.35)', border: 'rgba(255, 107, 74, 0.35)', iconBg: 'rgba(255, 107, 74, 0.12)' },
  gold: { glow: 'rgba(255, 200, 87, 0.35)', border: 'rgba(255, 200, 87, 0.35)', iconBg: 'rgba(255, 200, 87, 0.12)' },
  violet: { glow: 'rgba(167, 139, 250, 0.35)', border: 'rgba(167, 139, 250, 0.35)', iconBg: 'rgba(167, 139, 250, 0.12)' },
};

export default function StatCard({ label, value, icon: Icon, accent = 'teal', index = 0 }) {
  const a = accents[accent] || accents.teal;
  return (
    <motion.div
      className="stat-card"
      style={{ '--stat-glow': a.glow, '--stat-border': a.border, '--stat-icon-bg': a.iconBg }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon-wrap">
          <Icon size={18} />
        </span>
      </div>
      <strong className="stat-value">{value}</strong>
    </motion.div>
  );
}
