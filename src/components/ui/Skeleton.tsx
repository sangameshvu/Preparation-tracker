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
        'animate-pulse bg-slate-200/80 dark:bg-slate-800/80',
        variant === 'rounded' && 'rounded-2xl',
        variant === 'rectangular' && 'rounded-none',
        variant === 'circular' && 'rounded-full',
        className
      )}
      {...props}
    />
  );
};
