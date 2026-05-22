import { cn } from '../../utils/helpers';

export default function Input({ label, error, className, icon: Icon, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        )}
        <input
          className={cn('input-eth w-full px-4 py-3 text-sm', Icon && 'pl-11', error && 'border-[#ff5e3a]/50', className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#ff8a7a]">{error}</p>}
    </div>
  );
}
