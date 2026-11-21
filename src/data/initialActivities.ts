import { StudyActivityItem, DailyGoalItem } from '../types';

const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

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
  }
];

export const initialDailyGoals: DailyGoalItem[] = [];
