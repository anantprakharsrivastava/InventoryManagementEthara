import { getInitials } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

export default function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  const ring = 'ring-2 ring-[var(--color-ember)]/40 ring-offset-2 ring-offset-[var(--color-void)]';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-2xl object-cover', ring, sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl font-display font-bold text-[#050508]',
        ring,
        sizes[size],
        className
      )}
      style={{
        background: 'linear-gradient(135deg, var(--color-ember), var(--color-gold))',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
