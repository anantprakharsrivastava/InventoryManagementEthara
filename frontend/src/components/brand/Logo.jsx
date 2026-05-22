import { cn } from '../../utils/helpers';

export default function Logo({ size = 'md', showTagline = false, className }) {
  const sizes = {
    sm: { box: 'h-8 w-8', text: 'text-base', tag: 'text-[10px]' },
    md: { box: 'h-10 w-10', text: 'text-xl', tag: 'text-xs' },
    lg: { box: 'h-14 w-14', text: 'text-3xl', tag: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-2xl',
          s.box
        )}
        style={{
          background: 'linear-gradient(135deg, #ff5e3a 0%, #1a1a22 45%, #3dffa8 100%)',
          boxShadow: '0 0 24px rgba(255, 94, 58, 0.35)',
        }}
      >
        <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none">
          <path
            d="M6 18 L12 5 L18 18"
            stroke="#050508"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="15" r="1.5" fill="#050508" />
        </svg>
      </div>
      <div>
        <span className={cn('font-display font-extrabold tracking-tight text-white', s.text)}>
          Eth<span className="gradient-text-warm">ara</span>
        </span>
        {showTagline && (
          <p className={cn('text-[var(--color-muted)] tracking-widest uppercase', s.tag)}>
            Command Center
          </p>
        )}
      </div>
    </div>
  );
}
