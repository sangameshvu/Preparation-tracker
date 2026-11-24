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

    // Prioritize explicit section topics from 7-Day Grid allocation
    if (gridAlloc.quantTopic) {
      suggestedGoals.push({
        title: `Quant: ${gridAlloc.quantTopic}`,
        shortTitle: 'Quant Target',
        section: 'Quant',
        targetMinutes: gridAlloc.quantTargetMinutes || Math.round(targetHoursNum * 25) || 45
      });
    } else if (hasQuant) {
      const cleanNotes = notes.trim();
      const qTitle = cleanNotes && (cleanNotes.toLowerCase().includes('quant') || cleanNotes.toLowerCase().includes('qa') || cleanNotes.toLowerCase().includes('math') || cleanNotes.toLowerCase().includes('percent') || cleanNotes.toLowerCase().includes('number'))
        ? `Quant: ${cleanNotes.slice(0, 50)}`
        : `Quant: Concept Problem Solving & Core Drills`;
      suggestedGoals.push({
        title: qTitle,
        shortTitle: 'Quant Drills',
        section: 'Quant',
        targetMinutes: Math.round(targetHoursNum * 25) || 45
      });
    }

    if (gridAlloc.dilrTopic) {
      suggestedGoals.push({
        title: `DILR: ${gridAlloc.dilrTopic}`,
        shortTitle: 'DILR Target',
        section: 'DILR',
        targetMinutes: gridAlloc.dilrTargetMinutes || Math.round(targetHoursNum * 25) || 45
      });
    } else if (hasDilr) {
      const cleanNotes = notes.trim();
      const dTitle = cleanNotes && (cleanNotes.toLowerCase().includes('di') || cleanNotes.toLowerCase().includes('lr') || cleanNotes.toLowerCase().includes('caselet') || cleanNotes.toLowerCase().includes('arrangement'))
        ? `DILR: ${cleanNotes.slice(0, 50)}`
        : `DILR: Solve Practice Caselets & Reasoning Sets`;
      suggestedGoals.push({
        title: dTitle,
        shortTitle: 'DILR Sets',
        section: 'DILR',
        targetMinutes: Math.round(targetHoursNum * 25) || 45
      });
    }

    if (gridAlloc.varcTopic) {
      suggestedGoals.push({
        title: `VARC: ${gridAlloc.varcTopic}`,
        shortTitle: 'VARC Target',
        section: 'VARC',
        targetMinutes: gridAlloc.varcTargetMinutes || 35
      });
    } else if (hasVarc) {
      suggestedGoals.push({
        title: `VARC: Reading Comprehension Practice (2 Passages)`,
        shortTitle: 'VARC RC',
        section: 'VARC',
        targetMinutes: 35
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

  // Weekdays (Mon-Fri): All 3 sections (Quants, DILR, VARC) covered on the same day!
  const quantTargetTitle = activePlan?.quantPlan
    ? `Quant: ${activePlan.quantPlan.slice(0, 50)}`
    : 'Quant: Concept Problem Solving & Core Drills';
  const dilrTargetTitle = activePlan?.dilrPlan
    ? `DILR: ${activePlan.dilrPlan.slice(0, 50)}`
    : 'DILR: Solve Practice Caselets & Reasoning Sets';
  const varcTargetTitle = activePlan?.varcPlan
    ? `VARC: ${activePlan.varcPlan.slice(0, 50)}`
    : 'VARC: Reading Comprehension Practice (2 Passages)';

  return {
    dayName,
    dateString,
    formattedDate,
    primarySubjects: 'All 3: QA + DILR + VARC',
    shortBadge: 'All 3: QA+DILR+VARC',
    focusType: 'qa',
    subjectTitle: 'Daily Tri-Section Study: Quants + DILR + VARC',
    description: 'Cover all 3 sections every day: Quantitative Aptitude drills, DILR logic reasoning caselets, and VARC reading comprehension.',
    alternatingSubject: 'General',
    suggestedGoals: [
      {
        title: quantTargetTitle,
        shortTitle: 'Quant Target',
        section: 'Quant',
        targetMinutes: 45
      },
      {
        title: dilrTargetTitle,
        shortTitle: 'DILR Target',
        section: 'DILR',
        targetMinutes: 45
      },
      {
        title: varcTargetTitle,
        shortTitle: 'VARC Target',
        section: 'VARC',
        targetMinutes: 35
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
