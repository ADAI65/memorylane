// @memorylane/web - Component: Card
import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'elevated' | 'outline' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  className,
  children,
  variant = 'elevated',
  padding = 'md',
  ...props
}: CardProps) {
  const variants = {
    elevated: 'bg-white rounded-2xl shadow-lg border border-gray-100',
    outline: 'bg-white rounded-2xl border border-gray-200',
    glass: 'bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10',
    interactive:
      'bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-accent/20 transition-all duration-300 cursor-pointer',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={cn(variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-primary-800', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
