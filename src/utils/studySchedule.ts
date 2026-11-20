import { format, parseISO, differenceInCalendarDays, getDay } from 'date-fns';
import { SectionType } from '../types';

export interface DailyScheduleFocus {
  dayName: string;
  dateString: string; // 'yyyy-MM-dd'
  formattedDate: string; // 'Friday, Nov 20'
  primarySubjects: 'VARC + DILR' | 'VARC + QA' | 'Weekly Revision' | 'Weekly Revision & Mock';
  shortBadge: string;
  focusType: 'dilr' | 'qa' | 'revision';
  subjectTitle: string;
  description: string;
  alternatingSubject: SectionType;
  suggestedGoals: Array<{
    title: string;
    shortTitle?: string;
    section: SectionType;
    targetMinutes: number;
  }>;
}

/**
 * Computes today's alternating study focus according to the rule:
 * - Daily Core: VARC every single day (Editorial / Aeon essay + RC)
 * - Weekdays (Mon-Fri): Alternating between DI (DILR) and Quant (QA)
 *   Odd Weeks: Mon (DI), Tue (QA), Wed (DI), Thu (QA), Fri (DI)
 *   Even Weeks: Mon (QA), Tue (DI), Wed (QA), Thu (DI), Fri (QA)
 * - Weekends (Sat-Sun): Dedicated to comprehensive revision
 *   Sat: Weekly Revision (Consolidate DI, QA, VARC)
 *   Sun: Weekly Revision & Mock Review (Mistake log audit + test recap)
 */
export function getDailyScheduleFocus(
  targetDate: Date = new Date(),
  currentWeekNumber: number = 1
): DailyScheduleFocus {
  const dateString = format(targetDate, 'yyyy-MM-dd');
  const dayName = format(targetDate, 'EEEE');
  const formattedDate = format(targetDate, 'EEEE, MMM d');
  const dayOfWeek = getDay(targetDate); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const isOddWeek = currentWeekNumber % 2 !== 0;

  // Weekend: Saturday
  if (dayOfWeek === 6) {
    return {
      dayName,
      dateString,
      formattedDate,
      primarySubjects: 'Weekly Revision',
      shortBadge: 'Weekly Revision',
      focusType: 'revision',
      subjectTitle: 'Comprehensive Weekly Revision',
      description: 'Consolidate and re-solve all QA, DILR & VARC topics covered during this week.',
      alternatingSubject: 'General',
      suggestedGoals: [
        {
          title: 'Weekly Consolidation: Re-solve QA & DI topic problem sets',
          shortTitle: 'QA & DI Re-solve',
          section: 'General',
          targetMinutes: 60
        },
        {
          title: 'VARC Weekly Review: Reading notes & vocabulary log recap',
          shortTitle: 'VARC Review',
          section: 'VARC',
          targetMinutes: 40
        },
        {
          title: 'Formula Notebook: Review and test weekly key formulas',
          shortTitle: 'Formula Book',
          section: 'Quant',
          targetMinutes: 30
        }
      ]
    };
  }

  // Weekend: Sunday
  if (dayOfWeek === 0) {
    return {
      dayName,
      dateString,
      formattedDate,
      primarySubjects: 'Weekly Revision & Mock',
      shortBadge: 'Revision & Mock',
      focusType: 'revision',
      subjectTitle: 'Weekly Revision & Mock Review',
      description: 'Audit your Mistake Log, clear overdue flagged questions, and review mock test analytics.',
      alternatingSubject: 'General',
      suggestedGoals: [
        {
          title: 'Mock / Sectional Test: Timed drill and thorough analysis',
          shortTitle: 'Sectional Mock',
          section: 'General',
          targetMinutes: 90
        },
        {
          title: 'Mistake Log Audit: Re-solve 3 overdue flagged questions',
          shortTitle: 'Mistake Audit',
          section: 'General',
          targetMinutes: 45
        },
        {
          title: 'Weekly Strategy Check: Review analytics & calibrate sprint',
          shortTitle: 'Strategy Check',
          section: 'General',
          targetMinutes: 30
        }
      ]
    };
  }

  // Weekdays (Mon-Fri)
  // Odd Week Cycle A: Mon (DI), Tue (QA), Wed (DI), Thu (QA), Fri (DI)
  // Even Week Cycle B: Mon (QA), Tue (DI), Wed (QA), Thu (DI), Fri (QA)
  const isDI = isOddWeek
    ? dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5
    : dayOfWeek === 2 || dayOfWeek === 4;

  if (isDI) {
    return {
      dayName,
      dateString,
      formattedDate,
      primarySubjects: 'VARC + DILR',
      shortBadge: 'VARC + DILR',
      focusType: 'dilr',
      subjectTitle: 'Daily VARC + Data Interpretation (DI)',
      description: 'Daily VARC endurance + alternating core focus on Data Interpretation sets and reasoning puzzles.',
      alternatingSubject: 'DILR',
      suggestedGoals: [
        {
          title: 'Daily VARC: Read 1 Aeon Essay & Solve 1 Full RC Set',
          shortTitle: 'Daily VARC',
          section: 'VARC',
          targetMinutes: 45
        },
        {
          title: 'DILR Core: Solve 2 Unseen Data Interpretation Sets',
          shortTitle: 'DILR Core',
          section: 'DILR',
          targetMinutes: 60
        },
        {
          title: 'DILR Speed Drill: Timed caselet & tabular calculations',
          shortTitle: 'DILR Speed Drill',
          section: 'DILR',
          targetMinutes: 30
        }
      ]
    };
  }

  // Otherwise QA
  return {
    dayName,
    dateString,
    formattedDate,
    primarySubjects: 'VARC + QA',
    shortBadge: 'VARC + QA',
    focusType: 'qa',
    subjectTitle: 'Daily VARC + Quantitative Aptitude (QA)',
    description: 'Daily VARC endurance + alternating core focus on Quantitative Aptitude concept theory and problem drills.',
    alternatingSubject: 'Quant',
    suggestedGoals: [
      {
        title: 'Daily VARC: Read 1 Editorial & Practice 5 VA Questions',
        shortTitle: 'Daily VARC',
        section: 'VARC',
        targetMinutes: 45
      },
      {
        title: 'Quant Core: Solve 20 Concept Practice Questions',
        shortTitle: 'Quant Core',
        section: 'Quant',
        targetMinutes: 60
      },
      {
        title: 'Quant Drill: Re-solve 2 Flagged Mistake Log Problems',
        shortTitle: 'Quant Drill',
        section: 'Quant',
        targetMinutes: 30
      }
    ]
  };
}
