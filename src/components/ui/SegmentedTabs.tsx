import React from 'react';
import { cn } from '../../lib/utils';

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'rose' | 'amber' | 'emerald';
}

interface SegmentedTabsProps {
  options: TabOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  options,
  value,
  onChange,
  className,
  size = 'md',
  fullWidth = false
}) => {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-xs sm:text-sm',
    lg: 'p-1.5 text-sm sm:text-base'
  };

  const itemPadding = {
    sm: 'px-2.5 py-1',
    md: 'px-3.5 py-1.5',
    lg: 'px-4.5 py-2'
  };

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center bg-black/5 dark:bg-white/5 rounded-full border border-white/60 dark:border-white/10 p-1 select-none backdrop-blur-xl transition-all shadow-inner',
        sizeClasses[size],
        fullWidth && 'w-full flex',
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out min-h-[32px]',
              itemPadding[size],
              fullWidth && 'flex-1',
              isActive
                ? 'bg-white/95 dark:bg-slate-800/90 text-foreground font-bold shadow-xs border border-white/80 dark:border-white/10 backdrop-blur-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            )}
          >
            {option.icon && (
              <span className={cn('shrink-0', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')}>
                {option.icon}
              </span>
            )}
            <span className="whitespace-nowrap">{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums',
                  isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                    : 'bg-slate-300/60 dark:bg-slate-700 text-muted-foreground'
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
