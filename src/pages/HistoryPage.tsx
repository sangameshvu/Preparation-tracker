import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Calendar as CalendarIcon,
  Clock,
  History,
  CheckCircle2,
  BookOpen,
  Trophy,
  AlertTriangle,
  Flame,
  FileText,
  Filter,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  Circle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  CalendarDays
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { ActivityCategory, SectionType, DailyGoalItem } from '../types';
import {
  format,
  parseISO,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isYesterday
} from 'date-fns';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export const HistoryPage: React.FC = () => {
  const {
    activities,
    addActivity,
    deleteActivity,
    dailyGoals,
    toggleDailyGoal,
    addDailyGoal,
    deleteDailyGoal
  } = useAppData();

  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [goalsFilter, setGoalsFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [sectionFilter, setSectionFilter] = useState<'all' | SectionType>('all');

  // Inline Goal Form State for Selected Date
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSection, setNewGoalSection] = useState<SectionType>('Quant');
  const [newGoalMinutes, setNewGoalMinutes] = useState(45);

  // Manual Session Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDetails, setManualDetails] = useState('');
  const [manualSection, setManualSection] = useState<SectionType>('Quant');
  const [manualCategory, setManualCategory] = useState<ActivityCategory>('goal');
  const [manualDuration, setManualDuration] = useState(45);
  const [manualDate, setManualDate] = useState(todayDateStr);

  // Calendar calculations
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOffset = (monthStart.getDay() + 6) % 7; // Monday = 0

  // Index daily goals by date
  const goalsByDate = useMemo(() => {
    const map: Record<string, DailyGoalItem[]> = {};
    dailyGoals.forEach((g) => {
      if (!map[g.date]) map[g.date] = [];
      map[g.date].push(g);
    });
    return map;
  }, [dailyGoals]);

  // Index activities by date
  const activitiesByDate = useMemo(() => {
    const map: Record<string, typeof activities> = {};
    activities.forEach((act) => {
      if (!map[act.date]) map[act.date] = [];
      map[act.date].push(act);
    });
    return map;
  }, [activities]);

  // Selected date goals (both completed and pending)
  const allSelectedDayGoals = goalsByDate[selectedDate] || [];

  const completedGoalsCount = allSelectedDayGoals.filter((g) => g.completed).length;
  const pendingGoalsCount = allSelectedDayGoals.filter((g) => !g.completed).length;
  const totalGoalsCount = allSelectedDayGoals.length;
  const goalsPct = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Filtered goals for selected date based on filter tabs
  const filteredSelectedDayGoals = useMemo(() => {
    if (goalsFilter === 'completed') return allSelectedDayGoals.filter((g) => g.completed);
    if (goalsFilter === 'pending') return allSelectedDayGoals.filter((g) => !g.completed);
    return allSelectedDayGoals;
  }, [allSelectedDayGoals, goalsFilter]);

  // Filtered activities for selected date
  const currentDayActivities = useMemo(() => {
    const dayActs = activitiesByDate[selectedDate] || [];
    return dayActs.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (sectionFilter !== 'all' && a.section !== sectionFilter) return false;
      return true;
    });
  }, [activitiesByDate, selectedDate, categoryFilter, sectionFilter]);

  // Unique active dates across history
  const activeDates = Object.keys(activitiesByDate).sort().reverse();

  const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
    topic: <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    task: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    mock: <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    mistake: <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
    goal: <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
    note: <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    study: <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
  };

  const handleDateShift = (direction: 'prev' | 'next') => {
    const current = parseISO(selectedDate);
    const shifted = direction === 'prev' ? subDays(current, 1) : addDays(current, 1);
    const newDateStr = format(shifted, 'yyyy-MM-dd');
    setSelectedDate(newDateStr);
    // Keep calendar view in sync with shifted date's month
    if (!isSameMonth(shifted, calendarMonth)) {
      setCalendarMonth(shifted);
    }
  };

  const handleAddGoalForSelectedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addDailyGoal({
      title: newGoalTitle.trim(),
      section: newGoalSection,
      targetMinutes: Number(newGoalMinutes) || 45,
      completed: false,
      date: selectedDate
    });
    setNewGoalTitle('');
    toast.success(`Target added for ${format(parseISO(selectedDate), 'MMM d')}!`);
  };

  const handleCreateManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    addActivity({
      date: manualDate,
      category: manualCategory,
      title: manualTitle.trim(),
      details: manualDetails.trim() || undefined,
      section: manualSection,
      durationMinutes: Number(manualDuration) || 30
    });
    setManualTitle('');
    setManualDetails('');
    setIsDialogOpen(false);
    toast.success('Activity logged to study history!');
  };

  const formattedSelectedDate = useMemo(() => {
    try {
      const parsed = parseISO(selectedDate);
      if (isToday(parsed)) return 'Today (' + format(parsed, 'EEEE, MMM d') + ')';
      if (isYesterday(parsed)) return 'Yesterday (' + format(parsed, 'EEEE, MMM d') + ')';
      return format(parsed, 'EEEE, dd MMMM yyyy');
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Study History & Goals Archive</h1>
            <Badge variant="blue" className="font-mono text-xs">
              Calendar & Daily Targets
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Select any date on the calendar to view both completed and pending goals, or add targets retroactively.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Activity</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Log Study Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateManualSession} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Activity Title</label>
                  <Input
                    placeholder="e.g., Practiced 25 Time, Speed & Distance Questions"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Key Learnings / Details</label>
                  <Input
                    placeholder="e.g., Mastered relative speed concepts for circular tracks"
                    value={manualDetails}
                    onChange={(e) => setManualDetails(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Section</label>
                    <Select value={manualSection} onValueChange={(v) => setManualSection(v as SectionType)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quant">Quant</SelectItem>
                        <SelectItem value="DILR">DILR</SelectItem>
                        <SelectItem value="VARC">VARC</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Minutes</label>
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={manualDuration}
                      onChange={(e) => setManualDuration(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Record Activity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 2. Date Navigation Ribbon with Quick Shortcuts */}
      <Card className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg cursor-pointer"
              onClick={() => handleDateShift('prev')}
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-sm text-foreground">
                {formattedSelectedDate}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg cursor-pointer"
              onClick={() => handleDateShift('next')}
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedDate === todayDateStr ? 'default' : 'outline'}
              size="sm"
              className={selectedDate === todayDateStr ? 'bg-blue-600 text-white h-8 text-xs font-bold rounded-xl' : 'h-8 text-xs rounded-xl'}
              onClick={() => {
                setSelectedDate(todayDateStr);
                setCalendarMonth(new Date());
              }}
            >
              Today
            </Button>
            <Button
              variant={selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'default' : 'outline'}
              size="sm"
              className={selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'bg-blue-600 text-white h-8 text-xs font-bold rounded-xl' : 'h-8 text-xs rounded-xl'}
              onClick={() => {
                const yday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
                setSelectedDate(yday);
                setCalendarMonth(subDays(new Date(), 1));
              }}
            >
              Yesterday
            </Button>
            <Button
              variant={selectedDate === format(subDays(new Date(), 2), 'yyyy-MM-dd') ? 'default' : 'outline'}
              size="sm"
              className={selectedDate === format(subDays(new Date(), 2), 'yyyy-MM-dd') ? 'bg-blue-600 text-white h-8 text-xs font-bold rounded-xl' : 'h-8 text-xs rounded-xl'}
              onClick={() => {
                const twoAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');
                setSelectedDate(twoAgo);
                setCalendarMonth(subDays(new Date(), 2));
              }}
            >
              2 Days Ago
            </Button>

            {/* Native Date Picker Jump */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
              <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setCalendarMonth(parseISO(e.target.value));
                  }
                }}
                className="h-8 text-xs rounded-xl w-[130px] bg-slate-50 dark:bg-slate-900 border-border"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Main Workspace: Goals & Activity on Left, Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Goals for Selected Day (Both Completed & Pending) + Activity Log */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Daily Goals for Selected Date */}
          <Card className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Goals for {selectedDate === todayDateStr ? "Today" : selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? "Yesterday" : format(parseISO(selectedDate), 'MMM d, yyyy')}</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Displaying both completed and pending goals for this selected date.
                </CardDescription>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center gap-2 flex-wrap">
                {totalGoalsCount > 0 ? (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {completedGoalsCount} of {totalGoalsCount} Done ({goalsPct}%)
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    No Goals Yet
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Filter Tabs: All, Completed, Pending */}
              {totalGoalsCount > 0 && (
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGoalsFilter('all')}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                        goalsFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      All ({totalGoalsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalsFilter('completed')}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1',
                        goalsFilter === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <span>Completed</span>
                      <span className="text-[10px] font-mono font-bold">({completedGoalsCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalsFilter('pending')}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1',
                        goalsFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <span>Pending</span>
                      <span className="text-[10px] font-mono font-bold">({pendingGoalsCount})</span>
                    </button>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="hidden sm:flex items-center gap-2 w-32">
                    <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${goalsPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Goals List (Completed & Pending) */}
              {allSelectedDayGoals.length === 0 ? (
                <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/60 dark:from-slate-900/60 dark:via-card dark:to-slate-950/40 p-5 text-center space-y-3">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto opacity-70" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      No Goals Logged for {format(parseISO(selectedDate), 'EEEE, MMMM d')}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md mx-auto">
                      You can add and backfill study targets for this day below to track both completed and pending goals.
                    </p>
                  </div>

                  {/* Preset Suggestions */}
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 rounded-xl border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      onClick={() =>
                        addDailyGoal({
                          title: 'Quant Topic Practice Drills',
                          section: 'Quant',
                          targetMinutes: 45,
                          completed: false,
                          date: selectedDate
                        })
                      }
                    >
                      + Quant Drill (45m)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 rounded-xl border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                      onClick={() =>
                        addDailyGoal({
                          title: 'Aeon Essay: Daily Long-form Reading',
                          section: 'VARC',
                          targetMinutes: 35,
                          completed: false,
                          date: selectedDate
                        })
                      }
                    >
                      + Aeon Essay (35m)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 rounded-xl border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                      onClick={() =>
                        addDailyGoal({
                          title: '2 DILR Arrangement Caselets',
                          section: 'DILR',
                          targetMinutes: 40,
                          completed: false,
                          date: selectedDate
                        })
                      }
                    >
                      + DILR Sets (40m)
                    </Button>
                  </div>
                </div>
              ) : filteredSelectedDayGoals.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                  No {goalsFilter} goals on this date.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSelectedDayGoals.map((goal) => {
                    const sectionChipClass =
                      goal.section === 'Quant'
                        ? 'chip-quant'
                        : goal.section === 'DILR'
                        ? 'chip-dilr'
                        : goal.section === 'VARC'
                        ? 'chip-varc'
                        : 'chip-general';

                    return (
                      <div
                        key={goal.id}
                        onClick={() => toggleDailyGoal(goal.id)}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group select-none',
                          goal.completed
                            ? 'border-emerald-200/70 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                            : 'border-border/70 bg-slate-50/60 dark:bg-slate-900/30 hover:border-border hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={goal.completed}
                            aria-label={goal.completed ? `Mark ${goal.title} as incomplete` : `Mark ${goal.title} as completed`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDailyGoal(goal.id);
                            }}
                            className={cn(
                              'h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-all duration-150 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                              goal.completed
                                ? 'glass-checkbox bg-blue-600 border-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.4)]'
                                : 'bg-slate-100/80 border-slate-300 dark:bg-slate-800/70 dark:border-slate-600 hover:border-blue-500 hover:scale-105'
                            )}
                          >
                            {goal.completed && <Check className="h-3.5 w-3.5 stroke-[3] text-white" />}
                          </button>
                          <span
                            className={cn(
                              'text-xs font-semibold truncate transition-all',
                              goal.completed
                                ? 'line-through text-muted-foreground opacity-75'
                                : 'text-foreground font-bold'
                            )}
                          >
                            {goal.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Pill: Completed vs Pending */}
                          {goal.completed ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                              Completed ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                              Pending
                            </span>
                          )}

                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sectionChipClass)}>
                            {goal.section}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {goal.targetMinutes}m
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 rounded-lg p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDailyGoal(goal.id);
                              toast.info('Goal removed.');
                            }}
                            title="Delete goal"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Add Goal for Selected Date */}
              <div className="pt-2 border-t border-border/50">
                <form onSubmit={handleAddGoalForSelectedDate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder={`Add target for ${format(parseISO(selectedDate), 'MMM d')}...`}
                    className="text-xs h-9 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border-border flex-1"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={newGoalSection}
                      onChange={(e) => setNewGoalSection(e.target.value as any)}
                      className="h-9 px-3 text-xs rounded-xl border border-border bg-slate-50/70 dark:bg-slate-900/50 font-semibold flex-1 sm:flex-none"
                    >
                      <option value="Quant">Quant</option>
                      <option value="DILR">DILR</option>
                      <option value="VARC">VARC</option>
                      <option value="General">General</option>
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-3 shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      <span>Add Goal</span>
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Card: Target Activity History Log on Selected Date */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" />
                  <span>Activity History Log on {selectedDate}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentDayActivities.length} daily target completions recorded on this date.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                  <SelectTrigger className="h-8 text-xs w-[115px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Targets</SelectItem>
                    <SelectItem value="study">Study Sessions</SelectItem>
                    <SelectItem value="goal">Daily Goals</SelectItem>
                    <SelectItem value="topic">Topics</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {currentDayActivities.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-foreground">No completed targets recorded on this date</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When you check off goals above, accomplishments are automatically audited and logged here.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 text-xs rounded-xl"
                    onClick={() => {
                      setManualDate(selectedDate);
                      setIsDialogOpen(true);
                    }}
                  >
                    + Log Custom Activity for {selectedDate}
                  </Button>
                </div>
              ) : (
                currentDayActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between p-3 rounded-2xl border border-border/70 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-border/80 shadow-2xs">
                        {categoryIcons[act.category]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{act.title}</span>
                        {act.details && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{act.details}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          {act.section && (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{act.section}</span>
                          )}
                          {act.durationMinutes && <span>• {act.durationMinutes} mins</span>}
                          <span>• {format(parseISO(act.timestamp), 'hh:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600 rounded-lg"
                      onClick={() => {
                        deleteActivity(act.id);
                        toast.info('Activity removed.');
                      }}
                      title="Delete activity record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Interactive Calendar & Monthly Navigator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Interactive Month Calendar */}
          <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                    <span>Study History Calendar</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Click any day to jump to that day's goals
                  </CardDescription>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg cursor-pointer"
                    onClick={() => setCalendarMonth((prev) => subMonths(prev, 1))}
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-bold font-mono px-2">
                    {format(calendarMonth, 'MMM yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg cursor-pointer"
                    onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                    title="Next Month"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-3 pb-4">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
                  <span key={dayName} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1">
                    {dayName}
                  </span>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty Offset cells */}
                {Array.from({ length: startDayOffset }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-10 rounded-xl bg-transparent" />
                ))}

                {/* Month Days */}
                {monthDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isSelected = dayStr === selectedDate;
                  const isCurrentDay = isToday(day);
                  const dayGoals = goalsByDate[dayStr] || [];
                  const dayActs = activitiesByDate[dayStr] || [];

                  const hasCompleted = dayGoals.some((g) => g.completed);
                  const hasPending = dayGoals.some((g) => !g.completed);
                  const allDone = dayGoals.length > 0 && !hasPending;

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      onClick={() => setSelectedDate(dayStr)}
                      className={cn(
                        'h-10 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer p-0.5',
                        isSelected
                          ? 'bg-blue-600 text-white font-extrabold shadow-sm ring-2 ring-blue-400 dark:ring-blue-600'
                          : isCurrentDay
                          ? 'border-2 border-blue-500 font-bold bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
                      )}
                      title={`${format(day, 'MMM d, yyyy')}: ${
                        dayGoals.length > 0
                          ? `${dayGoals.filter((g) => g.completed).length}/${dayGoals.length} goals done`
                          : dayActs.length > 0
                          ? `${dayActs.length} activities logged`
                          : 'No goals recorded'
                      }`}
                    >
                      <span className="text-xs leading-none">{format(day, 'd')}</span>

                      {/* Goal & Activity Indicator Dots */}
                      <div className="flex items-center gap-0.5 mt-1">
                        {allDone ? (
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                            )}
                          />
                        ) : hasPending && hasCompleted ? (
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-amber-200' : 'bg-amber-500'
                            )}
                          />
                        ) : hasPending ? (
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full border',
                              isSelected ? 'border-amber-200' : 'border-amber-500'
                            )}
                          />
                        ) : dayActs.length > 0 ? (
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected ? 'bg-white' : 'bg-blue-500'
                            )}
                          />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-3 mt-3 border-t border-border/50 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>All Goals Done</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Pending Goals</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Activity Logged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Past Active Dates Quick Jump */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold">Past Recorded Dates Archive</CardTitle>
              <CardDescription className="text-xs">
                Jump directly to any date with recorded study goals or history.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5 max-h-[280px] overflow-y-auto">
              {activeDates.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No dates recorded yet.</p>
              ) : (
                activeDates.map((dateStr) => {
                  const acts = activitiesByDate[dateStr]?.length || 0;
                  const goals = goalsByDate[dateStr]?.length || 0;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setCalendarMonth(parseISO(dateStr));
                      }}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all',
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
                      )}
                    >
                      <span className="font-mono">{dateStr}</span>
                      <div className="flex items-center gap-1.5">
                        {goals > 0 && (
                          <span
                            className={cn(
                              'text-[10px] font-mono px-2 py-0.5 rounded-full',
                              isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            )}
                          >
                            {goals} goals
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded-full',
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                          )}
                        >
                          {acts} logged
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
