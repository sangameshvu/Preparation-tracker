import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(num?: number | null): string {
  if (num === undefined || num === null) return '–';
  return num.toString();
}

export function formatPercentile(num?: number | null): string {
  if (num === undefined || num === null) return '–';
  return `${num.toFixed(1)}%ile`;
}
