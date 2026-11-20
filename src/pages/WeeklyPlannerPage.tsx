import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useAppData } from '../context/AppDataContext';
import { getDailyScheduleFocus } from '../utils/studySchedule';
import {
  Calendar as CalendarIcon,
  Columns,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Flame,
  Check,
  Trash2,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { WeekStatus, TaskStatus, PriorityType, SectionType, StudyTask } from '../types';
import { cn } from '../lib/utils';

export const WeeklyPlannerPage: React.FC = () => {
  const {
    weeklyPlans,
    updateWeeklyPlan,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    stats,
    dailyGoals,
    todayGoals,
    addDailyGoal,
    addMultipleDailyGoals,
    toggleDailyGoal,
    deleteDailyGoal
  } = useAppData();

  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  const todaySchedule = useMemo(() => {
    return getDailyScheduleFocus(new Date(), stats.currentWeek);
  }, [stats.currentWeek]);

  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(stats.currentWeek);
  const [viewMode, setViewMode] = useState<'weekly' | 'calendar' | 'kanban' | 'table'>('weekly');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSection, setNewTaskSection] = useState<SectionType>('Quant');

  // New Daily Goal State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSection, setNewGoalSection] = useState<SectionType>(todaySchedule.alternatingSubject);
  const [newGoalMinutes, setNewGoalMinutes] = useState(45);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  const selectedPlan = weeklyPlans.find((w) => w.weekNumber === selectedWeekNum) || weeklyPlans[0];
  const weekTasks = tasks.filter(
    (t) => t.weeklyPlanId === selectedPlan.id || (!t.weeklyPlanId && selectedPlan.weekNumber === stats.currentWeek)
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      weeklyPlanId: selectedPlan.id,
      section: newTaskSection,
      status: 'In Progress',
      priority: 'Medium',
      estimatedMinutes: 60,
      actualMinutes: 0,
      isTodayFocus: true
    });
    setNewTaskTitle('');
  };

  const handleCreateDailyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addDailyGoal({
      date: todayDateStr,
      title: newGoalTitle.trim(),
      section: newGoalSection,
      targetMinutes: Number(newGoalMinutes) || 30,
      completed: false
    });
    setNewGoalTitle('');
    setIsGoalDialogOpen(false);
  };

  const filteredPlans = weeklyPlans.filter((p) => {
    if (phaseFilter === 'all') return true;
    return p.phaseNumber === parseInt(phaseFilter, 10);
  });

  const completedGoalsCount = todayGoals.filter((g) => g.completed).length;
  const dailyGoalsPct = todayGoals.length > 0 ? Math.round((completedGoalsCount / todayGoals.length) * 100) : 0;

  // Days of week for the 7-day grid view (Reference 2 style)
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const isOddWeek = selectedPlan.weekNumber % 2 !== 0;

  const getDailyAllocation = (idx: number) => {
    if (idx === 5) {
      return {
        badgeLabel: 'Revision',
        badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        title: 'Weekly Revision (Part 1)',
        description: 'Revise all topics, notes & formulas covered this week.'
      };
    }
    if (idx === 6) {
      return {
        badgeLabel: 'Review',
        badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        title: 'Weekly Revision (Part 2)',
        description: 'Audit Mistake Log, clear errors & weekly recap.'
      };
    }
    const isDiDay = isOddWeek ? idx % 2 === 0 : idx % 2 !== 0;
    if (isDiDay) {
      return {
        badgeLabel: 'DI Sets',
        badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
        title: 'VARC + DI',
        description: 'Daily RC/editorial + 2 Data Interpretation caselets.'
      };
    } else {
      return {
        badgeLabel: 'Quant',
        badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        title: 'VARC + QA',
        description: 'Daily RC/VA drills + Quant concept theory & drills.'
      };
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">52-Week Study Planner</h1>
            <Badge variant="blue" className="font-mono text-xs font-semibold">
              Phase {selectedPlan.phaseNumber}
            </Badge>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid grid-cols-4 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <TabsTrigger value="weekly" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sprint</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">7-Day Grid</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs gap-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                <List className="h-3.5 w-3.5" />
                <span className="hidden md:inline">52 Weeks</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 2. DEDICATED DAILY GOALS SECTION (User Request) */}
      <Card className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-card dark:to-blue-950/20 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Flame className="h-5 w-5 text-amber-300" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Today's Goals
              </h3>
              <RadixTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 cursor-help inline-flex items-center gap-1 hover:bg-blue-200/80 transition-colors"
                  >
                    <span>Today: {todaySchedule.primarySubjects}</span>
                    <Info className="h-3 w-3 opacity-60" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs p-2.5 leading-relaxed">
                  <p className="font-bold mb-0.5 text-blue-600 dark:text-blue-400">{todaySchedule.subjectTitle}</p>
                  <p className="text-foreground/90">{todaySchedule.description}</p>
                </TooltipContent>
              </RadixTooltip>
              {todayGoals.length > 0 && (
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {completedGoalsCount} of {todayGoals.length} Done ({dailyGoalsPct}%)
                </span>
              )}
            </div>
          </div>

          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Goal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Add Today's Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDailyGoal} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Goal Description</label>
                  <Input
                    placeholder="e.g., Solve 20 Quant Questions on Percentages"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Section</label>
                    <Select value={newGoalSection} onValueChange={(v) => setNewGoalSection(v as SectionType)}>
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
                    <label className="text-xs font-medium text-foreground">Target (Minutes)</label>
                    <Input
                      type="number"
                      min={10}
                      step={5}
                      value={newGoalMinutes}
                      onChange={(e) => setNewGoalMinutes(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsGoalDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Goal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Daily Goals Vertical List & Intake Prompt */}
        <div className="flex flex-col gap-2.5 pt-4">
          {todayGoals.length === 0 ? (
            <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-white/70 dark:bg-slate-900/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-foreground">
                    What are your targets for today?
                  </h4>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    ({todaySchedule.formattedDate})
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addMultipleDailyGoals(todaySchedule.suggestedGoals)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg h-8 px-3 shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>Add All Scheduled Targets</span>
                </Button>
              </div>

              {/* 1-Click Suggestions: Clean subject pills with explanations on hover */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                  Quick Add:
                </span>
                {todaySchedule.suggestedGoals.map((sg, idx) => {
                  const chipClass =
                    sg.section === 'Quant'
                      ? 'chip-quant'
                      : sg.section === 'DILR'
                      ? 'chip-dilr'
                      : sg.section === 'VARC'
                      ? 'chip-varc'
                      : 'chip-general';

                  return (
                    <RadixTooltip key={idx}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            addDailyGoal({
                              date: todayDateStr,
                              title: sg.title,
                              section: sg.section,
                              targetMinutes: sg.targetMinutes,
                              completed: false
                            })
                          }
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95',
                            chipClass
                          )}
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>{sg.shortTitle || sg.section}</span>
                          <span className="opacity-70 font-mono text-[10px] font-semibold">({sg.targetMinutes}m)</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs p-2.5 leading-relaxed">
                        <p className="font-semibold text-foreground">{sg.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Click to add target ({sg.targetMinutes}m in {sg.section})</p>
                      </TooltipContent>
                    </RadixTooltip>
                  );
                })}
              </div>
            </div>
          ) : (
            todayGoals.map((goal) => {
              const chipClass =
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
                  className={`group flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    goal.completed
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-border/80 bg-card hover:border-slate-300 text-foreground'
                  }`}
                >
                  <div
                    onClick={() => toggleDailyGoal(goal.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 border ${
                        goal.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {goal.completed && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 truncate">
                      <span className={`font-semibold truncate text-xs ${goal.completed ? 'line-through opacity-75' : ''}`}>
                        {goal.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${chipClass}`}>
                          {goal.section}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {goal.targetMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-600 shrink-0"
                    onClick={() => deleteDailyGoal(goal.id)}
                    title="Delete Goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* VIEW 1: SPRINT VIEW (Default) */}
      {viewMode === 'weekly' && (
        <div className="space-y-6">
          {/* Week Selector Bar (Responsive on Mobile) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={selectedWeekNum <= 1}
                onClick={() => setSelectedWeekNum(selectedWeekNum - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-1">
                <span className="font-mono font-bold text-sm text-foreground">Week {selectedPlan.weekNumber}</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedPlan.startDate} to {selectedPlan.endDate})
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={selectedWeekNum >= 52}
                onClick={() => setSelectedWeekNum(selectedWeekNum + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {selectedPlan.isBufferWeek && (
                <Badge variant="warning" className="animate-pulse gap-1 text-[11px]">
                  <ShieldAlert className="h-3 w-3" />
                  Buffer Week
                </Badge>
              )}

              {selectedPlan.weekNumber === stats.currentWeek && (
                <Badge variant="blue" className="text-[11px]">Active Week</Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                onClick={() => setSelectedWeekNum(stats.currentWeek)}
              >
                Jump to Current
              </Button>

              <Select
                value={selectedPlan.status}
                onValueChange={(val: WeekStatus) => updateWeeklyPlan(selectedPlan.id, { status: val })}
              >
                <SelectTrigger className="h-8 text-xs w-[130px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not started">Not started</SelectItem>
                  <SelectItem value="In progress">In progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Catch-up needed">Catch-up needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buffer Notice */}
          {selectedPlan.isBufferWeek && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong className="font-bold text-sm block">Designated Buffer Week (Catch-Up Sprint)</strong>
                <p className="mt-1 leading-relaxed opacity-90">
                  "Life happens. Use this week to catch up, not to rest. Re-solve mistake questions, finish pending problem sets, and review tough DILR sets."
                </p>
              </div>
            </div>
          )}

          {/* Alternating Schedule Distribution Banner */}
          <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/60 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-3">
              <Badge variant="blue" className="text-xs font-bold px-2.5 py-1">
                {isOddWeek ? 'Cycle A (Odd Week)' : 'Cycle B (Even Week)'}
              </Badge>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isOddWeek
                    ? 'Mon / Wed / Fri: DI Sets • Tue / Thu: Quantitative Aptitude'
                    : 'Mon / Wed / Fri: Quantitative Aptitude • Tue / Thu: DI Sets'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Daily VARC every day • Saturday & Sunday: Comprehensive Weekly Revision
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Weekend: Weekly Revision
              </span>
            </div>
          </div>

          {/* 3 Subject Targets (Clean Minimalist: explanations on hover) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <RadixTooltip>
              <TooltipTrigger asChild>
                <div className="rounded-2xl border border-border/80 border-t-4 border-t-blue-600 bg-card/90 p-4 shadow-xs transition-all hover:shadow-md hover:border-blue-400 cursor-help flex items-center justify-between group">
                  <span className="text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Quantitative Aptitude
                  </span>
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
                    <Badge variant="quant">QA</Badge>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-3 text-xs leading-relaxed">
                <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">QA Weekly Curriculum</p>
                <p className="text-foreground/90">{selectedPlan.quantPlan}</p>
              </TooltipContent>
            </RadixTooltip>

            <RadixTooltip>
              <TooltipTrigger asChild>
                <div className="rounded-2xl border border-border/80 border-t-4 border-t-emerald-600 bg-card/90 p-4 shadow-xs transition-all hover:shadow-md hover:border-emerald-400 cursor-help flex items-center justify-between group">
                  <span className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Data Interpretation & LR
                  </span>
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
                    <Badge variant="dilr">DILR</Badge>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-3 text-xs leading-relaxed">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">DILR Weekly Curriculum</p>
                <p className="text-foreground/90">{selectedPlan.dilrPlan}</p>
              </TooltipContent>
            </RadixTooltip>

            <RadixTooltip>
              <TooltipTrigger asChild>
                <div className="rounded-2xl border border-border/80 border-t-4 border-t-amber-600 bg-card/90 p-4 shadow-xs transition-all hover:shadow-md hover:border-amber-400 cursor-help flex items-center justify-between group">
                  <span className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Verbal Ability & RC
                  </span>
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
                    <Badge variant="varc">VARC</Badge>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm p-3 text-xs leading-relaxed">
                <p className="font-bold text-amber-600 dark:text-amber-400 mb-1">VARC Weekly Curriculum</p>
                <p className="text-foreground/90">{selectedPlan.varcPlan}</p>
              </TooltipContent>
            </RadixTooltip>
          </div>

          {/* Sprint Tasks for This Week */}
          <Card className="rounded-xl border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Week {selectedPlan.weekNumber} Tasks ({weekTasks.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Target: {selectedPlan.hoursTarget} hrs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <Input
                  placeholder="Add a new task for this week..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 text-xs rounded-lg"
                />
                <Select value={newTaskSection} onValueChange={(v) => setNewTaskSection(v as SectionType)}>
                  <SelectTrigger className="w-[110px] text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quant</SelectItem>
                    <SelectItem value="DILR">DILR</SelectItem>
                    <SelectItem value="VARC">VARC</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </form>

              <div className="space-y-2">
                {weekTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                    No individual tasks logged for Week {selectedPlan.weekNumber} yet. Add tasks above!
                  </p>
                ) : (
                  weekTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.status === 'Completed'}
                          onCheckedChange={(checked) =>
                            updateTask(task.id, {
                              status: checked ? 'Completed' : 'In Progress',
                              completedAt: checked ? new Date().toISOString() : undefined,
                            })
                          }
                          className="h-4 w-4 rounded"
                        />
                        <div>
                          <p className={`text-xs font-semibold ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            <span className="font-medium text-blue-600 dark:text-blue-400">{task.section}</span>
                            <span>•</span>
                            <span>{task.estimatedMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(val: TaskStatus) => updateTask(task.id, { status: val })}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-[110px] rounded-md">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 2: 7-DAY CALENDAR GRID (Reference 2 Inspired Notion Style) */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-foreground">
                Week {selectedPlan.weekNumber} Alternating Schedule:
              </span>
              <span className="text-muted-foreground">
                {isOddWeek
                  ? 'Cycle A (Mon/Wed/Fri DI • Tue/Thu QA)'
                  : 'Cycle B (Mon/Wed/Fri QA • Tue/Thu DI)'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
              <span className="font-bold text-amber-600 dark:text-amber-400">Daily VARC</span>
              <span>•</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">Sat & Sun Revision</span>
              <span>•</span>
              <span>Target: {selectedPlan.hoursTarget} hrs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysOfWeek.map((day, idx) => {
              const allocation = getDailyAllocation(idx);
              return (
                <div key={day} className="flex flex-col rounded-2xl glass-card p-3 shadow-xs min-h-[220px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <span className="text-xs font-bold text-foreground">{day.slice(0, 3)}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">Day {idx + 1}</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {idx < 5 ? 'Daily VARC' : 'Consolidation'}
                      </span>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border', allocation.badgeClass)}>
                        {allocation.badgeLabel}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-500/5 dark:bg-white/5 border border-border/40 text-[11px] leading-tight space-y-1">
                      <p className="font-bold text-foreground">{allocation.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-normal">{allocation.description}</p>
                    </div>

                    {weekTasks.filter((_, i) => i % 7 === idx).map((t) => (
                      <div key={t.id} className="p-1.5 rounded-lg bg-muted/60 text-[10px] text-foreground font-medium truncate">
                        ✓ {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: KANBAN BOARD (Linear Inspired) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['Not Started', 'In Progress', 'Review', 'Completed'] as TaskStatus[]).map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="flex flex-col rounded-2xl glass-regular p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground">{col}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full glass-thin text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {colTasks.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-6 italic">No tasks</p>
                  ) : (
                    colTasks.map((t) => (
                      <div key={t.id} className="p-2.5 rounded-xl glass-subtier text-xs space-y-1.5 shadow-2xs border border-white/40 dark:border-white/10">
                        <p className="font-medium text-foreground">{t.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="text-blue-600 font-semibold">{t.section}</span>
                          <span>{t.estimatedMinutes}m</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 4: 52-WEEK TABLE */}
      {viewMode === 'table' && (
        <div className="rounded-2xl sm:rounded-3xl glass-thick shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">All 52 Preparation Weeks</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter Phase:</span>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="h-8 text-xs w-[130px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases (1–5)</SelectItem>
                  <SelectItem value="1">Phase 1 (W1–12)</SelectItem>
                  <SelectItem value="2">Phase 2 (W13–24)</SelectItem>
                  <SelectItem value="3">Phase 3 (W25–36)</SelectItem>
                  <SelectItem value="4">Phase 4 (W37–44)</SelectItem>
                  <SelectItem value="5">Phase 5 (W45–52)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="glass-thin text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3">Week</th>
                  <th className="p-3">Phase</th>
                  <th className="p-3">Quant Target</th>
                  <th className="p-3">DILR Target</th>
                  <th className="p-3">VARC Target</th>
                  <th className="p-3">Hours</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    onClick={() => {
                      setSelectedWeekNum(plan.weekNumber);
                      setViewMode('weekly');
                    }}
                    className={`cursor-pointer hover:glass-thin transition-colors ${
                      plan.weekNumber === stats.currentWeek ? 'glass-thin font-medium' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold">
                      W{plan.weekNumber}
                      {plan.isBufferWeek && (
                        <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-500/10 px-1 py-0.2 rounded font-sans">
                          Buffer
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">P{plan.phaseNumber}</td>
                    <td className="p-3 max-w-[200px] truncate">{plan.quantPlan}</td>
                    <td className="p-3 max-w-[200px] truncate">{plan.dilrPlan}</td>
                    <td className="p-3 max-w-[200px] truncate">{plan.varcPlan}</td>
                    <td className="p-3 font-mono">{plan.hoursTarget}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold glass-thin text-muted-foreground">
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
