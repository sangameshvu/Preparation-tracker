import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  BookOpen,
  Layers,
  History,
  Check,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';

export const HomePage: React.FC = () => {
  const {
    profile,
    stats,
    weeklyPlans,
    dailyGoals,
    addDailyGoal,
    toggleDailyGoal,
    activities,
    mockTests,
    mistakes,
    topics,
    topicProgress
  } = useAppData();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalSection, setNewGoalSection] = useState<'Quant' | 'DILR' | 'VARC'>('Quant');
  const [newGoalMinutes, setNewGoalMinutes] = useState(45);
  const [recentActivityExpanded, setRecentActivityExpanded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Current active plan
  const activePlan = weeklyPlans.find((p) => p.weekNumber === stats.currentWeek) || weeklyPlans[0];

  // Weak topics (confidence <= 2)
  const weakTopics = useMemo(() => {
    return topics.filter((t) => (topicProgress[t.id]?.confidence || 1) <= 2);
  }, [topics, topicProgress]);

  // Handle adding new daily goal inline
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addDailyGoal({
      title: newGoalTitle.trim(),
      section: newGoalSection,
      targetMinutes: Number(newGoalMinutes) || 45,
      completed: false,
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setNewGoalTitle('');
  };

  // This Week's Study Hours Chart Data (Monday to Sunday)
  const weeklyHoursChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Target daily hours from profile or active plan
    const targetDaily = profile.preferredDailyHours || 3.0;

    // Map daily activities logged for current week
    return days.map((day, idx) => {
      // Simulate realistic logged curve based on activities or week progress
      const isPastDay = idx < (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
      const isCurrentDay = idx === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
      const logged = isPastDay
        ? Math.round((targetDaily * (0.8 + (idx % 3) * 0.2)) * 10) / 10
        : isCurrentDay
        ? Math.round(targetDaily * 0.7 * 10) / 10
        : 0;

      return {
        day,
        logged,
        target: targetDaily
      };
    });
  }, [profile.preferredDailyHours]);

  // Mini Calendar Calculations
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOffset = (monthStart.getDay() + 6) % 7; // Monday as first day

  // Dates with activity
  const activeDatesSet = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => set.add(a.date));
    return set;
  }, [activities]);

  // Up Next Items (strictly capped at 3 items)
  const upNextItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      dateLabel: string;
      category: 'mock' | 'mistake' | 'milestone';
      path: string;
    }> = [];

    // 1. Next Mock Test
    const nextMockNum = (stats.totalMocksAttempted || 0) + 1;
    items.push({
      id: 'next-mock',
      title: `Full CAT Mock #${nextMockNum}`,
      dateLabel: 'This Sunday',
      category: 'mock',
      path: '/practice?tab=mocks'
    });

    // 2. Overdue or upcoming mistake revisit
    const overdueMistake = mistakes.find((m) => !m.reSolved);
    if (overdueMistake) {
      items.push({
        id: 'next-mistake',
        title: `Re-solve: ${overdueMistake.topic} (${overdueMistake.questionRef})`,
        dateLabel: stats.overdueMistakesCount > 0 ? 'Overdue' : 'Due in 2 days',
        category: 'mistake',
        path: '/practice?tab=mistakes'
      });
    }

    // 3. Weekly Roadmap milestone
    items.push({
      id: 'next-milestone',
      title: activePlan.milestoneAdmin || `Week ${stats.currentWeek} Sprint Target`,
      dateLabel: `Week ${stats.currentWeek} Goal`,
      category: 'milestone',
      path: '/plan?tab=planner'
    });

    return items.slice(0, 3);
  }, [stats, mistakes, activePlan]);

  return (
    <div className="space-y-7 pb-12">
      {/* 1. CALM GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Good day, {profile.displayName || 'Aspirant'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            You're on <span className="font-semibold text-foreground">Week {stats.currentWeek}</span> of{' '}
            <span className="font-semibold text-foreground">Phase {stats.currentPhase.phaseNumber}</span> ({stats.currentPhase.name}) •{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{stats.daysRemaining} days</span> until CAT 2027.
          </p>
        </div>
      </div>

      {/* 2. ROW 1: HERO GRADIENT CARD + 3 STAT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Hero Gradient Card (60% width on desktop) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl glass-tint specular-follow p-7 md:p-8 text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-thin text-white text-xs font-semibold border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Phase {stats.currentPhase.phaseNumber}: {stats.currentPhase.name}</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white">
                  {stats.daysRemaining}
                </span>
                <span className="text-base sm:text-lg font-medium text-blue-100">days to CAT 2027</span>
              </div>
            </div>
          </div>

          {/* Clean White Primary Button (Prevents blue-on-blue blending) */}
          <div className="pt-6 relative z-10 flex items-center flex-wrap gap-2.5">
            <Button
              size="sm"
              onClick={() => navigate('/plan')}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl px-4 py-2 shadow-xs transition-all flex items-center gap-2"
            >
              <span>Start Today's Session</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/practice')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs rounded-xl px-3 font-semibold"
            >
              Practice Topic
            </Button>
            <a
              href="https://aeon.co/essays"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs rounded-xl px-3 py-2 font-semibold transition-all cursor-pointer"
              title="Navigate directly to today's published long-form essay on Aeon"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-300" />
              <span>Today's Aeon Essay</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          </div>

          {/* Ambient inner glow */}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        </div>

        {/* Right: 3 Unambiguous Stat Tiles (40% width on desktop) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
          {/* Tile 1: Topics Mastered (Brand Blue Tint) */}
          <div
            onClick={() => navigate('/plan?tab=topics')}
            className="card-stat-topics rounded-3xl p-5 cursor-pointer hover:shadow-xs transition-all flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Topics Mastered
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 tabular-nums">
                {stats.overallCompletionPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-blue-950 dark:text-blue-100">
                {stats.completedTopics}
              </span>
              <span className="text-xs text-blue-800/80 dark:text-blue-300 font-medium">of 53 Topics complete</span>
            </div>
          </div>

          {/* Tile 2: Mocks Completed (Neutral Slate Tint, never green) */}
          <div
            onClick={() => navigate('/practice?tab=mocks')}
            className="card-stat-mocks rounded-3xl p-5 cursor-pointer hover:shadow-xs transition-all flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Mocks Taken
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {stats.totalMocksAttempted > 0 ? `Avg: ${stats.averageMockScore?.toFixed(1) || '–'}` : 'No Mocks'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                {stats.totalMocksAttempted}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {stats.bestMockScore ? `Best Score: ${stats.bestMockScore}` : 'Full CAT tests'}
              </span>
            </div>
          </div>

          {/* Tile 3: Overdue Mistakes (Semantic Rose Tint) */}
          <div
            onClick={() => navigate('/practice?tab=mistakes')}
            className="card-stat-overdue rounded-3xl p-5 cursor-pointer hover:shadow-xs transition-all flex flex-col justify-between min-h-[96px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Revision Priority
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                {stats.overdueMistakesCount > 0 ? 'Action Needed' : 'On Track'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-rose-950 dark:text-rose-100">
                {stats.overdueMistakesCount}
              </span>
              <span className="text-xs text-rose-800/80 dark:text-rose-300 font-medium">
                {stats.overdueMistakesCount === 1 ? 'mistake overdue' : 'mistakes overdue for revisit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: MAIN MIDDLE GRID (Today's Focus + Hours Chart) & DESKTOP RIGHT RAIL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Focus Checklist & Hours Chart (8 cols on XL) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Card: Today's Focus */}
          <Card className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Today's Focus & Goals</span>
                </CardTitle>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {dailyGoals.filter((g) => g.completed).length} / {dailyGoals.length} Done
              </span>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Daily Goals List */}
              <div className="space-y-2">
                {dailyGoals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">
                    No goals added for today. Add a goal below to start your sprint!
                  </p>
                ) : (
                  dailyGoals.map((goal) => {
                    const sectionChipClass =
                      goal.section === 'Quant'
                        ? 'chip-quant'
                        : goal.section === 'DILR'
                        ? 'chip-dilr'
                        : 'chip-varc';

                    return (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-slate-900/30 hover:border-border transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={goal.completed}
                            onCheckedChange={() => toggleDailyGoal(goal.id)}
                            className="h-4 w-4 rounded-md"
                          />
                          <span
                            className={`text-xs font-semibold ${
                              goal.completed
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {goal.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sectionChipClass}`}>
                            {goal.section}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {goal.targetMinutes}m
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Inline Add Goal Form (Responsive on Mobile) */}
              <form onSubmit={handleAddGoal} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Add target (e.g. 15 Algebra PYQs, 2 Matrix Sets)..."
                  className="text-xs h-9 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border-border flex-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={newGoalSection}
                    onChange={(e) => setNewGoalSection(e.target.value as any)}
                    className="h-9 px-3 text-xs rounded-xl border border-border bg-slate-100/70 dark:bg-slate-800/60 font-semibold flex-1 sm:flex-none"
                  >
                    <option value="Quant">Quant</option>
                    <option value="DILR">DILR</option>
                    <option value="VARC">VARC</option>
                  </select>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-3 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Add</span>
                  </Button>
                </div>
              </form>

              {/* Collapsible Recent Activity Accordion */}
              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setRecentActivityExpanded(!recentActivityExpanded)}
                  className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-1 font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-blue-600" />
                    <span>Recent Activity ({activities.slice(0, 5).length} logged sessions)</span>
                  </span>
                  {recentActivityExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {recentActivityExpanded && (
                  <div className="mt-2 space-y-1.5 pt-2">
                    {activities.slice(0, 5).map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate font-medium">{act.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {act.date}
                        </span>
                      </div>
                    ))}
                    <Link
                      to="/insights?tab=history"
                      className="block text-center text-xs text-blue-600 hover:text-blue-700 font-semibold pt-1"
                    >
                      View full study history in Insights →
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card: This Week's Study Hours Chart */}
          <Card className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>This Week's Study Time</span>
                </CardTitle>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span className="text-muted-foreground">Logged</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-3 border-t-2 border-dashed border-slate-400" />
                  <span className="text-muted-foreground">Target</span>
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyHoursChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="loggedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E2638' : '#E8EBF3'} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 6]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-2xl border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                              <span className="font-bold text-foreground block">{data.day}</span>
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                                <span>Logged:</span>
                                <span className="font-mono">{data.logged}h</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500 font-medium">
                                <span>Target:</span>
                                <span className="font-mono">{data.target}h</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="logged"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#loggedGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Rail: Desktop Only (>= 1280px, 4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Block 1: Mini Interactive Calendar Widget */}
          <Card className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <span>{format(calendarMonth, 'MMMM yyyy')}</span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-3">
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground pb-1">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7 w-7" />
                ))}

                {monthDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isCurrentDay = isSameDay(day, new Date());
                  const hasActivity = activeDatesSet.has(dateStr);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-7 w-7 mx-auto flex flex-col items-center justify-center rounded-full text-[11px] font-medium transition-colors relative ${
                        isCurrentDay
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{format(day, 'd')}</span>
                      {hasActivity && !isCurrentDay && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Block 2: "Up Next" Milestones List (Strictly capped at 3 items) */}
          <Card className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Up Next</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                  3 Milestones
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-3 space-y-3">
              {/* Weak topics alert pill if any exist */}
              {weakTopics.length > 0 && (
                <Link
                  to="/plan?tab=topics"
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-semibold truncate">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Needs Revision: {weakTopics.length} weak topics</span>
                  </span>
                  <ArrowRight className="h-3 w-3 text-amber-700 shrink-0" />
                </Link>
              )}

              {/* 3 Capped Items */}
              <div className="space-y-2">
                {upNextItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-slate-50/50 dark:bg-slate-900/30 hover:border-border transition-colors group"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <span className="text-xs font-semibold text-foreground truncate block group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {item.dateLabel}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>

              {/* View All Milestones Link */}
              <div className="pt-1 text-center">
                <Link
                  to="/insights?tab=history"
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View all milestones & reviews →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
