import { StudyActivityItem, DailyGoalItem } from '../types';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const initialActivities: StudyActivityItem[] = [
  {
    id: 'act-1',
    date: today,
    timestamp: new Date().toISOString(),
    category: 'topic',
    title: 'Completed PYQs for Fractions & Percentage Shortcuts',
    details: 'Mastered 1/2 through 1/20 reciprocals and base multiplication tricks.',
    section: 'Quant',
    durationMinutes: 45
  },
  {
    id: 'act-2',
    date: today,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    category: 'task',
    title: 'Read Aeon Essay: Philosophy of Mind',
    details: 'Practiced identifying the author’s primary thesis and tonal shifts.',
    section: 'VARC',
    durationMinutes: 30
  },
  {
    id: 'act-3',
    date: yesterday,
    timestamp: new Date(Date.now() - 90000000).toISOString(),
    category: 'mock',
    title: 'Diagnostic Sectional Mock 1 Attempted',
    details: 'Overall score: 68 (VARC: 28, DILR: 18, QA: 22). Analyzed 4 time sinks.',
    section: 'General',
    durationMinutes: 120
  },
  {
    id: 'act-4',
    date: yesterday,
    timestamp: new Date(Date.now() - 95000000).toISOString(),
    category: 'mistake',
    title: 'Logged Mistake: Remainder Theorem negative remainder',
    details: 'Rule: Always add divisor if remainder calculation yields negative.',
    section: 'Quant',
    durationMinutes: 15
  },
  {
    id: 'act-5',
    date: twoDaysAgo,
    timestamp: new Date(Date.now() - 176400000).toISOString(),
    category: 'note',
    title: 'Authored Study Note: Linear & Circular Seating Matrix Rules',
    details: 'Created quick reference formulas and attached 1 notebook scan.',
    section: 'DILR',
    durationMinutes: 40
  }
];

export const initialDailyGoals: DailyGoalItem[] = [];
