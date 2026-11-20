import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  Clock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/ui/StatCard';
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
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const { stats, weeklyPlans, topics, topicProgress, mockTests, mistakes } = useAppData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Quant, DILR, VARC statistics
  const quantTopics = topics.filter((t) => t.section === 'Quant');
  const dilrTopics = topics.filter((t) => t.section === 'DILR');
  const varcTopics = topics.filter((t) => t.section === 'VARC');

  const getSectionCounts = (list: typeof topics) => {
    let completed = 0;
    let weak = 0;
    list.forEach((t) => {
      const tp = topicProgress[t.id];
      if (tp && tp.conceptDone && tp.practiceDone && tp.pyqsDone) completed++;
      if (!tp || tp.confidence <= 2) weak++;
    });
    return { completed, total: list.length, weak };
  };

  const qCounts = getSectionCounts(quantTopics);
  const dCounts = getSectionCounts(dilrTopics);
  const vCounts = getSectionCounts(varcTopics);

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
    { level: 'L5: Mastered', count: confidenceCounts[4], fill: '#2563EB' },
  ];

  // Subject Comparison Data
  const subjectProgressData = [
    {
      name: 'Quant',
      Completed: qCounts.completed,
      Remaining: qCounts.total - qCounts.completed,
    },
    {
      name: 'DILR',
      Completed: dCounts.completed,
      Remaining: dCounts.total - dCounts.completed,
    },
    {
      name: 'VARC',
      Completed: vCounts.completed,
      Remaining: vCounts.total - vCounts.completed,
    },
  ];

  // Hours Data
  const hoursData = weeklyPlans.slice(0, 16).map((w) => ({
    week: `W${w.weekNumber}`,
    target: parseInt(w.hoursTarget.split('–')[0], 10) || 12,
    logged: w.actualHoursLogged || (w.weekNumber < stats.currentWeek ? 12 : 0),
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

  // Mistakes Chart
  const mistakeCounts: Record<string, number> = {};
  mistakes.forEach((m) => {
    mistakeCounts[m.mistakeType] = (mistakeCounts[m.mistakeType] || 0) + 1;
  });
  const mistakeChartData = Object.entries(mistakeCounts).map(([name, value]) => ({
    name,
    value,
  }));
  const MISTAKE_COLORS = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

  // Weak Topics List
  const weakTopics = topics
    .filter((t) => {
      const tp = topicProgress[t.id];
      return !tp || tp.confidence <= 2;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Performance Intelligence</h1>
          <Badge variant="blue" className="font-mono text-xs font-semibold">
            Real Metrics
          </Badge>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Completion"
          value={`${stats.overallCompletionPct}%`}
          subtitle={`${stats.completedTopics} of 53 Topics Done`}
          icon={<Target className="h-4 w-4 text-blue-600" />}
          badge="Syllabus"
          badgeVariant="info"
        />
        <StatCard
          title="Average Mock Score"
          value={stats.totalMocksAttempted > 0 ? (stats.averageMockScore ?? '–') : '–'}
          subtitle={stats.totalMocksAttempted > 0 ? `Best: ${stats.bestMockScore}` : '0 tests logged'}
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
          badge={stats.totalMocksAttempted > 0 ? `${stats.totalMocksAttempted} Mocks` : 'Pending'}
          badgeVariant="warning"
        />
        <StatCard
          title="Weak Area Backlog"
          value={stats.weakTopicsCount}
          subtitle="Topics with confidence ≤ 2"
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          badge={stats.weakTopicsCount > 0 ? 'High Priority' : 'Mastered'}
          badgeVariant={stats.weakTopicsCount > 0 ? 'destructive' : 'success'}
        />
        <StatCard
          title="Current Phase"
          value={`Phase ${stats.currentPhase.phaseNumber}`}
          subtitle={`Week ${stats.currentWeek} of 52`}
          icon={<Sparkles className="h-4 w-4 text-purple-500" />}
          badge={stats.currentPhase.name}
          badgeVariant="info"
        />
      </div>

      {/* 3. Sectional Progress & Mock Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Completion */}
        <Card className="rounded-xl border border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold">Subject-Wise Completion (53 Topics)</CardTitle>
            <CardDescription className="text-xs">
              Completed vs remaining canonical topics across QA, DILR, and VARC.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full p-2.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-border/40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={isDark ? 0.15 : 0.4} stroke={isDark ? '#334155' : '#CBD5E1'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#334155', fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#334155' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#FFF'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontWeight: 600 }} />
                  <Bar dataKey="Completed" stackId="a" fill="#2563EB" stroke="#1D4ED8" radius={[0, 0, 0, 0]} />
                  <Bar
                    dataKey="Remaining"
                    stackId="a"
                    fill={isDark ? '#334155' : '#94A3B8'}
                    stroke={isDark ? '#475569' : '#64748B'}
                    strokeWidth={1.5}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mock Test Score Trajectory */}
        <Card className="rounded-xl border border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold">Mock Test Score Evolution</CardTitle>
            <CardDescription className="text-xs">
              Total & sectional score trajectory across attempted full-length tests.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {mockChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center border border-dashed rounded-xl p-6">
                  <Trophy className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No mock test scores logged yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Log tests in Mock Tracker to track your score curve.</p>
                  <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => navigate('/mocks')}>
                    Log Mock Test
                  </Button>
                </div>
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
          </CardContent>
        </Card>
      </div>

      {/* 4. Confidence Distribution & Error Root Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <Card className="rounded-xl border border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold">Confidence Distribution (5 Levels)</CardTitle>
            <CardDescription className="text-xs">
              Count of topics classified by self-assessed mastery level.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>

        {/* Mistake Root-Cause Breakdown */}
        <Card className="rounded-xl border border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold">Mistake Root-Cause Categorization</CardTitle>
            <CardDescription className="text-xs">
              Distribution of test errors: concept gap, calculation, time sinks, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full flex items-center justify-center">
              {mistakeChartData.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No mistakes recorded yet.
                </div>
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
          </CardContent>
        </Card>
      </div>

      {/* 5. Weak Topics Immediate Action List */}
      <Card className="rounded-xl border border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span>Priority Improvement Topics (Confidence ≤ 2)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Focus next study sessions on these topics to raise your percentile floor.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-lg"
            onClick={() => navigate('/topics')}
          >
            Manage Topics →
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-3 rounded-lg border border-border/70 bg-slate-50/50 dark:bg-slate-900/30 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground text-xs">{topic.topicName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">W{topic.planWeek}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{topic.section} • {topic.area}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.2 rounded">
                    Needs Revision
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/topics?section=${topic.section}`)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                  >
                    <span>Practice</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
