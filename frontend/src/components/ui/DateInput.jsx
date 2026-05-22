import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function DateInput({ label, className, value, onChange, min, max, required, id }) {
  const inputRef = useRef(null);
  const inputId = id || `date-${label?.replace(/\s/g, '-').toLowerCase()}`;

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
      } catch {
        el.click();
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]"
        >
          {label}
        </label>
      )}
      <div
        className="date-input-wrap relative cursor-pointer"
        onClick={openPicker}
        onKeyDown={(e) => e.key === 'Enter' && openPicker()}
        role="presentation"
      >
        <Calendar
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-ember)] drop-shadow-[0_0_8px_rgba(255,94,58,0.6)]"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          required={required}
          className={cn('date-input-eth', className)}
          placeholder="Select date"
        />
      </div>
    </div>
  );
}
