import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
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
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { WeekStatus, TaskStatus, PriorityType, SectionType, StudyTask } from '../types';

export const WeeklyPlannerPage: React.FC = () => {
  const { weeklyPlans, updateWeeklyPlan, tasks, addTask, updateTask, deleteTask, stats } = useAppData();
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(stats.currentWeek);
  const [viewMode, setViewMode] = useState<'weekly' | 'calendar' | 'kanban' | 'table'>('weekly');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSection, setNewTaskSection] = useState<SectionType>('Quant');

  const selectedPlan = weeklyPlans.find((w) => w.weekNumber === selectedWeekNum) || weeklyPlans[0];
  const weekTasks = tasks.filter((t) => t.weeklyPlanId === selectedPlan.id || (!t.weeklyPlanId && selectedPlan.weekNumber === stats.currentWeek));

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

  const filteredPlans = weeklyPlans.filter((p) => {
    if (phaseFilter === 'all') return true;
    return p.phaseNumber === parseInt(phaseFilter, 10);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">52-Week Study Planner</h1>
            <Badge variant="purple" className="font-mono text-xs">
              Phase {selectedPlan.phaseNumber}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Chronological roadmap from Day 1 to CAT 2027. JIRA-style task management, Kanban sprint board, and buffer week tracking.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid grid-cols-4 h-9">
              <TabsTrigger value="weekly" className="text-xs gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="text-xs gap-1.5">
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="text-xs gap-1.5">
                <List className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Table</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* VIEW 1: WEEKLY DEEP-DIVE */}
      {viewMode === 'weekly' && (
        <div className="space-y-6">
          {/* Week Selector Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={selectedWeekNum <= 1}
                onClick={() => setSelectedWeekNum(selectedWeekNum - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-foreground">Week {selectedPlan.weekNumber}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  ({selectedPlan.startDate} to {selectedPlan.endDate})
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={selectedWeekNum >= 52}
                onClick={() => setSelectedWeekNum(selectedWeekNum + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {selectedPlan.isBufferWeek && (
                <Badge variant="warning" className="animate-pulse gap-1 text-[11px]">
                  <ShieldAlert className="h-3 w-3" />
                  Buffer Week (Catch-up)
                </Badge>
              )}

              {selectedPlan.weekNumber === stats.currentWeek && (
                <Badge variant="purple" className="text-[11px]">Active Week</Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
                onClick={() => setSelectedWeekNum(stats.currentWeek)}
              >
                Jump to Current
              </Button>

              <Select
                value={selectedPlan.status}
                onValueChange={(val: WeekStatus) => updateWeeklyPlan(selectedPlan.id, { status: val })}
              >
                <SelectTrigger className="h-8 text-xs w-[130px]">
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

          {/* Buffer Week Special Notice */}
          {selectedPlan.isBufferWeek && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-200 block text-sm">Designated Buffer Week</strong>
                <p className="mt-1 text-amber-300/90 leading-relaxed">
                  "Life happens. Use this week to catch up, not to rest. Re-solve every mistake question, finish pending problem sets, and review tough DILR sets."
                </p>
              </div>
            </div>
          )}

          {/* 3 Core Subject Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quant */}
            <Card className="border-t-4 border-t-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Quantitative Aptitude</span>
                  <Badge variant="quant">QA</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60">
                  {selectedPlan.quantPlan}
                </p>
              </CardContent>
            </Card>

            {/* DILR */}
            <Card className="border-t-4 border-t-emerald-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Data Interpretation & LR</span>
                  <Badge variant="dilr">DILR</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60">
                  {selectedPlan.dilrPlan}
                </p>
              </CardContent>
            </Card>

            {/* VARC */}
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Verbal Ability & RC</span>
                  <Badge variant="varc">VARC</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60">
                  {selectedPlan.varcPlan}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Milestones & Scheduled Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Scheduled Tests This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                {selectedPlan.testsPlanned ? (
                  <p className="p-3 rounded-lg bg-secondary/40 border border-border/70 text-foreground font-medium">
                    {selectedPlan.testsPlanned}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No formal tests scheduled for this week.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Milestone & Administrative Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                {selectedPlan.milestoneAdmin ? (
                  <p className="p-3 rounded-lg bg-secondary/40 border border-border/70 text-foreground font-medium">
                    {selectedPlan.milestoneAdmin}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No administrative milestones for this week.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Sprint Tasks for This Week */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Week {selectedPlan.weekNumber} Tasks & Daily Execution
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Target: {selectedPlan.hoursTarget} hrs • Break down this week's targets into actionable items.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task Creation Form */}
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <Input
                  placeholder="Add a new task for this week..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1"
                />
                <Select value={newTaskSection} onValueChange={(v) => setNewTaskSection(v as SectionType)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quant</SelectItem>
                    <SelectItem value="DILR">DILR</SelectItem>
                    <SelectItem value="VARC">VARC</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="purple" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </form>

              {/* Task List */}
              <div className="space-y-2">
                {weekTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                    No individual tasks logged for Week {selectedPlan.weekNumber} yet. Add tasks above!
                  </p>
                ) : (
                  weekTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-accent/40 transition-colors"
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
                        />
                        <div>
                          <p className={`text-xs font-medium ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                            <Badge variant={task.section === 'Quant' ? 'quant' : task.section === 'DILR' ? 'dilr' : 'varc'} className="text-[9px] px-1 py-0">
                              {task.section}
                            </Badge>
                            <span>{task.estimatedMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(val: TaskStatus) => updateTask(task.id, { status: val })}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-[110px]">
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
                          size="sm"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400 p-0"
                          onClick={() => deleteTask(task.id)}
                        >
                          ×
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

      {/* VIEW 2: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Sprint Task Management (Drag or click status to transition)</span>
            <Badge variant="outline" className="font-mono">
              Week {stats.currentWeek} Tasks
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['Not Started', 'In Progress', 'Review', 'Completed'] as TaskStatus[]).map((colStatus) => {
              const colTasks = tasks.filter((t) => t.status === colStatus);
              return (
                <div key={colStatus} className="flex flex-col rounded-xl border border-border/80 bg-muted/20 p-3 min-h-[400px]">
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/60">
                    <span className="text-xs font-bold text-foreground">{colStatus}</span>
                    <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">
                      {colTasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 flex-1">
                    {colTasks.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-[11px] text-muted-foreground/60 border border-dashed rounded-lg">
                        Empty
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-border/80 bg-card shadow-sm space-y-2 text-xs hover:border-purple-500/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-foreground leading-snug">{task.title}</span>
                            <Badge variant={task.priority === 'Urgent' ? 'destructive' : 'outline'} className="text-[9px] px-1 py-0">
                              {task.priority}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            <Badge variant={task.section === 'Quant' ? 'quant' : task.section === 'DILR' ? 'dilr' : 'varc'} className="text-[9px] px-1 py-0">
                              {task.section}
                            </Badge>
                            <span>{task.estimatedMinutes}m</span>
                          </div>

                          {/* Quick move buttons */}
                          <div className="flex gap-1 pt-1 justify-end">
                            {colStatus !== 'Not Started' && (
                              <button
                                onClick={() => updateTask(task.id, { status: 'Not Started' })}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                              >
                                ← To Do
                              </button>
                            )}
                            {colStatus !== 'In Progress' && (
                              <button
                                onClick={() => updateTask(task.id, { status: 'In Progress' })}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-300 font-semibold"
                              >
                                In Prog
                              </button>
                            )}
                            {colStatus !== 'Completed' && (
                              <button
                                onClick={() => updateTask(task.id, { status: 'Completed', completedAt: new Date().toISOString() })}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              >
                                Done ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">52-Week Chronological Calendar</CardTitle>
            <CardDescription className="text-xs">
              Phase roadmap mapped by week blocks. Click any week to open its detailed targets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {weeklyPlans.map((week) => {
                const isCurrent = week.weekNumber === stats.currentWeek;
                const isBuffer = week.isBufferWeek;
                return (
                  <button
                    key={week.id}
                    onClick={() => {
                      setSelectedWeekNum(week.weekNumber);
                      setViewMode('weekly');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-purple-500 bg-purple-500/15 shadow-md shadow-purple-500/20'
                        : isBuffer
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-border/70 bg-card hover:bg-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-mono font-bold text-foreground">W{week.weekNumber}</span>
                      <span className="text-[9px] text-muted-foreground">{week.monthLabel}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      Phase {week.phaseNumber}
                    </span>
                    {isBuffer && (
                      <span className="text-[9px] text-amber-400 font-semibold block mt-1">Buffer</span>
                    )}
                    {isCurrent && (
                      <span className="text-[9px] text-purple-700 dark:text-purple-300 font-bold block mt-1">Current</span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW 4: TABLE VIEW */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">52-Week Master Spreadsheet</CardTitle>
              <CardDescription className="text-xs">Full tabular roadmap with inline status controls.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter Phase:</span>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="1">Phase 1</SelectItem>
                  <SelectItem value="2">Phase 2</SelectItem>
                  <SelectItem value="3">Phase 3</SelectItem>
                  <SelectItem value="4">Phase 4</SelectItem>
                  <SelectItem value="5">Phase 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Wk</th>
                    <th className="py-2.5 px-3">Dates</th>
                    <th className="py-2.5 px-3">Phase</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Quant Plan</th>
                    <th className="py-2.5 px-3 min-w-[180px]">DILR</th>
                    <th className="py-2.5 px-3 min-w-[180px]">VARC</th>
                    <th className="py-2.5 px-3">Hrs</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        plan.weekNumber === stats.currentWeek ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold">{plan.weekNumber}</td>
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {plan.startDate.slice(5)} to {plan.endDate.slice(5)}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px]">
                          P{plan.phaseNumber}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground font-medium text-[11px]">{plan.quantPlan}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{plan.dilrPlan}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{plan.varcPlan}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">{plan.hoursTarget}</td>
                      <td className="py-2.5 px-3">
                        <Select
                          value={plan.status}
                          onValueChange={(val: WeekStatus) => updateWeeklyPlan(plan.id, { status: val })}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not started">Not started</SelectItem>
                            <SelectItem value="In progress">In progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="Catch-up needed">Catch-up</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
