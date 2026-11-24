import { format, parseISO, differenceInCalendarDays, getDay } from 'date-fns';
import { SectionType, WeeklyPlanItem, DayScheduleAllocation } from '../types';

export interface DailyScheduleFocus {
  dayName: string;
  dateString: string; // 'yyyy-MM-dd'
  formattedDate: string; // 'Friday, Nov 20'
  primarySubjects: string;
  shortBadge: string;
  focusType: 'dilr' | 'qa' | 'revision' | 'custom';
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
 * Computes today's study focus based on the active week's 7-Day Grid allocation:
 * - If the 7-day grid has a customized allocation for today (Mon-Sun), it dynamically
 *   derives the subject targets for VARC, DILR, and Quant directly from that day's entry.
 * - Otherwise falls back to the canonical alternating schedule:
 *   - Daily Core: VARC every single day (Editorial / Aeon essay + RC)
 *   - Weekdays: Alternating between Quant (QA) and DI (DILR) based on Odd/Even week cycle
 *   - Weekends: Saturday Consolidation & Sunday Mock/Mistake review
 */
export function getDailyScheduleFocus(
  targetDate: Date = new Date(),
  currentWeekNumber: number = 1,
  activePlan?: WeeklyPlanItem
): DailyScheduleFocus {
  const dateString = format(targetDate, 'yyyy-MM-dd');
  const dayName = format(targetDate, 'EEEE');
  const formattedDate = format(targetDate, 'EEEE, MMM d');
  const dayOfWeek = getDay(targetDate); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayIdx = (dayOfWeek + 6) % 7; // Monday-based index: 0 = Mon, 1 = Tue, ..., 6 = Sun
  const isOddWeek = currentWeekNumber % 2 !== 0;

  // 1. Check if the active plan has a customized 7-Day Grid allocation for today
  const gridAlloc: DayScheduleAllocation | undefined = activePlan?.dailyGrid?.[dayIdx];

  if (gridAlloc) {
    const title = gridAlloc.title || '';
    const desc = gridAlloc.description || '';
    const badge = gridAlloc.badgeLabel || '';
    const notes = gridAlloc.notes || '';
    const targetHoursNum = parseFloat(gridAlloc.targetHours || '2.5') || 2.5;

    const combinedText = `${title} ${desc} ${badge} ${notes}`.toLowerCase();
    const hasVarc = combinedText.includes('varc') || combinedText.includes('rc') || combinedText.includes('verbal') || combinedText.includes('reading') || combinedText.includes('va');
    const hasDilr = combinedText.includes('dilr') || combinedText.includes('di') || combinedText.includes('lr') || combinedText.includes('caselet') || combinedText.includes('puzzle') || combinedText.includes('arrangement');
    const hasQuant = combinedText.includes('quant') || combinedText.includes('qa') || combinedText.includes('math') || combinedText.includes('arithmetic') || combinedText.includes('algebra') || combinedText.includes('geometry') || combinedText.includes('number');
    const isRevision = combinedText.includes('revision') || combinedText.includes('review') || combinedText.includes('mock');

    const suggestedGoals: Array<{
      title: string;
      shortTitle?: string;
      section: SectionType;
      targetMinutes: number;
    }> = [];

    // Extract custom notes excerpt if user wrote specific topic tasks in notes
    const cleanNotes = notes.trim();

    if (hasQuant) {
      const qTitle = cleanNotes && (cleanNotes.toLowerCase().includes('quant') || cleanNotes.toLowerCase().includes('qa') || cleanNotes.toLowerCase().includes('math') || cleanNotes.toLowerCase().includes('percent') || cleanNotes.toLowerCase().includes('number'))
        ? `Quant: ${cleanNotes.slice(0, 50)}`
        : `Quant: Concept Problem Solving & Core Drills`;
      suggestedGoals.push({
        title: qTitle,
        shortTitle: 'Quant Drills',
        section: 'Quant',
        targetMinutes: Math.round(targetHoursNum * 30) || 60
      });
    }

    if (hasDilr) {
      const dTitle = cleanNotes && (cleanNotes.toLowerCase().includes('di') || cleanNotes.toLowerCase().includes('lr') || cleanNotes.toLowerCase().includes('caselet') || cleanNotes.toLowerCase().includes('arrangement'))
        ? `DILR: ${cleanNotes.slice(0, 50)}`
        : `DILR: Solve Practice Caselets & Reasoning Sets`;
      suggestedGoals.push({
        title: dTitle,
        shortTitle: 'DILR Sets',
        section: 'DILR',
        targetMinutes: Math.round(targetHoursNum * 25) || 50
      });
    }

    if (hasVarc) {
      suggestedGoals.push({
        title: `VARC: Reading Comprehension Practice (2 Passages)`,
        shortTitle: 'VARC RC',
        section: 'VARC',
        targetMinutes: 45
      });
    }

    if (isRevision && suggestedGoals.length === 0) {
      suggestedGoals.push({
        title: 'Weekly Revision: Consolidate QA, DILR & VARC Problem Sets',
        shortTitle: 'Weekly Revision',
        section: 'General',
        targetMinutes: 60
      });
    }

    const primarySection: SectionType = hasQuant ? 'Quant' : hasDilr ? 'DILR' : hasVarc ? 'VARC' : 'General';

    return {
      dayName,
      dateString,
      formattedDate,
      primarySubjects: title || (badge ? `Focus: ${badge}` : '7-Day Grid Focus'),
      shortBadge: badge || 'Grid Plan',
      focusType: hasDilr ? 'dilr' : hasQuant ? 'qa' : isRevision ? 'revision' : 'custom',
      subjectTitle: title || `7-Day Grid: ${dayName} Focus`,
      description: desc || notes || `Today's targets set according to your 7-Day Grid (${badge || dayName}).`,
      alternatingSubject: primarySection,
      suggestedGoals: suggestedGoals.length > 0 ? suggestedGoals : [
        {
          title: `${title || 'Daily Targets'}: Core Problem Sets (${badge || 'Study'})`,
          shortTitle: badge || 'Grid Targets',
          section: primarySection,
          targetMinutes: 60
        }
      ]
    };
  }

  // 2. Canonical Alternating & Weekend Fallback if not customized in 7-Day Grid
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
  // Odd Week Cycle A: Mon (QA), Tue (DI), Wed (QA), Thu (DI), Fri (QA)
  // Even Week Cycle B: Mon (DI), Tue (QA), Wed (DI), Thu (QA), Fri (DI)
  const isDI = isOddWeek
    ? dayOfWeek === 2 || dayOfWeek === 4
    : dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;

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

/**
 * Helper to determine if a topic's planWeek matches the target week number.
 * Supports single numbers ('1', '4'), ranges ('2-3', '2–3', '10-12'),
 * comma/semicolon-separated values ('1, 3, 5'), or prefixes ('Week 4', 'W5').
 */
export function isTopicInWeek(planWeek: string | undefined | null, targetWeek: number): boolean {
  if (!planWeek) return false;
  const clean = String(planWeek).trim().replace(/\u2013|\u2014/g, '-');
  const parts = clean.split(/[,;/]+/);

  for (const part of parts) {
    const trimmed = part.trim().replace(/^week\s*/i, '').replace(/^w\s*/i, '');
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        if (targetWeek >= Math.min(start, end) && targetWeek <= Math.max(start, end)) {
          return true;
        }
      } else if (!isNaN(start) && targetWeek === start) {
        return true;
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num === targetWeek) {
        return true;
      }
    }
  }

  return false;
}
