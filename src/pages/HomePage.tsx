import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Calendar,
  Clock,
  Target,
  Trophy,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Bookmark,
  Check,
  Compass,
  FileText,
  BarChart2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import { StatCard } from '../components/ui/StatCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { EmptyState } from '../components/ui/EmptyState';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { QuickAddModal } from '../components/layout/QuickAddModal';
import { SectionType } from '../types';

export const HomePage: React.FC = () => {
  const {
    profile,
    stats,
    weeklyPlans,
    tasks,
    updateTask,
    topics,
    topicProgress,
    mockTests,
    mistakes,
    guideSections,
    dailyGoals,
    toggleDailyGoal,
    activities
  } = useAppData();

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'hours' | 'mocks' | 'confidence' | 'mistakes'>('hours');
  const [blueprintExpanded, setBlueprintExpanded] = useState(false);
  const navigate = useNavigate();

  // Active weekly plan
  const activePlan = weeklyPlans.find((p) => p.weekNumber === stats.currentWeek) || weeklyPlans[0];

  // Subject-wise statistics
  const quantTopics = topics.filter((t) => t.section === 'Quant');
  const dilrTopics = topics.filter((t) => t.section === 'DILR');
  const varcTopics = topics.filter((t) => t.section === 'VARC');

  const getSectionStats = (sectionTopics: typeof topics) => {
    let completed = 0;
    let confidenceSum = 0;
    const weakList: string[] = [];

    sectionTopics.forEach((t) => {
      const tp = topicProgress[t.id];
      if (tp) {
        if (tp.conceptDone && tp.practiceDone && tp.pyqsDone) completed++;
        confidenceSum += tp.confidence;
        if (tp.confidence <= 2) weakList.push(t.topicName);
      } else {
        confidenceSum += 1;
        weakList.push(t.topicName);
      }
    });

    const avgConfidence = sectionTopics.length > 0 ? (confidenceSum / sectionTopics.length).toFixed(1) : '1.0';
    return {
      total: sectionTopics.length,
      completed,
      pct: sectionTopics.length > 0 ? Math.round((completed / sectionTopics.length) * 100) : 0,
      avgConfidence,
      weakList: weakList.slice(0, 3)
    };
  };

  const quantStats = getSectionStats(quantTopics);
  const dilrStats = getSectionStats(dilrTopics);
  const varcStats = getSectionStats(varcTopics);

  // Confidence distribution
  const confidenceCounts = [0, 0, 0, 0, 0];
  Object.values(topicProgress).forEach((tp) => {
    if (tp.confidence >= 1 && tp.confidence <= 5) {
      confidenceCounts[tp.confidence - 1]++;
    }
  });

  const confidenceChartData = [
    { level: 'L1: Unfamiliar', count: confidenceCounts[0], fill: '#EF4444' },
    { level: 'L2: Weak', count: confidenceCounts[1], fill: '#F97316' },
    { level: 'L3: Average', count: confidenceCounts[2], fill: '#F59E0B' },
    { level: 'L4: Good', count: confidenceCounts[3], fill: '#10B981' },
    { level: 'L5: Strong', count: confidenceCounts[4], fill: '#2563EB' },
  ];

  // Mistake distribution
  const mistakeCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    mistakeCounts[m.mistakeType] = (mistakeCounts[m.mistakeType] || 0) + 1;
  });

  const mistakeChartData = Object.entries(mistakeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const MISTAKE_COLORS = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

  // Weekly study hours data
  const hoursData = weeklyPlans.slice(0, 12).map((w) => ({
    week: `W${w.weekNumber}`,
    target: parseInt(w.hoursTarget.split('–')[0], 10) || 14,
    logged: w.actualHoursLogged || (w.weekNumber < stats.currentWeek ? 12 : 0),
  }));

  // Mock scores progression
  const mockChartData = mockTests
    .filter((m) => !m.isSample && m.totalScore !== undefined)
    .map((m) => ({
      name: `M${m.mockNumber}`,
      Total: m.totalScore,
      VARC: m.varcScore,
      DILR: m.dilrScore,
      QA: m.qaScore,
    }));

  // Today's goals calculation
  const completedGoalsCount = dailyGoals.filter((g) => g.completed).length;
  const dailyGoalsPct = dailyGoals.length > 0 ? Math.round((completedGoalsCount / dailyGoals.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO COMMAND BANNER (Inspired by Cognify & Apple) */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-sm dark:border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Phase {stats.currentPhase.phaseNumber}: {stats.currentPhase.name}
              </span>
              <span className="text-xs font-mono text-blue-100">Week {stats.currentWeek} of 52</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {profile.displayName}
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Target Exam Date: 28 Nov 2027 • <strong className="text-white font-mono">{stats.daysRemaining} days</strong> remaining.
              Stay consistent: daily deliberate practice builds 99th percentile mastery.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xs gap-1.5 rounded-lg text-xs"
                onClick={() => navigate('/planner')}
              >
                <span>Continue Study Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-xs rounded-lg gap-1.5"
                onClick={() => setQuickAddOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Quick Log</span>
              </Button>
            </div>
          </div>

          {/* Progress Ring Card */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 self-start md:self-auto shrink-0">
            <CircularProgress
              value={stats.overallCompletionPct}
              size={84}
              strokeWidth={7}
              color="text-white"
              trackColor="text-white/20"
              label={`${stats.overallCompletionPct}%`}
              sublabel="Done"
            />
            <div className="flex flex-col text-xs space-y-1">
              <span className="text-blue-100 text-[11px] font-medium uppercase tracking-wider">Overall Syllabus</span>
              <span className="font-bold text-base text-white">{stats.completedTopics} of 53 Topics</span>
              <span className="text-[11px] text-blue-200">{stats.inProgressTopics} topics in active review</span>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. RESTRAINED KEY METRICS BAR (4 Clean StatCards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Weekly Target"
          value={activePlan.hoursTarget}
          subtitle={`Week ${stats.currentWeek} Sprint`}
          icon={<Clock className="h-4 w-4" />}
          badge={activePlan.isBufferWeek ? 'Buffer Week' : 'Core Phase'}
          badgeVariant="info"
          onClick={() => navigate('/planner')}
        />
        <StatCard
          title="Completed Topics"
          value={`${stats.completedTopics}/53`}
          subtitle={`${stats.inProgressTopics} in progress`}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          badge={`${Math.round((stats.completedTopics / 53) * 100)}%`}
          badgeVariant="success"
          onClick={() => navigate('/topics')}
        />
        <StatCard
          title="Mock Average"
          value={stats.totalMocksAttempted > 0 ? (stats.averageMockScore ?? '–') : '–'}
          subtitle={stats.totalMocksAttempted > 0 ? `${stats.totalMocksAttempted} tests logged` : 'No mocks yet'}
          icon={<Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          badge={stats.totalMocksAttempted > 0 ? `Best: ${stats.bestMockScore}` : 'Start Prep'}
          badgeVariant="warning"
          onClick={() => navigate('/mocks')}
        />
        <StatCard
          title="Revision Priority"
          value={stats.weakTopicsCount}
          subtitle={stats.overdueMistakesCount > 0 ? `${stats.overdueMistakesCount} mistakes overdue` : 'Topics with conf ≤ 2'}
          icon={<AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
          badge={stats.weakTopicsCount > 0 ? 'Action Needed' : 'On Track'}
          badgeVariant={stats.weakTopicsCount > 0 ? 'destructive' : 'success'}
          onClick={() => navigate('/mistakes')}
        />
      </div>

      {/* 3. MAIN DASHBOARD GRID: TODAY'S FOCUS & SUBJECT PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Study Plan & Daily Goals */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Today's Study Checklist</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active sprint tasks based on Week {stats.currentWeek} targets and spaced revision.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 rounded-lg border-border"
                  onClick={() => setQuickAddOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Task</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {tasks.length === 0 ? (
                <EmptyState
                  title="No active tasks today"
                  description="Your checklist is empty for today. Create your first task to start your study sprint!"
                  actionLabel="Add Study Task"
                  onAction={() => setQuickAddOpen(true)}
                />
              ) : (
                tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
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
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold ${
                            task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              task.section === 'Quant'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                : task.section === 'DILR'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                            }`}
                          >
                            {task.section}
                          </span>
                          <span>•</span>
                          <span>{task.estimatedMinutes} mins</span>
                          <span>•</span>
                          <span className={task.priority === 'High' ? 'text-rose-600 font-medium' : ''}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status !== 'Completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          onClick={() =>
                            updateTask(task.id, {
                              status: 'Completed',
                              completedAt: new Date().toISOString(),
                            })
                          }
                        >
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {tasks.length > 4 && (
                <div className="text-center pt-2">
                  <Link to="/planner" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    View all {tasks.length} tasks in Study Planner →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Goals Strip */}
          <Card className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-foreground">Today's Daily Goals ({completedGoalsCount}/{dailyGoals.length})</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">{dailyGoalsPct}% Achieved</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
              <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${dailyGoalsPct}%` }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleDailyGoal(goal.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    goal.completed
                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-border/70 bg-card hover:border-slate-300 text-foreground'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 border ${
                      goal.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {goal.completed && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <span className={`truncate flex-1 text-[11px] ${goal.completed ? 'line-through opacity-80' : ''}`}>
                    {goal.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Subject Mastery & Weak Areas */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold">Subject Mastery</CardTitle>
              <CardDescription className="text-xs">
                Syllabus completion & average student confidence (1 to 5).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Quant */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Quantitative Aptitude
                  </span>
                  <span className="font-mono font-bold text-foreground">{quantStats.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${quantStats.pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{quantStats.completed} / {quantStats.total} topics</span>
                  <span>Confidence: {quantStats.avgConfidence}/5.0</span>
                </div>
              </div>

              {/* DILR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    Data Interpretation & LR
                  </span>
                  <span className="font-mono font-bold text-foreground">{dilrStats.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${dilrStats.pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{dilrStats.completed} / {dilrStats.total} topics</span>
                  <span>Confidence: {dilrStats.avgConfidence}/5.0</span>
                </div>
              </div>

              {/* VARC */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-600" />
                    Verbal Ability & RC
                  </span>
                  <span className="font-mono font-bold text-foreground">{varcStats.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full transition-all duration-500" style={{ width: `${varcStats.pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{varcStats.completed} / {varcStats.total} topics</span>
                  <span>Confidence: {varcStats.avgConfidence}/5.0</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-lg border-border"
                  onClick={() => navigate('/topics')}
                >
                  Explore All Topics & Syllabi →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-2.5 flex flex-row items-center justify-between border-b border-border/60">
              <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
              <Link to="/history" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                View all →
              </Link>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5">
              {activities.slice(0, 3).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-[11px] leading-tight">{act.title}</span>
                    <span className="text-[10px] text-muted-foreground">{act.date} • {act.section || 'General'}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. ANALYTICS HUB WITH TABBED PROGRESSIVE DISCLOSURE (Decluttered!) */}
      <Card className="rounded-xl border border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <span>Performance Analytics & Visual Insights</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Toggle between views to inspect study volume, mock trajectories, and concept confidence.
            </CardDescription>
          </div>

          {/* Clean Segmented Control Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveChartTab('hours')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeChartTab === 'hours'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Study Hours
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('mocks')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeChartTab === 'mocks'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mock Scores
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('confidence')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeChartTab === 'confidence'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Confidence
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('mistakes')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeChartTab === 'mistakes'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mistakes
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {activeChartTab === 'hours' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Target vs Logged Study Hours (Weeks 1 to 12)</span>
                <span className="font-mono">Weekly Avg: 14 hrs</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#FFF'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="target" name="Target Hours" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="logged" name="Logged Hours" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChartTab === 'mocks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total & Sectional Score Progression Across Mocks</span>
                <span className="font-mono">{stats.totalMocksAttempted} Mocks Attempted</span>
              </div>
              <div className="h-64 w-full">
                {mockChartData.length === 0 ? (
                  <EmptyState
                    title="No mock test scores logged yet"
                    description="Log your first diagnostic or sectional test in the Mock Tracker to see your score trajectory."
                    actionLabel="Log a Mock Test"
                    onAction={() => navigate('/mocks')}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#FFF'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="Total" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="QA" stroke="#8B5CF6" strokeWidth={1.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="DILR" stroke="#10B981" strokeWidth={1.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="VARC" stroke="#F59E0B" strokeWidth={1.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {activeChartTab === 'confidence' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Distribution of Confidence Ratings Across 53 Canonical Topics</span>
                <span className="font-mono">5 Levels</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#FFF'
                      }}
                    />
                    <Bar dataKey="count" name="Topics" radius={[4, 4, 0, 0]}>
                      {confidenceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChartTab === 'mistakes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Root-Cause Categorization of Logged Errors</span>
                <span className="font-mono">{mistakes.length} Mistakes Recorded</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {mistakeChartData.length === 0 ? (
                  <EmptyState
                    title="No mistakes recorded yet"
                    description="Keep your error log updated after analyzing tests to fix blind spots."
                    actionLabel="Record Mistake"
                    onAction={() => navigate('/mistakes')}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mistakeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {mistakeChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={MISTAKE_COLORS[index % MISTAKE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#FFF'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. COLLAPSIBLE PREPARATION BLUEPRINT (PDF Content Preserved, Accessible without clutter) */}
      <Card className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div
          onClick={() => setBlueprintExpanded(!blueprintExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Your CAT 2027 Preparation Blueprint</h3>
              <p className="text-xs text-muted-foreground">
                Official strategic guidelines, section timing rules, and 90th percentile targets extracted from CAT Preparation.pdf.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
              <span>{blueprintExpanded ? 'Hide Blueprint' : 'Expand Blueprint'}</span>
              {blueprintExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {blueprintExpanded && (
          <div className="p-6 border-t border-border/70 space-y-6 bg-slate-50/30 dark:bg-slate-900/10">
            {guideSections.slice(0, 3).map((sec) => (
              <div key={sec.id} className="p-4 rounded-xl border border-border/70 bg-card">
                <h4 className="text-sm font-bold text-foreground mb-2">{sec.title}</h4>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <MarkdownRenderer content={sec.contentMarkdown} />
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-lg"
                onClick={() => navigate('/guide')}
              >
                Open Complete Preparation Guide Page →
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Global Quick Add Modal */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
};
