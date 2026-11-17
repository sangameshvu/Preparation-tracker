import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  colorClass?: string;
  trackClass?: string;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 68,
  strokeWidth = 6,
  colorClass = 'text-blue-600 dark:text-blue-500',
  trackClass = 'text-slate-100 dark:text-slate-800',
  showLabel = true,
  label,
  sublabel,
  className,
  children
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClass}
          fill="none"
        />
        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(colorClass, 'transition-all duration-700 ease-out')}
          fill="none"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        {children ? (
          children
        ) : showLabel ? (
          <>
            <span className="text-xs font-bold tabular-nums tracking-tight text-foreground leading-none">
              {label !== undefined ? label : `${normalizedProgress}%`}
            </span>
            {sublabel && (
              <span className="text-[9px] text-muted-foreground font-medium mt-0.5 leading-none">
                {sublabel}
              </span>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
