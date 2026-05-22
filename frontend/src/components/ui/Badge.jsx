import { PRIORITIES } from '../../utils/constants';
import { cn } from '../../utils/helpers';

export function PriorityBadge({ priority }) {
  const styles = {
    low: 'border-white/15 bg-white/5 text-[var(--color-muted)]',
    medium: 'border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
    high: 'border-[var(--color-ember)]/35 bg-[var(--color-ember)]/12 text-[#ff8a7a]',
    urgent: 'border-red-400/40 bg-red-500/15 text-red-300 animate-pulse',
  };
  const config = PRIORITIES.find((p) => p.id === priority) || PRIORITIES[1];
  return (
    <span className={cn('inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', styles[priority] || styles.medium)}>
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    todo: 'border-white/15 bg-white/5 text-[var(--color-muted)]',
    'in-progress': 'border-blue-400/30 bg-blue-500/10 text-blue-300',
    review: 'border-[var(--color-gold)]/35 bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
    completed: 'border-[var(--color-mint)]/35 bg-[var(--color-mint)]/10 text-[var(--color-mint)]',
    planning: 'border-purple-400/30 bg-purple-500/10 text-purple-300',
    active: 'border-[var(--color-mint)]/35 bg-[var(--color-mint)]/10 text-[var(--color-mint)]',
    'on-hold': 'border-[var(--color-ember)]/30 bg-[var(--color-ember)]/10 text-[#ff8a7a]',
    archived: 'border-white/10 bg-white/5 text-white/40',
  };

  return (
    <span className={cn('inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', colors[status] || colors.todo)}>
      {status?.replace('-', ' ')}
    </span>
  );
}
