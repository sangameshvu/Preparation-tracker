import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  tint?: 'quant' | 'dilr' | 'varc' | 'slate' | 'rose' | 'neutral';
  trend?: {
    value: string;
    positive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeVariant = 'info',
  tint,
  trend,
  onClick,
  className
}) => {
  const badgeClasses = {
    default: 'glass-thin text-slate-700 dark:text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    destructive: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30',
    info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
  };

  const tintOverlays = {
    quant: 'bg-blue-500/8 dark:bg-blue-500/12 border-blue-500/30 hover:border-blue-500/50',
    dilr: 'bg-teal-500/8 dark:bg-teal-500/12 border-teal-500/30 hover:border-teal-500/50',
    varc: 'bg-amber-500/8 dark:bg-amber-500/12 border-amber-500/30 hover:border-amber-500/50',
    rose: 'bg-rose-500/8 dark:bg-rose-500/12 border-rose-500/30 hover:border-rose-500/50',
    slate: 'bg-slate-500/8 dark:bg-slate-500/12 border-slate-500/30 hover:border-slate-500/50',
    neutral: ''
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl glass-regular p-5 text-card-foreground transition-all duration-200',
        tint && tintOverlays[tint],
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground tracking-normal">{title}</span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl glass-subtier text-slate-700 dark:text-slate-200 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
        {badge && (
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold', badgeClasses[badgeVariant])}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={cn('font-semibold', trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
