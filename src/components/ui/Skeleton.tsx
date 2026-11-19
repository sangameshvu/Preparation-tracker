import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-thin animate-pulse border border-white/40 dark:border-white/10 bg-black/5 dark:bg-white/5 relative overflow-hidden',
        variant === 'rounded' && 'rounded-2xl',
        variant === 'rectangular' && 'rounded-none',
        variant === 'circular' && 'rounded-full',
        className
      )}
      {...props}
    />
  );
};
