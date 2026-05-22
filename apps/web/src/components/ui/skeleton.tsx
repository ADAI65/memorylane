// @memorylane/web - Component: Skeleton loader
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rect', width, height }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
  };

  const style = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex gap-2 pt-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  );
}
