// @memorylane/web - Component: Progress bar
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: 'default' | 'accent' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showPercent = false,
  variant = 'accent',
  size = 'md',
  className,
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    default: 'bg-primary-800',
    accent: 'bg-accent',
    gold: 'bg-gold',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercent && <span className="text-sm text-gray-500">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out',
            variants[variant],
            sizes[size]
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
