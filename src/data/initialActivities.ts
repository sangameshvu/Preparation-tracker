import { StudyActivityItem, DailyGoalItem } from '../types';

const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
const fourDaysAgo = new Date(Date.now() - 345600000).toISOString().split('T')[0];
const fiveDaysAgo = new Date(Date.now() - 432000000).toISOString().split('T')[0];

export const initialAeonCompletedDates: string[] = [
  fiveDaysAgo,
  fourDaysAgo,
  threeDaysAgo,
  twoDaysAgo
];

export const initialActivities: StudyActivityItem[] = [
  {
    id: 'act-goal-1',
    date: yesterday,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    category: 'goal',
    title: 'Completed Goal: Diagnostic Fraction to % Drills',
    details: 'Daily target achieved: 45m in Quant (Speed Math & Reciprocals).',
    section: 'Quant',
    durationMinutes: 45
  },
  {
    id: 'act-goal-2',
    date: twoDaysAgo,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    category: 'goal',
    title: 'Completed Goal: Daily Reading & Main Idea Note',
    details: 'Daily target achieved: 35m in VARC (Aeon Essay Analysis).',
    section: 'VARC',
    durationMinutes: 35
  },
  {
    id: 'act-goal-3',
    date: threeDaysAgo,
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    category: 'goal',
    title: 'Completed Goal: Aeon Essay: The Philosophy of Time',
    details: 'Daily target achieved: 35m in VARC (Long-form Reading Stamina).',
    section: 'VARC',
    durationMinutes: 35
  },
  {
    id: 'act-goal-4',
    date: fourDaysAgo,
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    category: 'goal',
    title: 'Completed Goal: Aeon Essay: Evolution & Consciousness',
    details: 'Daily target achieved: 30m in VARC (Passage Argument Mapping).',
    section: 'VARC',
    durationMinutes: 30
  }
];

export const initialDailyGoals: DailyGoalItem[] = [
  {
    id: 'goal-seed-1',
    date: yesterday,
    title: 'Diagnostic Fraction to % Drills (1/2 to 1/20)',
    section: 'Quant',
    targetMinutes: 45,
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'goal-seed-2',
    date: yesterday,
    title: 'Aeon Essay: Daily Long-form Reading & Main Idea Note',
    section: 'VARC',
    targetMinutes: 35,
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'goal-seed-3',
    date: yesterday,
    title: '2 Practice Sets on Circular Seating Arrangements',
    section: 'DILR',
    targetMinutes: 40,
    completed: false
  },
  {
    id: 'goal-seed-4',
    date: twoDaysAgo,
    title: 'Daily Reading: The Philosophy of Time',
    section: 'VARC',
    targetMinutes: 35,
    completed: true,
    completedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'goal-seed-5',
    date: twoDaysAgo,
    title: 'Multiplication Tables & Square Shortcuts 1-30',
    section: 'Quant',
    targetMinutes: 30,
    completed: true,
    completedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'goal-seed-6',
    date: twoDaysAgo,
    title: 'Matrix Arrangement Caselet Analysis',
    section: 'DILR',
    targetMinutes: 45,
    completed: false
  }
];
