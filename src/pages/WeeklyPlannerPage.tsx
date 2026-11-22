import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { getDailyScheduleFocus, isTopicInWeek } from '../utils/studySchedule';
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
  Info,
  Edit2,
  BookOpen,
  Layers,
  ArrowUpRight,
  CheckSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import {
  WeekStatus,
  TaskStatus,
  PriorityType,
  SectionType,
  StudyTask,
  WeeklyPlanItem,
  TopicItem
} from '../types';
import { cn } from '../lib/utils';

export const WeeklyPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    weeklyPlans,
    updateWeeklyPlan,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    topics,
    updateTopic,
    addTopic,
    deleteTopic,
    topicProgress,
    stats,
    todayGoals,
    addDailyGoal,
    addMultipleDailyGoals,
    toggleDailyGoal,
    deleteDailyGoal,
    aeonHabit,
    markYesterdayAeonDone
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

  // Daily Goal State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSection, setNewGoalSection] = useState<SectionType>(todaySchedule.alternatingSubject);
  const [newGoalMinutes, setNewGoalMinutes] = useState(45);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);

  // Edit Week Plan Modal State
  const [editingWeekPlan, setEditingWeekPlan] = useState<WeeklyPlanItem | null>(null);
  const [editQuantPlan, setEditQuantPlan] = useState('');
  const [editDilrPlan, setEditDilrPlan] = useState('');
  const [editVarcPlan, setEditVarcPlan] = useState('');
  const [editTestsPlanned, setEditTestsPlanned] = useState('');
  const [editMilestoneAdmin, setEditMilestoneAdmin] = useState('');
  const [editHoursTarget, setEditHoursTarget] = useState('');
  const [editStatus, setEditStatus] = useState<WeekStatus>('Not started');
  const [editIsBufferWeek, setEditIsBufferWeek] = useState(false);
  const [editMyNotes, setEditMyNotes] = useState('');

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskSection, setEditTaskSection] = useState<SectionType>('Quant');
  const [editTaskPriority, setEditTaskPriority] = useState<PriorityType>('Medium');
  const [editTaskEstimatedMinutes, setEditTaskEstimatedMinutes] = useState(60);
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>('In Progress');
  const [editTaskIsTodayFocus, setEditTaskIsTodayFocus] = useState(false);

  // Add Task Modal State (e.g., from Kanban column)
  const [isKanbanAddOpen, setIsKanbanAddOpen] = useState(false);
  const [kanbanTargetStatus, setKanbanTargetStatus] = useState<TaskStatus>('Not Started');
  const [kanbanTaskTitle, setKanbanTaskTitle] = useState('');
  const [kanbanTaskSection, setKanbanTaskSection] = useState<SectionType>('Quant');
  const [kanbanTaskMinutes, setKanbanTaskMinutes] = useState(60);

  // Topic Edit/Add Modal State (accessible from Weekly Planner)
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicSection, setEditTopicSection] = useState<SectionType>('Quant');
  const [editTopicArea, setEditTopicArea] = useState('');
  const [editTopicSubtopics, setEditTopicSubtopics] = useState('');
  const [editTopicPlanWeek, setEditTopicPlanWeek] = useState('1');

  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSection, setNewTopicSection] = useState<SectionType>('Quant');
  const [newTopicArea, setNewTopicArea] = useState('Arithmetic');
  const [newTopicSubtopics, setNewTopicSubtopics] = useState('');
  const [newTopicPlanWeek, setNewTopicPlanWeek] = useState(String(selectedWeekNum));

  const selectedPlan = weeklyPlans.find((w) => w.weekNumber === selectedWeekNum) || weeklyPlans[0];
  const weekTasks = tasks.filter(
    (t) => t.weeklyPlanId === selectedPlan.id || (!t.weeklyPlanId && selectedPlan.weekNumber === stats.currentWeek)
  );

  // Dynamic syllabus topics assigned to this week based on planWeek
  const assignedTopics = useMemo(() => {
    return topics.filter((t) => isTopicInWeek(t.planWeek, selectedPlan.weekNumber));
  }, [topics, selectedPlan.weekNumber]);

  // Handle opening the Edit Week Plan dialog
  const handleOpenEditWeekPlan = (plan: WeeklyPlanItem) => {
    setEditingWeekPlan(plan);
    setEditQuantPlan(plan.quantPlan || '');
    setEditDilrPlan(plan.dilrPlan || '');
    setEditVarcPlan(plan.varcPlan || '');
    setEditTestsPlanned(plan.testsPlanned || '');
    setEditMilestoneAdmin(plan.milestoneAdmin || '');
    setEditHoursTarget(plan.hoursTarget || '20-25 hrs');
    setEditStatus(plan.status);
    setEditIsBufferWeek(Boolean(plan.isBufferWeek));
    setEditMyNotes(plan.myNotes || '');
  };

  const handleSaveWeekPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeekPlan) return;
    updateWeeklyPlan(editingWeekPlan.id, {
      quantPlan: editQuantPlan.trim(),
      dilrPlan: editDilrPlan.trim(),
      varcPlan: editVarcPlan.trim(),
      testsPlanned: editTestsPlanned.trim(),
      milestoneAdmin: editMilestoneAdmin.trim(),
      hoursTarget: editHoursTarget.trim(),
      status: editStatus,
      isBufferWeek: editIsBufferWeek,
      myNotes: editMyNotes.trim()
    });
    setEditingWeekPlan(null);
  };

  // Helper to auto-fill week strategy text from assigned topics
  const handleAutoFillFromAssignedTopics = () => {
    const qTopics = assignedTopics.filter((t) => t.section === 'Quant').map((t) => t.topicName);
    const dTopics = assignedTopics.filter((t) => t.section === 'DILR').map((t) => t.topicName);
    const vTopics = assignedTopics.filter((t) => t.section === 'VARC').map((t) => t.topicName);

    if (qTopics.length > 0) {
      setEditQuantPlan(`Master ${qTopics.join(', ')}: Concepts, theory & 50+ practice problem drills.`);
    }
    if (dTopics.length > 0) {
      setEditDilrPlan(`${dTopics.join(', ')}: Solve 15+ comprehensive caselets & past year CAT sets.`);
    }
    if (vTopics.length > 0) {
      setEditVarcPlan(`${vTopics.join(', ')}: Daily editorial reading & timed verbal ability drills.`);
    }
  };

  // Handle task editing
  const handleOpenEditTask = (task: StudyTask) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || '');
    setEditTaskSection(task.section);
    setEditTaskPriority(task.priority);
    setEditTaskEstimatedMinutes(task.estimatedMinutes);
    setEditTaskStatus(task.status);
    setEditTaskIsTodayFocus(Boolean(task.isTodayFocus));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim()) return;
    updateTask(editingTask.id, {
      title: editTaskTitle.trim(),
      description: editTaskDescription.trim() || undefined,
      section: editTaskSection,
      priority: editTaskPriority,
      estimatedMinutes: Number(editTaskEstimatedMinutes) || 30,
      status: editTaskStatus,
      isTodayFocus: editTaskIsTodayFocus,
      completedAt: editTaskStatus === 'Completed' ? new Date().toISOString() : undefined
    });
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    deleteTask(editingTask.id);
    setEditingTask(null);
  };

  // Task creation
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

  const handleCreateKanbanTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kanbanTaskTitle.trim()) return;
    addTask({
      title: kanbanTaskTitle.trim(),
      weeklyPlanId: selectedPlan.id,
      section: kanbanTaskSection,
      status: kanbanTargetStatus,
      priority: 'Medium',
      estimatedMinutes: Number(kanbanTaskMinutes) || 45,
      actualMinutes: 0,
      isTodayFocus: true
    });
    setKanbanTaskTitle('');
    setIsKanbanAddOpen(false);
  };

  // Topic creation & editing
  const handleOpenEditTopic = (t: TopicItem) => {
    setEditingTopic(t);
    setEditTopicName(t.topicName);
    setEditTopicSection(t.section);
    setEditTopicArea(t.area);
    setEditTopicSubtopics(t.subtopics || '');
    setEditTopicPlanWeek(t.planWeek || '1');
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    updateTopic(editingTopic.id, {
      topicName: editTopicName.trim(),
      section: editTopicSection,
      area: editTopicArea.trim() || 'General',
      subtopics: editTopicSubtopics.trim(),
      planWeek: editTopicPlanWeek.trim() || '1'
    });
    setEditingTopic(null);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic({
      topicName: newTopicName.trim(),
      section: newTopicSection,
      area: newTopicArea.trim() || 'General',
      subtopics: newTopicSubtopics.trim(),
      planWeek: newTopicPlanWeek.trim() || String(selectedPlan.weekNumber),
      sortOrder: topics.length + 1
    });
    setNewTopicName('');
    setNewTopicSubtopics('');
    setIsAddTopicOpen(false);
  };

  // Quick 1-click helpers from assigned topics to tasks / daily goals
  const handleAddTopicAsTask = (topic: TopicItem) => {
    addTask({
      title: `${topic.section}: Study ${topic.topicName}`,
      description: topic.subtopics || `Focus on ${topic.area}`,
      section: topic.section,
      weeklyPlanId: selectedPlan.id,
      status: 'In Progress',
      priority: 'Medium',
      estimatedMinutes: 60,
      actualMinutes: 0,
      isTodayFocus: true
    });
  };

  const handleAddAllAssignedTopicsAsTasks = () => {
    assignedTopics.forEach((t) => {
      addTask({
        title: `${t.section}: Study ${t.topicName}`,
        description: t.subtopics || `Focus on ${t.area}`,
        section: t.section,
        weeklyPlanId: selectedPlan.id,
        status: 'In Progress',
        priority: 'Medium',
        estimatedMinutes: 60,
        actualMinutes: 0,
        isTodayFocus: true
      });
    });
  };

  const handleAddTopicAsDailyGoal = (topic: TopicItem) => {
    addDailyGoal({
      date: todayDateStr,
      title: `${topic.section}: ${topic.topicName} drills`,
      section: topic.section,
      targetMinutes: 45,
      completed: false
    });
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

  // Days of week for the 7-day grid view
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
    const isDiDay = isOddWeek ? idx % 2 !== 0 : idx % 2 === 0;
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
          <p className="text-xs text-muted-foreground mt-1">
            Full editing access: customize week strategies, syllabus distribution, tasks, and today's goals.
          </p>
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

      {/* 2. DEDICATED TODAY'S GOALS SECTION */}
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
              <button
                type="button"
                onClick={() => navigate('/practice')}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 cursor-pointer hover:bg-amber-200/80 transition-colors"
                title={`Active reading streak: ${aeonHabit.streak} days. Click to view reading tracker.`}
              >
                <Flame className="h-3 w-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span>{aeonHabit.streak}d Streak</span>
              </button>
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

          <div className="flex items-center gap-2">
            {!aeonHabit.isYesterdayDone && (
              <Button
                size="sm"
                onClick={() => markYesterdayAeonDone()}
                className="h-8 gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs animate-pulse cursor-pointer"
                title="Forgot yesterday's Aeon essay? Mark done to save your streak!"
              >
                <Flame className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                <span className="hidden sm:inline">Save Yesterday's Streak</span>
                <span className="sm:hidden">Save Streak</span>
              </Button>
            )}

            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer">
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

              {/* Quick Add Pills */}
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
          {/* Week Selector Bar with Edit Strategy Button */}
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

              {/* Edit Week Strategy Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditWeekPlan(selectedPlan)}
                className="h-8 text-xs font-semibold gap-1.5 border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="Edit 52-Week Strategy for this week"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Strategy</span>
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
                    ? 'Mon / Wed / Fri: Quantitative Aptitude • Tue / Thu: DI Sets'
                    : 'Mon / Wed / Fri: DI Sets • Tue / Thu: Quantitative Aptitude'}
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

          {/* 3 Subject Targets (Hover for details, or click Edit Strategy above to customize) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <RadixTooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => handleOpenEditWeekPlan(selectedPlan)}
                  className="rounded-2xl border border-border/80 border-t-4 border-t-blue-600 bg-card/90 p-4 shadow-xs transition-all hover:shadow-md hover:border-blue-400 cursor-pointer flex items-center justify-between group"
                >
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
                <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">QA Weekly Curriculum (Click to Edit)</p>
                <p className="text-foreground/90">{selectedPlan.quantPlan}</p>
              </TooltipContent>
            </RadixTooltip>

            <RadixTooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => handleOpenEditWeekPlan(selectedPlan)}
                  className="rounded-2xl border border-border/80 border-t-4 border-t-emerald-600 bg-card/90 p-4 shadow-xs transition-all hover:shadow-md hover:border-emerald-400 cursor-pointer flex items-center justify-between group"
                >
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
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">DILR Weekly Curriculum (Click to Edit)</p>
                <p className="text-foreground/90">{selectedPlan.dilrPlan}</p>
              </TooltipContent>
            </RadixTooltip>

            <RadixTooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => handleOpenEditWeekPlan(selectedPlan)}
                  className="rounded-2xl border border-border/80 border-t-4 border-t-amber-600 bg-card/90 p-4 shadow-xs transition-all hover:shadow-md hover:border-amber-400 cursor-pointer flex items-center justify-between group"
                >
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
                <p className="font-bold text-amber-600 dark:text-amber-400 mb-1">VARC Weekly Curriculum (Click to Edit)</p>
                <p className="text-foreground/90">{selectedPlan.varcPlan}</p>
              </TooltipContent>
            </RadixTooltip>
          </div>

          {/* 4. DYNAMIC ASSIGNED SYLLABUS TOPICS CARD (User Request) */}
          <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-sm font-bold text-foreground">
                    Assigned Syllabus Topics for Week {selectedPlan.weekNumber} ({assignedTopics.length})
                  </CardTitle>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    Distribution: W{selectedPlan.weekNumber}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {assignedTopics.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddAllAssignedTopicsAsTasks}
                      className="h-7 text-xs font-semibold gap-1 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Add All as Week Tasks</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewTopicPlanWeek(String(selectedPlan.weekNumber));
                      setIsAddTopicOpen(true);
                    }}
                    className="h-7 text-xs font-semibold gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+ Add Topic to this Week</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/plan?tab=topics')}
                    className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
                  >
                    <span>Manage All Topics</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs">
                These topics are automatically assigned to this week based on each topic's weekly distribution. You can edit any topic or reassign its week below.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {assignedTopics.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    No syllabus topics specifically assigned to Week {selectedPlan.weekNumber}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {selectedPlan.isBufferWeek
                      ? 'This is a designated Buffer / Catch-up week. Use it to consolidate mistake problems and review past topics.'
                      : 'You can assign topics to this week by adding a new topic or editing the weekly distribution of existing topics.'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewTopicPlanWeek(String(selectedPlan.weekNumber));
                      setIsAddTopicOpen(true);
                    }}
                    className="h-7 text-xs font-semibold mt-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Assign a Topic to Week {selectedPlan.weekNumber}
                  </Button>
                </div>
              ) : (
                assignedTopics.map((topic) => {
                  const tp = topicProgress[topic.id];
                  const chipClass =
                    topic.section === 'Quant'
                      ? 'chip-quant'
                      : topic.section === 'DILR'
                      ? 'chip-dilr'
                      : 'chip-varc';

                  return (
                    <div
                      key={topic.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${chipClass}`}>
                          {topic.section}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">{topic.topicName}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">({topic.area})</span>
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.2 rounded">
                              W{topic.planWeek}
                            </span>
                          </div>
                          {topic.subtopics && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {topic.subtopics}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick 1-Click Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTopicAsTask(topic)}
                          className="h-7 text-[11px] font-semibold gap-1 text-slate-700 dark:text-slate-300"
                          title="Add as sprint task for this week"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Week Task</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTopicAsDailyGoal(topic)}
                          className="h-7 text-[11px] font-semibold gap-1 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                          title="Add as today's daily goal"
                        >
                          <Flame className="h-3 w-3 text-amber-500" />
                          <span>+ Today's Goal</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditTopic(topic)}
                          className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                          title="Edit Topic & Weekly Distribution"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* 5. Sprint Tasks for This Week */}
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
                    No individual tasks logged for Week {selectedPlan.weekNumber} yet. Add tasks above or use the "+ Week Task" buttons from assigned topics!
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
                            {task.priority && (
                              <>
                                <span>•</span>
                                <span className={task.priority === 'High' ? 'text-rose-600 font-semibold' : ''}>
                                  {task.priority}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                          onClick={() => handleOpenEditTask(task)}
                          title="Edit Task Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
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
                          title="Delete Task"
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

      {/* VIEW 2: 7-DAY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-foreground">
                Week {selectedPlan.weekNumber} Alternating Schedule:
              </span>
              <span className="text-muted-foreground">
                {isOddWeek
                  ? 'Cycle A (Mon/Wed/Fri QA • Tue/Thu DI)'
                  : 'Cycle B (Mon/Wed/Fri DI • Tue/Thu QA)'}
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
              const dayTasks = weekTasks.filter((_, i) => i % 7 === idx);

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

                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenEditTask(t)}
                        className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-[10px] text-foreground font-medium truncate cursor-pointer transition-colors"
                        title={`${t.title} (Click to edit)`}
                      >
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

      {/* VIEW 3: KANBAN BOARD with Add Task & Edit Task */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['Not Started', 'In Progress', 'Review', 'Completed'] as TaskStatus[]).map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="flex flex-col rounded-2xl glass-regular p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">{col}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full glass-thin text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-blue-600"
                    onClick={() => {
                      setKanbanTargetStatus(col);
                      setIsKanbanAddOpen(true);
                    }}
                    title={`Add new task to ${col}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-2 flex-1">
                  {colTasks.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-6 italic">No tasks</p>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenEditTask(t)}
                        className="p-2.5 rounded-xl glass-subtier text-xs space-y-1.5 shadow-2xs border border-white/40 dark:border-white/10 hover:border-blue-400 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-medium text-foreground group-hover:text-blue-600 transition-colors">
                            {t.title}
                          </p>
                          <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
                        </div>
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

      {/* VIEW 4: 52-WEEK TABLE with Direct Edit Column */}
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
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`hover:glass-thin transition-colors ${
                      plan.weekNumber === stats.currentWeek ? 'glass-thin font-medium' : ''
                    }`}
                  >
                    <td
                      onClick={() => {
                        setSelectedWeekNum(plan.weekNumber);
                        setViewMode('weekly');
                      }}
                      className="p-3 font-mono font-bold cursor-pointer"
                    >
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
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditWeekPlan(plan);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                        title={`Edit Week ${plan.weekNumber} Strategy`}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT WEEK PREPARATION STRATEGY */}
      {editingWeekPlan && (
        <Dialog open={Boolean(editingWeekPlan)} onOpenChange={(open) => !open && setEditingWeekPlan(null)}>
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>Edit Week {editingWeekPlan.weekNumber} Strategy</span>
                <Badge variant="blue" className="text-xs font-mono">
                  {editingWeekPlan.startDate} to {editingWeekPlan.endDate}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveWeekPlan} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Week Status</label>
                  <Select value={editStatus} onValueChange={(val: WeekStatus) => setEditStatus(val)}>
                    <SelectTrigger className="text-xs">
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Weekly Target Hours</label>
                  <Input
                    value={editHoursTarget}
                    onChange={(e) => setEditHoursTarget(e.target.value)}
                    placeholder="e.g. 20-25 hrs"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-slate-50/50 dark:bg-slate-900/40">
                <Checkbox
                  id="buffer-week-chk"
                  checked={editIsBufferWeek}
                  onCheckedChange={(c) => setEditIsBufferWeek(Boolean(c))}
                />
                <label htmlFor="buffer-week-chk" className="text-xs font-medium text-foreground cursor-pointer">
                  Designated Buffer / Catch-up Week (revisiting mistakes, zero new theory)
                </label>
              </div>

              {/* Auto-Fill Button */}
              {assignedTopics.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                    {assignedTopics.length} syllabus topics assigned to Week {editingWeekPlan.weekNumber}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleAutoFillFromAssignedTopics}
                    className="h-6 text-[10px] text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100"
                  >
                    Auto-Fill Strategy
                  </Button>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-blue-600 dark:text-blue-400 font-bold">
                  Quantitative Aptitude (QA) Curriculum & Target
                </label>
                <textarea
                  value={editQuantPlan}
                  onChange={(e) => setEditQuantPlan(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground"
                  placeholder="e.g. Master Percentages & Profit/Loss: 50 problem drills"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-bold">
                  DILR Curriculum & Target
                </label>
                <textarea
                  value={editDilrPlan}
                  onChange={(e) => setEditDilrPlan(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground"
                  placeholder="e.g. Tables and Caselets: 15 untimed and timed problem sets"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-amber-600 dark:text-amber-400 font-bold">
                  VARC Curriculum & Target
                </label>
                <textarea
                  value={editVarcPlan}
                  onChange={(e) => setEditVarcPlan(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground"
                  placeholder="e.g. Daily Editorial reading & 2 RC passage drills"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Sectional / Mock Tests</label>
                  <Input
                    value={editTestsPlanned}
                    onChange={(e) => setEditTestsPlanned(e.target.value)}
                    placeholder="e.g. 1 QA Sectional Test"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Milestone / Focus</label>
                  <Input
                    value={editMilestoneAdmin}
                    onChange={(e) => setEditMilestoneAdmin(e.target.value)}
                    placeholder="e.g. Arithmetic Mastery Milestone"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Personal Strategy Notes</label>
                <textarea
                  value={editMyNotes}
                  onChange={(e) => setEditMyNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground"
                  placeholder="Personal reflections, weak spots to avoid, key formulas to test..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingWeekPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Strategy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 2: EDIT TASK DETAILS */}
      {editingTask && (
        <Dialog open={Boolean(editingTask)} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Edit Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveTask} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Task Title</label>
                <Input
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  required
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Description / Notes</label>
                <Input
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  placeholder="Subtopics, problem sets, or link references"
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Section</label>
                  <Select value={editTaskSection} onValueChange={(v) => setEditTaskSection(v as SectionType)}>
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Status</label>
                  <Select value={editTaskStatus} onValueChange={(v) => setEditTaskStatus(v as TaskStatus)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Priority</label>
                  <Select value={editTaskPriority} onValueChange={(v) => setEditTaskPriority(v as PriorityType)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Estimated Minutes</label>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    value={editTaskEstimatedMinutes}
                    onChange={(e) => setEditTaskEstimatedMinutes(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteTask}
                  className="text-xs gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Task</span>
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingTask(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Save Task
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: ADD TASK TO KANBAN COLUMN */}
      <Dialog open={isKanbanAddOpen} onOpenChange={setIsKanbanAddOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Add Task to <span className="text-blue-600">{kanbanTargetStatus}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateKanbanTask} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Task Title</label>
              <Input
                placeholder="e.g. Practice 20 Permutations and Combinations Questions"
                value={kanbanTaskTitle}
                onChange={(e) => setKanbanTaskTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Section</label>
                <Select value={kanbanTaskSection} onValueChange={(v) => setKanbanTaskSection(v as SectionType)}>
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
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Estimated Minutes</label>
                <Input
                  type="number"
                  min={10}
                  step={5}
                  value={kanbanTaskMinutes}
                  onChange={(e) => setKanbanTaskMinutes(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsKanbanAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Add Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: EDIT TOPIC & WEEKLY DISTRIBUTION (Accessible from Weekly Planner) */}
      {editingTopic && (
        <Dialog open={Boolean(editingTopic)} onOpenChange={(open) => !open && setEditingTopic(null)}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Edit Topic & Weekly Distribution
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEditTopic} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Topic Name</label>
                <Input
                  value={editTopicName}
                  onChange={(e) => setEditTopicName(e.target.value)}
                  required
                  className="text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Section</label>
                  <Select value={editTopicSection} onValueChange={(v) => setEditTopicSection(v as SectionType)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quant">Quant</SelectItem>
                      <SelectItem value="DILR">DILR</SelectItem>
                      <SelectItem value="VARC">VARC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Area</label>
                  <Input
                    value={editTopicArea}
                    onChange={(e) => setEditTopicArea(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Granular Subtopics</label>
                <Input
                  value={editTopicSubtopics}
                  onChange={(e) => setEditTopicSubtopics(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Assigned Week in 52-Week Strategy
                </label>
                <Input
                  value={editTopicPlanWeek}
                  onChange={(e) => setEditTopicPlanWeek(e.target.value)}
                  placeholder="e.g. 1, 2-3, 14"
                  required
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Changing this updates which week in the Weekly Planner displays this topic!
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingTopic(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 5: ADD TOPIC (Accessible from Weekly Planner) */}
      <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Add Syllabus Topic to Week {selectedPlan.weekNumber}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTopic} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Topic Name</label>
              <Input
                placeholder="e.g. Permutations & Combinations"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Section</label>
                <Select value={newTopicSection} onValueChange={(v) => setNewTopicSection(v as SectionType)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quant</SelectItem>
                    <SelectItem value="DILR">DILR</SelectItem>
                    <SelectItem value="VARC">VARC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Area</label>
                <Input
                  placeholder="e.g. Modern Math"
                  value={newTopicArea}
                  onChange={(e) => setNewTopicArea(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Granular Subtopics</label>
              <Input
                placeholder="e.g. Fundamental principle of counting, circular arrangements"
                value={newTopicSubtopics}
                onChange={(e) => setNewTopicSubtopics(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Assigned Week (Distribution)</label>
              <Input
                value={newTopicPlanWeek}
                onChange={(e) => setNewTopicPlanWeek(e.target.value)}
                required
                className="text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTopicOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Add to Syllabus
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyPlannerPage;
