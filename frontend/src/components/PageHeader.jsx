import { motion } from 'framer-motion';

export default function PageHeader({ tag, title, highlight, subtitle }) {
  return (
    <motion.header
      className="page-header"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {tag && <span className="pill-tag">{tag}</span>}
      <h2>
        {title}
        {highlight && <span className="gradient-text"> {highlight}</span>}
      </h2>
      {subtitle && <p>{subtitle}</p>}
    </motion.header>
  );
}
