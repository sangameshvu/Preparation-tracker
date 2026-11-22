import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns';

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  isYesterdayDone: boolean;
  isTodayDone: boolean;
  streakAtRisk: boolean;
  activeDatesCount: number;
  lastActiveDate?: string;
  previousStreakLength: number; // Streak leading up to two days ago if yesterday was missed
}

/**
 * Calculates study streak based on completed date strings ('YYYY-MM-DD').
 * Unbroken streak rules:
 * - If today is done, counts consecutively backward from today.
 * - If today is NOT done, but yesterday was done, the streak is active and unbroken (today is pending).
 * - If neither today nor yesterday is done, but the days before yesterday were active,
 *   the streak is flagged as 'streakAtRisk' (grace period / streak saver available).
 *   Marking yesterday done retroactively seamlessly restores and increments the streak!
 */
export function calculateStreak(
  completedDates: string[] = [],
  referenceDate: Date = new Date()
): StreakResult {
  const dateSet = new Set(completedDates.filter(Boolean));
  const todayStr = format(referenceDate, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(referenceDate, 1), 'yyyy-MM-dd');

  const isTodayDone = dateSet.has(todayStr);
  const isYesterdayDone = dateSet.has(yesterdayStr);

  let currentStreak = 0;
  let checkDate: Date;

  if (isTodayDone) {
    currentStreak = 1;
    checkDate = subDays(referenceDate, 1);
    while (dateSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (isYesterdayDone) {
    currentStreak = 1;
    checkDate = subDays(referenceDate, 2);
    while (dateSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else {
    currentStreak = 0;
  }

  // Count prior streak leading up to two days ago to determine if yesterday can recover an active streak
  let previousStreakLength = 0;
  if (!isYesterdayDone) {
    let checkPrior = subDays(referenceDate, 2);
    while (dateSet.has(format(checkPrior, 'yyyy-MM-dd'))) {
      previousStreakLength++;
      checkPrior = subDays(checkPrior, 1);
    }
  }

  const streakAtRisk = !isYesterdayDone && previousStreakLength > 0;

  // Calculate all-time best streak
  let bestStreak = currentStreak;
  const sortedDates = Array.from(dateSet).sort();
  if (sortedDates.length > 0) {
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = parseISO(sortedDates[i - 1]);
      const curr = parseISO(sortedDates[i]);
      const diff = differenceInCalendarDays(curr, prev);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  }

  const sortedDesc = Array.from(dateSet).sort().reverse();
  const lastActiveDate = sortedDesc[0];

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak, previousStreakLength),
    isYesterdayDone,
    isTodayDone,
    streakAtRisk,
    activeDatesCount: dateSet.size,
    lastActiveDate,
    previousStreakLength
  };
}

/**
 * Generates the last N days with their completion status for calendar / habit inspection
 */
export function getRecentHabitDays(
  completedDates: string[] = [],
  daysCount: number = 7,
  referenceDate: Date = new Date()
): Array<{
  dateStr: string;
  dayName: string;
  label: string;
  isToday: boolean;
  isYesterday: boolean;
  completed: boolean;
}> {
  const dateSet = new Set(completedDates);
  const todayStr = format(referenceDate, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(referenceDate, 1), 'yyyy-MM-dd');

  const days = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = subDays(referenceDate, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const isToday = dateStr === todayStr;
    const isYesterday = dateStr === yesterdayStr;
    const dayName = format(d, 'EEE');
    const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : format(d, 'MMM d');

    days.push({
      dateStr,
      dayName,
      label,
      isToday,
      isYesterday,
      completed: dateSet.has(dateStr)
    });
  }
  return days;
}
