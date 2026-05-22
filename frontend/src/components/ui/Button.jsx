import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const variants = {
  primary: 'gradient-btn',
  secondary: 'btn-ghost-eth',
  danger: 'bg-[#ff5e3a]/15 text-[#ff8a7a] border border-[#ff5e3a]/30 hover:bg-[#ff5e3a]/25',
  ghost: 'text-[var(--color-muted)] hover:text-white hover:bg-white/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-2xl',
  lg: 'px-8 py-3.5 text-base rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  icon: Icon,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/80" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
