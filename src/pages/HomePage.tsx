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
  Bookmark
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
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
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { QuickAddModal } from '../components/layout/QuickAddModal';
import { SectionType } from '../types';

export const HomePage: React.FC = () => {
  const { stats, weeklyPlans, tasks, updateTask, topics, topicProgress, mockTests, mistakes, guideSections } = useAppData();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [blueprintExpanded, setBlueprintExpanded] = useState(true);
  const navigate = useNavigate();

  // Active weekly plan
  const activePlan = weeklyPlans.find((p) => p.weekNumber === stats.currentWeek) || weeklyPlans[0];

  // Subject-wise progress counts
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

  // Confidence distribution for chart
  const confidenceCounts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5
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
    { level: 'L5: Strong', count: confidenceCounts[4], fill: '#0EA5E9' },
  ];

  // Mistake category distribution
  const mistakeCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    mistakeCounts[m.mistakeType] = (mistakeCounts[m.mistakeType] || 0) + 1;
  });

  const mistakeChartData = Object.entries(mistakeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const MISTAKE_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#EC4899'];

  // Radar Subject Comparison Data
  const radarData = [
    { subject: 'Quant (Math)', score: quantStats.pct, fullMark: 100 },
    { subject: 'DILR (Logic & Data)', score: dilrStats.pct, fullMark: 100 },
    { subject: 'VARC (Verbal & RC)', score: varcStats.pct, fullMark: 100 },
  ];

  // Weekly study hours comparison (sampled across phases)
  const hoursData = weeklyPlans.slice(0, 16).map((w) => ({
    week: `W${w.weekNumber}`,
    target: parseInt(w.hoursTarget.split('–')[0], 10) || 12,
    logged: w.actualHoursLogged || (w.weekNumber < stats.currentWeek ? 10 : 0),
  }));

  // Mock score trajectory
  const mockChartData = mockTests
    .filter((m) => !m.isSample && m.totalScore !== undefined)
    .map((m) => ({
      name: `M${m.mockNumber}`,
      Total: m.totalScore,
      VARC: m.varcScore,
      DILR: m.dilrScore,
      QA: m.qaScore,
    }));

  return (
    <div className="space-y-6 pb-12">
      {/* SECTION A: PREPARATION OVERVIEW HERO BAR */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-950/20 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Progress Ring & Main Metrics */}
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-secondary stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500 stroke-current transition-all duration-1000 ease-out"
                  strokeDasharray={`${stats.overallCompletionPct}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-mono text-base font-extrabold text-foreground tracking-tight">
                  {stats.overallCompletionPct}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Done</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-purple-600 p-0.5 shadow-xs">
                  <img src="/logo.png" alt="CAT 2027 HQ Logo" className="h-full w-full object-contain brightness-0 invert" />
                </div>
                <Badge variant="purple" className="font-mono text-[10px] uppercase font-bold">
                  Phase {stats.currentPhase.phaseNumber}: {stats.currentPhase.name}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Week {stats.currentWeek} / 52
                </Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                CAT 2027 Command Centre
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target Date: 28 Nov 2027 • <strong className="text-purple-700 dark:text-purple-400 font-mono">{stats.daysRemaining} days</strong> remaining
              </p>
            </div>
          </div>

          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-border/70 bg-background/50">
              <span className="text-[11px] text-muted-foreground font-medium block">Completed Topics</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-emerald-400">{stats.completedTopics}</span>
                <span className="text-xs text-muted-foreground font-mono">/ 53</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-background/50">
              <span className="text-[11px] text-muted-foreground font-medium block">In Progress</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-amber-400">{stats.inProgressTopics}</span>
                <span className="text-xs text-muted-foreground font-mono">topics</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-background/50">
              <span className="text-[11px] text-muted-foreground font-medium block">Revision Priority</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-red-400">{stats.weakTopicsCount}</span>
                <span className="text-xs text-muted-foreground font-mono">conf ≤ 2</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-background/50">
              <span className="text-[11px] text-muted-foreground font-medium block">Mock Score Trend</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold font-mono text-purple-400">
                  {stats.totalMocksAttempted > 0 ? stats.latestMockScore : '–'}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {stats.totalMocksAttempted > 0 ? `(Avg ${stats.averageMockScore})` : '0 mocks'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B & C: TODAY'S FOCUS & WEEKLY SPRINT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span>Today's Study Checklist</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Derived dynamically from Week {stats.currentWeek} targets and active mistake revisits.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-3 w-3" />
              <span>Add Task</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                No tasks logged for today. Click "Add Task" to schedule your sprint!
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
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
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-medium ${
                          task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <Badge
                          variant={
                            task.section === 'Quant' ? 'quant' : task.section === 'DILR' ? 'dilr' : task.section === 'VARC' ? 'varc' : 'secondary'
                          }
                          className="text-[9px] px-1.5 py-0"
                        >
                          {task.section}
                        </Badge>
                        <span>{task.estimatedMinutes} mins est.</span>
                        {task.priority === 'Urgent' && (
                          <span className="text-red-400 font-semibold">• Urgent</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={task.status === 'Completed' ? 'success' : 'outline'}
                      className="text-[10px]"
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}

            <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
              <span>{tasks.filter((t) => t.status === 'Completed').length} of {tasks.length} tasks completed</span>
              <Link to="/planner" className="text-purple-400 hover:underline flex items-center gap-1 font-medium text-xs">
                Open Weekly Planner <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress Sprint (1 Col) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Week {stats.currentWeek} Sprint Targets</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Target: <strong className="text-foreground">{activePlan.hoursTarget} hrs/week</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Weekly Completion</span>
                <span className="font-mono font-bold text-purple-400">
                  {activePlan.status === 'Done' ? '100%' : 'In Progress'}
                </span>
              </div>
              <Progress value={activePlan.status === 'Done' ? 100 : 35} className="h-2" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg border border-border/70 bg-purple-500/5">
                <span className="font-semibold text-purple-400 block text-[11px]">Quant Syllabus</span>
                <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">{activePlan.quantPlan}</p>
              </div>

              <div className="p-2 rounded-lg border border-border/70 bg-emerald-500/5">
                <span className="font-semibold text-emerald-400 block text-[11px]">DILR Syllabus</span>
                <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">{activePlan.dilrPlan}</p>
              </div>

              <div className="p-2 rounded-lg border border-border/70 bg-amber-500/5">
                <span className="font-semibold text-amber-400 block text-[11px]">VARC Syllabus</span>
                <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">{activePlan.varcPlan}</p>
              </div>
            </div>

            {activePlan.testsPlanned && (
              <div className="text-[11px] p-2 rounded-lg bg-secondary/50 border border-border/50 text-foreground">
                <strong>Tests scheduled:</strong> {activePlan.testsPlanned}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION D: SUBJECT PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* QA Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">Quantitative Aptitude (QA)</CardTitle>
              <Badge variant="quant">25 Topics</Badge>
            </div>
            <CardDescription className="text-xs">Arithmetic, Algebra, Geometry, Numbers & Modern Maths</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Syllabus Mastered</span>
                <span className="font-mono font-bold text-purple-400">{quantStats.completed} / {quantStats.total}</span>
              </div>
              <Progress value={quantStats.pct} indicatorClassName="bg-purple-500" />
            </div>

            <div className="flex justify-between text-xs font-mono pt-1">
              <span className="text-muted-foreground">Avg Confidence:</span>
              <strong className="text-foreground">{quantStats.avgConfidence} / 5.0</strong>
            </div>

            {quantStats.weakList.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                <span className="font-medium text-red-400">Revision Focus:</span> {quantStats.weakList.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DILR Card */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">Data Interpretation & LR</CardTitle>
              <Badge variant="dilr">18 Topics</Badge>
            </div>
            <CardDescription className="text-xs">Tables, Caselets, Arrangements, Games & Puzzles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Syllabus Mastered</span>
                <span className="font-mono font-bold text-emerald-400">{dilrStats.completed} / {dilrStats.total}</span>
              </div>
              <Progress value={dilrStats.pct} indicatorClassName="bg-emerald-500" />
            </div>

            <div className="flex justify-between text-xs font-mono pt-1">
              <span className="text-muted-foreground">Avg Confidence:</span>
              <strong className="text-foreground">{dilrStats.avgConfidence} / 5.0</strong>
            </div>

            {dilrStats.weakList.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                <span className="font-medium text-red-400">Revision Focus:</span> {dilrStats.weakList.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* VARC Card */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">Verbal Ability & RC</CardTitle>
              <Badge variant="varc">10 Topics</Badge>
            </div>
            <CardDescription className="text-xs">Reading Comprehension, Summaries, Jumbles & Inferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Syllabus Mastered</span>
                <span className="font-mono font-bold text-amber-400">{varcStats.completed} / {varcStats.total}</span>
              </div>
              <Progress value={varcStats.pct} indicatorClassName="bg-amber-500" />
            </div>

            <div className="flex justify-between text-xs font-mono pt-1">
              <span className="text-muted-foreground">Avg Confidence:</span>
              <strong className="text-foreground">{varcStats.avgConfidence} / 5.0</strong>
            </div>

            {varcStats.weakList.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                <span className="font-medium text-red-400">Revision Focus:</span> {varcStats.weakList.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION E: PERFORMANCE VISUALIZATIONS (6 RECHARTS PANELS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Subject Progress Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subject Mastery Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 9 }} />
                <Radar name="Completion %" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Confidence Rating Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              5-Level Confidence Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="level" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {confidenceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Mistake Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mistake Root-Cause Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {mistakeChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No mistakes logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mistakeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mistakeChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MISTAKE_COLORS[index % MISTAKE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart 4: Planned vs Logged Hours */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Weekly Study Hours: Target vs Actual (Phase 1–2)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="week" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="target" name="Target (hrs)" fill="#374151" radius={[3, 3, 0, 0]} />
                <Bar dataKey="logged" name="Logged (hrs)" fill="#8B5CF6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Mock Score Progression */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mock Score Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {mockChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Trophy className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <span className="text-xs text-muted-foreground">No genuine mocks logged yet.</span>
                <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => navigate('/mocks')}>
                  Log First Mock
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="Total" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION F: QUICK ACTIONS */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Preparation Shortcuts:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setQuickAddOpen(true)}>
                <Plus className="h-3.5 w-3.5 text-purple-400" />
                <span>Log Mock</span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setQuickAddOpen(true)}>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Record Mistake</span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => navigate('/topics')}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Update Topics</span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setQuickAddOpen(true)}>
                <Bookmark className="h-3.5 w-3.5 text-blue-400" />
                <span>Sticky Note</span>
              </Button>
              <Button size="sm" variant="purple" className="h-8 text-xs gap-1.5" onClick={() => navigate('/ai-coach')}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Consult AI Coach</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION G: CAT PREPARATION BLUEPRINT (PDF INTEGRATION) */}
      <Card className="border-purple-500/20 bg-card/60 backdrop-blur-sm">
        <CardHeader className="cursor-pointer select-none" onClick={() => setBlueprintExpanded(!blueprintExpanded)}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground">
                  Your CAT 2027 Preparation Blueprint
                </CardTitle>
                <Badge variant="purple" className="text-[10px]">PDF Source Integrated</Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Complete preparation strategies, sectional targets, and daily distribution extracted from `CAT Preparation.pdf`.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {blueprintExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {blueprintExpanded && (
          <CardContent className="space-y-6 pt-0">
            {/* Quick Visual Exam Structure */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border/80 bg-muted/20">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Total Duration & Format</span>
                <p className="text-sm font-bold text-foreground">120 Minutes (2 Hours)</p>
                <p className="text-xs text-muted-foreground">3 sequential sections • 40 min each</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Question Proportions</span>
                <p className="text-sm font-bold text-foreground">68 Total Questions</p>
                <p className="text-xs text-muted-foreground">49 MCQs • 17 Non-MCQ TITA</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Marking Scheme</span>
                <p className="text-sm font-bold text-foreground">+3 Correct / -1 Wrong</p>
                <p className="text-xs text-muted-foreground">Zero negative marking on TITA</p>
              </div>
            </div>

            {/* 90% Target Strategy Box */}
            <div className="p-4 rounded-xl border border-border/80 bg-background/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Target Score Benchmarks for 90%+ (PDF Recommended Bare Minimum)
                </h4>
                <span className="text-[10px] text-muted-foreground">Document-derived target guidelines</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50">
                  <span className="text-[11px] text-muted-foreground block">VARC Minimum</span>
                  <strong className="text-base font-mono font-bold text-foreground">15 – 20</strong>
                  <span className="text-[10px] text-muted-foreground block">Net Score</span>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50">
                  <span className="text-[11px] text-muted-foreground block">DILR Minimum</span>
                  <strong className="text-base font-mono font-bold text-foreground">10</strong>
                  <span className="text-[10px] text-muted-foreground block">Net Score</span>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50">
                  <span className="text-[11px] text-muted-foreground block">QA Minimum</span>
                  <strong className="text-base font-mono font-bold text-foreground">5+</strong>
                  <span className="text-[10px] text-muted-foreground block">Net Score</span>
                </div>
              </div>
            </div>

            {/* Weekly Routine Schedule */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Weekly Subject Distribution
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-purple-700 dark:text-purple-400 block text-[11px]">Mon</strong>
                  <span className="text-[10px] text-muted-foreground">Arith + DILR + RC</span>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-purple-700 dark:text-purple-400 block text-[11px]">Tue</strong>
                  <span className="text-[10px] text-muted-foreground">Alg + DILR + VA</span>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-purple-700 dark:text-purple-400 block text-[11px]">Wed</strong>
                  <span className="text-[10px] text-muted-foreground">Arith + DILR + RC</span>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-purple-700 dark:text-purple-400 block text-[11px]">Thu</strong>
                  <span className="text-[10px] text-muted-foreground">Geo + DILR + VA</span>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-purple-700 dark:text-purple-400 block text-[11px]">Fri</strong>
                  <span className="text-[10px] text-muted-foreground">NumSys + DILR + RC</span>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-emerald-700 dark:text-emerald-400 block text-[11px]">Sat</strong>
                  <span className="text-[10px] text-muted-foreground">Mixed QA + Sectionals</span>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-card">
                  <strong className="text-amber-700 dark:text-amber-400 block text-[11px]">Sun</strong>
                  <span className="text-[10px] text-muted-foreground">Mock + 3h Analysis</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => navigate('/guide')}>
                <span>View Complete Preparation Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Global Quick Add Modal */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
};
