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

export const initialDailyGoals: DailyGoalItem[] = [];
