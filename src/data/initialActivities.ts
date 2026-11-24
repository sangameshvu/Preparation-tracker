import { StudyActivityItem, DailyGoalItem } from '../types';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
const fourDaysAgo = new Date(Date.now() - 345600000).toISOString().split('T')[0];
const fiveDaysAgo = new Date(Date.now() - 432000000).toISOString().split('T')[0];

export const initialAeonCompletedDates: string[] = [
  fiveDaysAgo,
  fourDaysAgo,
  threeDaysAgo,
  twoDaysAgo,
  yesterday
];

export const initialPuzzleCompletedDates: string[] = [
  fiveDaysAgo,
  fourDaysAgo,
  threeDaysAgo,
  twoDaysAgo,
  yesterday
];

export const initialSpeedMathCompletedDates: string[] = [
  fiveDaysAgo,
  fourDaysAgo,
  threeDaysAgo,
  twoDaysAgo,
  yesterday
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
  // Today's 4 Mandatory Goals (Pending by default)
  {
    id: 'goal-today-default-1',
    date: today,
    title: 'VARC: 1 Aeon Essay',
    section: 'VARC',
    targetMinutes: 35,
    completed: false
  },
  {
    id: 'goal-today-default-2',
    date: today,
    title: 'VARC: Vocabulary Practice', // Formerly 'VARC: 5 root words'
    section: 'VARC',
    targetMinutes: 20,
    completed: false
  },
  {
    id: 'goal-today-default-3',
    date: today,
    title: 'Quant: Vedic Math / Speed Math',
    section: 'Quant',
    targetMinutes: 20,
    completed: false
  },
  {
    id: 'goal-today-default-4',
    date: today,
    title: 'DILR: Daily Puzzle',
    section: 'DILR',
    targetMinutes: 20,
    completed: false
  },
  // Yesterday's Completed Seed Goals (Demonstrates calendar history & streak)
  {
    id: 'goal-yesterday-1',
    date: yesterday,
    title: 'VARC: 1 Aeon Essay',
    section: 'VARC',
    targetMinutes: 35,
    completed: true
  },
  {
    id: 'goal-yesterday-2',
    date: yesterday,
    title: 'Quant: Diagnostic Fraction to % Drills',
    section: 'Quant',
    targetMinutes: 45,
    completed: true
  },
  {
    id: 'goal-yesterday-3',
    date: yesterday,
    title: 'DILR: Daily Puzzle',
    section: 'DILR',
    targetMinutes: 20,
    completed: true
  },
  // Two Days Ago Completed Seed Goals
  {
    id: 'goal-two-days-ago-1',
    date: twoDaysAgo,
    title: 'VARC: 1 Aeon Essay',
    section: 'VARC',
    targetMinutes: 35,
    completed: true
  },
  {
    id: 'goal-two-days-ago-2',
    date: twoDaysAgo,
    title: 'Quant: Vedic Math / Speed Math',
    section: 'Quant',
    targetMinutes: 20,
    completed: true
  }
];
