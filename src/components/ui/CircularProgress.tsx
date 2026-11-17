import React from 'react';
import { cn } from '../../lib/utils';

export interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string; // Tailwind stroke color class
  trackColor?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
  label,
  sublabel,
  color = 'text-blue-600 dark:text-blue-500',
  trackColor = 'text-slate-100 dark:text-slate-800',
  className
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        {/* Background Track */}
        <circle
          className={cn('stroke-current', trackColor)}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Indicator */}
        <circle
          className={cn('stroke-current transition-all duration-700 ease-out', color)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-bold tracking-tight text-foreground">
          {label !== undefined ? label : `${Math.round(clamped)}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
