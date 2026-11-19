import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Trophy,
  BarChart3,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Calendar,
  Sparkles,
  Clock,
  Bookmark,
  Check,
  RotateCcw,
  Play,
  Pause,
  Award,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { StatCard } from '../components/ui/StatCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MockTestItem } from '../types';
import { format } from 'date-fns';

// Practice Exam Simulator Questions (Reference 4)
interface PracticeQuestion {
  id: number;
  section: 'Quant' | 'DILR' | 'VARC';
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_EXAM_QUESTIONS: PracticeQuestion[] = [
  {
    id: 1,
    section: 'Quant',
    text: 'A merchant buys two articles for ₹1,200 total. He sells the first at 20% loss and the second at 20% profit. If the overall transaction results in no profit and no loss, what is the cost price of the first article?',
    options: [
      '₹600',
      '₹500',
      '₹700',
      '₹800'
    ],
    correctIndex: 0,
    explanation: 'Let CP of 1st be x, 2nd be (1200 - x). Loss on 1st = 0.2x. Profit on 2nd = 0.2(1200 - x). Since net profit/loss is 0, 0.2x = 0.2(1200 - x) => 2x = 1200 => x = 600.'
  },
  {
    id: 2,
    section: 'Quant',
    text: 'Find the remainder when 2^100 is divided by 101. (Hint: 101 is a prime number).',
    options: [
      '1',
      '2',
      '100',
      '0'
    ],
    correctIndex: 0,
    explanation: 'By Fermat’s Little Theorem, if p is a prime and gcd(a, p) = 1, then a^(p-1) ≡ 1 (mod p). Here p = 101 and a = 2, so 2^(101 - 1) = 2^100 ≡ 1 (mod 101).'
  },
  {
    id: 3,
    section: 'DILR',
    text: 'In a round-robin tournament of 8 teams where each pair plays exactly once with no draws, what is the minimum number of wins required to guarantee a top-4 finish?',
    options: [
      '4 wins',
      '5 wins',
      '6 wins',
      '7 wins'
    ],
    correctIndex: 1,
    explanation: 'Total matches = 8C2 = 28. To guarantee 4th or higher position against ties, 5 wins strictly guarantees advancing to playoffs.'
  },
  {
    id: 4,
    section: 'VARC',
    text: 'Which of the following phrases best captures the primary tone of an author who critiques technological determinism by examining unintended algorithmic societal consequences?',
    options: [
      'Unabashedly celebratory and optimistic',
      'Cautiously critical and inquisitive',
      'Aggressively hostile and cynical',
      'Wholly indifferent and detached'
    ],
    correctIndex: 1,
    explanation: 'An analytical critique examining systemic unintended consequences without outright cynicism reflects a cautiously critical and inquisitive tone.'
  }
];

export const MockTrackerPage: React.FC = () => {
  const { mockTests, addMockTest, updateMockTest, deleteMockTest, convertSampleMock, deleteSampleMock } = useAppData();
  const [activeTab, setActiveTab] = useState<'tracker' | 'simulator'>('tracker');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMock, setEditingMock] = useState<MockTestItem | null>(null);

  // Form State
  const [seriesName, setSeriesName] = useState('');
  const [testDate, setTestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [varcAttempts, setVarcAttempts] = useState(0);
  const [varcScore, setVarcScore] = useState(0);
  const [dilrAttempts, setDilrAttempts] = useState(0);
  const [dilrScore, setDilrScore] = useState(0);
  const [qaAttempts, setQaAttempts] = useState(0);
  const [qaScore, setQaScore] = useState(0);
  const [percentile, setPercentile] = useState('');
  const [biggestLesson, setBiggestLesson] = useState('');

  // Simulator State (Reference 4)
  const [simQuestionIdx, setSimQuestionIdx] = useState(0);
  const [simAnswers, setSimAnswers] = useState<Record<number, number>>({});
  const [simBookmarks, setSimBookmarks] = useState<Record<number, boolean>>({});
  const [simSecondsRemaining, setSimSecondsRemaining] = useState(2400); // 40 mins
  const [simIsRunning, setSimIsRunning] = useState(false);
  const [simSubmitted, setSimSubmitted] = useState(false);
  const [simResult, setSimResult] = useState<{ total: number; correct: number; wrong: number } | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (simIsRunning && simSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSimSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [simIsRunning, simSecondsRemaining]);

  const hasSampleMock = mockTests.some((m) => m.isSample);
  const genuineMocks = mockTests.filter((m) => !m.isSample && m.totalScore !== undefined);

  // Aggregates
  const totalMocksTaken = genuineMocks.length;
  let bestScore = 0;
  let avgScore = 0;
  let latestScore = 0;

  if (totalMocksTaken > 0) {
    const scores = genuineMocks.map((m) => m.totalScore || 0);
    bestScore = Math.max(...scores);
    const sum = scores.reduce((a, b) => a + b, 0);
    avgScore = Math.round((sum / totalMocksTaken) * 10) / 10;
    latestScore = genuineMocks[genuineMocks.length - 1].totalScore || 0;
  }

  // Chart data
  const chartData = genuineMocks.map((m) => ({
    name: `Mock ${m.mockNumber}`,
    Total: m.totalScore,
    VARC: m.varcScore,
    DILR: m.dilrScore,
    QA: m.qaScore,
    Percentile: m.percentile,
  }));

  const handleOpenAdd = () => {
    setEditingMock(null);
    setSeriesName('');
    setTestDate(format(new Date(), 'yyyy-MM-dd'));
    setVarcAttempts(0);
    setVarcScore(0);
    setDilrAttempts(0);
    setDilrScore(0);
    setQaAttempts(0);
    setQaScore(0);
    setPercentile('');
    setBiggestLesson('');
    setModalOpen(true);
  };

  const handleOpenEdit = (mock: MockTestItem) => {
    setEditingMock(mock);
    setSeriesName(mock.seriesName || '');
    setTestDate(mock.testDate || format(new Date(), 'yyyy-MM-dd'));
    setVarcAttempts(mock.varcAttempts || 0);
    setVarcScore(mock.varcScore || 0);
    setDilrAttempts(mock.dilrAttempts || 0);
    setDilrScore(mock.dilrScore || 0);
    setQaAttempts(mock.qaAttempts || 0);
    setQaScore(mock.qaScore || 0);
    setPercentile(mock.percentile ? String(mock.percentile) : '');
    setBiggestLesson(mock.biggestLesson || '');
    setModalOpen(true);
  };

  const handleSaveMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMock) {
      updateMockTest(editingMock.id, {
        seriesName,
        testDate,
        varcAttempts: Number(varcAttempts) || 0,
        varcScore: Number(varcScore) || 0,
        dilrAttempts: Number(dilrAttempts) || 0,
        dilrScore: Number(dilrScore) || 0,
        qaAttempts: Number(qaAttempts) || 0,
        qaScore: Number(qaScore) || 0,
        percentile: percentile ? parseFloat(percentile) : undefined,
        biggestLesson,
        isSample: false
      });
    } else {
      addMockTest({
        seriesName,
        testDate,
        varcAttempts: Number(varcAttempts) || 0,
        varcScore: Number(varcScore) || 0,
        dilrAttempts: Number(dilrAttempts) || 0,
        dilrScore: Number(dilrScore) || 0,
        qaAttempts: Number(qaAttempts) || 0,
        qaScore: Number(qaScore) || 0,
        percentile: percentile ? parseFloat(percentile) : undefined,
        biggestLesson,
        analysisDone: false,
        isSample: false
      });
    }
    setModalOpen(false);
  };

  // Simulator actions
  const currentQ = SAMPLE_EXAM_QUESTIONS[simQuestionIdx];
  const simAttemptedCount = Object.keys(simAnswers).length;

  const handleSelectSimAnswer = (optIdx: number) => {
    setSimAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleToggleBookmark = () => {
    setSimBookmarks((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleSubmitSimulator = () => {
    let correct = 0;
    let wrong = 0;
    let score = 0;

    SAMPLE_EXAM_QUESTIONS.forEach((q) => {
      const selected = simAnswers[q.id];
      if (selected !== undefined) {
        if (selected === q.correctIndex) {
          correct++;
          score += 3;
        } else {
          wrong++;
          score -= 1;
        }
      }
    });

    setSimResult({ total: score, correct, wrong });
    setSimSubmitted(true);
    setSimIsRunning(false);
  };

  const handleLogSimToMocks = () => {
    if (!simResult) return;
    addMockTest({
      seriesName: 'CAT Crack Simulator Drill',
      testDate: format(new Date(), 'yyyy-MM-dd'),
      varcAttempts: 1,
      varcScore: simAnswers[4] === SAMPLE_EXAM_QUESTIONS[3].correctIndex ? 3 : -1,
      dilrAttempts: 1,
      dilrScore: simAnswers[3] === SAMPLE_EXAM_QUESTIONS[2].correctIndex ? 3 : -1,
      qaAttempts: 2,
      qaScore: (simAnswers[1] === 0 ? 3 : -1) + (simAnswers[2] === 0 ? 3 : -1),
      biggestLesson: `Completed 4-question speed drill. Score: ${simResult.total}`,
      analysisDone: true,
      isSample: false
    });
    setSimSubmitted(false);
    setActiveTab('tracker');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mock Test Centre</h1>
            <Badge variant="blue" className="font-mono text-xs font-semibold">
              Exam Ready
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <TabsTrigger value="tracker" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 font-semibold">
                Test History & Logs
              </TabsTrigger>
              <TabsTrigger value="simulator" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 font-semibold">
                Practice Exam Simulator
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === 'tracker' && (
            <Button size="sm" className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg" onClick={handleOpenAdd}>
              <Plus className="h-3.5 w-3.5" />
              <span>Log Mock</span>
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: MOCK TRACKER & LOGS */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Sample Banner if present */}
          {hasSampleMock && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 text-xs">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Sample mock test data is loaded to demonstrate charts. Ready to start your own records?</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-md" onClick={convertSampleMock}>
                  Keep as Mine
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-rose-600 hover:text-rose-700" onClick={deleteSampleMock}>
                  Remove Sample
                </Button>
              </div>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Mocks Attempted"
              value={totalMocksTaken}
              subtitle="Full-length tests"
              icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
              badge="Recorded"
              badgeVariant="info"
            />
            <StatCard
              title="Best Score"
              value={bestScore}
              subtitle="Highest raw score"
              icon={<Trophy className="h-4 w-4 text-amber-500" />}
              badge="Peak"
              badgeVariant="warning"
            />
            <StatCard
              title="Average Score"
              value={avgScore}
              subtitle="Mean across all tests"
              icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
              badge="Pacing"
              badgeVariant="success"
            />
            <StatCard
              title="Latest Test Score"
              value={latestScore}
              subtitle="Most recent exam"
              icon={<CheckCircle2 className="h-4 w-4 text-purple-600" />}
              badge="Current"
              badgeVariant="info"
            />
          </div>

          {/* Score Trajectory Chart */}
          <Card className="rounded-xl border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold">Score Trajectory Across Attempted Tests</CardTitle>
              <CardDescription className="text-xs">
                Total and sectional breakdown (Quant, DILR, VARC).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center border border-dashed rounded-xl p-6">
                    <Trophy className="h-8 w-8 text-muted-foreground opacity-40 mb-2" />
                    <p className="text-xs font-semibold text-foreground">No test scores recorded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Log Mock" to add your test evaluation.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

          {/* Mocks Table */}
          <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Logged Full-Length Mock Tests ({genuineMocks.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3 w-14 text-center">#</th>
                    <th className="p-3">Series / Provider</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-center">VARC</th>
                    <th className="p-3 text-center">DILR</th>
                    <th className="p-3 text-center">QA</th>
                    <th className="p-3 text-center font-bold">Total</th>
                    <th className="p-3 text-center">%ile</th>
                    <th className="p-3">Key Takeaway</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {genuineMocks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 text-center font-mono font-bold">M{m.mockNumber}</td>
                      <td className="p-3 font-semibold text-foreground">{m.seriesName || 'Standard CAT Mock'}</td>
                      <td className="p-3 text-muted-foreground font-mono">{m.testDate || '–'}</td>
                      <td className="p-3 text-center font-mono">{m.varcScore ?? '–'}</td>
                      <td className="p-3 text-center font-mono">{m.dilrScore ?? '–'}</td>
                      <td className="p-3 text-center font-mono">{m.qaScore ?? '–'}</td>
                      <td className="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {m.totalScore ?? '–'}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {m.percentile ? `${m.percentile}%` : '–'}
                      </td>
                      <td className="p-3 max-w-[240px] truncate text-muted-foreground">
                        {m.biggestLesson || 'No takeaway logged.'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(m)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => deleteMockTest(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: DISTRACTION-FREE PRACTICE EXAM SIMULATOR (Reference 4) */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Top Simulator Control Bar */}
          <Card className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Exam Mode</span>
                  <span className="text-sm font-bold text-foreground">CAT Model Diagnostic Drill</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Section</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentQ.section}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Progress</span>
                  <span className="text-sm font-bold text-foreground">
                    {simAttemptedCount} of {SAMPLE_EXAM_QUESTIONS.length} Answered
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs rounded-lg"
                  onClick={() => setSimIsRunning(!simIsRunning)}
                >
                  {simIsRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{simIsRunning ? 'Pause Timer' : 'Start Timer'}</span>
                </Button>

                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                  onClick={handleSubmitSimulator}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Submit Exam</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Main Simulator Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Question & Options */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="rounded-xl border border-border/80 bg-card p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      Question {simQuestionIdx + 1} of {SAMPLE_EXAM_QUESTIONS.length}
                    </span>
                    <Button
                      variant={simBookmarks[currentQ.id] ? 'default' : 'ghost'}
                      size="sm"
                      className={`h-7 text-xs gap-1 rounded-md ${
                        simBookmarks[currentQ.id] ? 'bg-purple-600 text-white' : 'text-muted-foreground'
                      }`}
                      onClick={handleToggleBookmark}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>{simBookmarks[currentQ.id] ? 'Bookmarked' : 'Save for Revision'}</span>
                    </Button>
                  </div>

                  <h3 className="text-base font-semibold text-foreground leading-relaxed mb-6">
                    {currentQ.text}
                  </h3>

                  {/* Options List (Reference 4 clean card style) */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                      const isSelected = simAnswers[currentQ.id] === oIdx;

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectSimAnswer(oIdx)}
                          className={`flex items-center gap-3.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 dark:border-blue-500 dark:bg-blue-500/15 dark:text-blue-200 font-semibold shadow-xs'
                              : 'border-border/80 bg-card hover:border-slate-300 dark:hover:border-slate-700 text-foreground'
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs shrink-0 border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 dark:bg-slate-800 border-border text-muted-foreground'
                            }`}
                          >
                            {letter}
                          </div>
                          <span className="flex-1 leading-normal">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={simQuestionIdx === 0}
                      onClick={() => setSimQuestionIdx(0)}
                      className="text-xs h-8 rounded-lg"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={simQuestionIdx === 0}
                      onClick={() => setSimQuestionIdx(simQuestionIdx - 1)}
                      className="text-xs h-8 rounded-lg"
                    >
                      Back
                    </Button>
                  </div>

                  <span className="text-xs font-mono font-bold text-foreground">
                    {simQuestionIdx + 1} / {SAMPLE_EXAM_QUESTIONS.length}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={simQuestionIdx === SAMPLE_EXAM_QUESTIONS.length - 1}
                      onClick={() => setSimQuestionIdx(simQuestionIdx + 1)}
                      className="text-xs h-8 rounded-lg"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={simQuestionIdx === SAMPLE_EXAM_QUESTIONS.length - 1}
                      onClick={() => setSimQuestionIdx(SAMPLE_EXAM_QUESTIONS.length - 1)}
                      className="text-xs h-8 rounded-lg"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Col: Countdown Timer & Question Palette */}
            <div className="space-y-4">
              {/* Countdown Timer Card */}
              <Card className="rounded-xl border border-border/80 bg-card p-5 text-center shadow-xs">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Timer Remaining
                </span>
                <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {formatTimer(simSecondsRemaining)}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Strict 40:00 section countdown
                </span>
              </Card>

              {/* Question Palette Card */}
              <Card className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
                <span className="text-xs font-bold text-foreground block mb-3">Question Palette</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {SAMPLE_EXAM_QUESTIONS.map((q, idx) => {
                    const isCurrent = simQuestionIdx === idx;
                    const isAnswered = simAnswers[q.id] !== undefined;
                    const isBookmarked = simBookmarks[q.id];

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSimQuestionIdx(idx)}
                        className={`h-9 w-full rounded-lg font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                          isCurrent
                            ? 'ring-2 ring-blue-600 ring-offset-2 border-blue-600'
                            : ''
                        } ${
                          isAnswered
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isBookmarked
                            ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground border-border'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-blue-600" />
                    <span>Answered ({simAttemptedCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-purple-200 dark:bg-purple-900" />
                    <span>Bookmarked ({Object.values(simBookmarks).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-slate-200 dark:bg-slate-800" />
                    <span>Unanswered ({SAMPLE_EXAM_QUESTIONS.length - simAttemptedCount})</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Results Dialog */}
          <Dialog open={simSubmitted} onOpenChange={setSimSubmitted}>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>Exam Performance Report</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Evaluation based on official CAT scoring rules (+3 correct, -1 negative mark).
                </DialogDescription>
              </DialogHeader>

              {simResult && (
                <div className="space-y-4 py-3">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-center">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Raw Score</span>
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
                      {simResult.total} / 12 Marks
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-border/80 bg-slate-50 dark:bg-slate-900/30">
                      <span className="text-muted-foreground block text-[11px]">Correct Answers</span>
                      <span className="text-base font-bold text-emerald-600">{simResult.correct} questions (+{simResult.correct * 3})</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border/80 bg-slate-50 dark:bg-slate-900/30">
                      <span className="text-muted-foreground block text-[11px]">Incorrect Answers</span>
                      <span className="text-base font-bold text-rose-600">{simResult.wrong} questions (-{simResult.wrong})</span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex sm:justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => setSimSubmitted(false)}>
                  Close
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleLogSimToMocks}>
                  Save to Mock Tracker
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Add / Edit Mock Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingMock ? `Edit Mock #${editingMock.mockNumber}` : 'Log New Mock Test'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record sectional performance, percentile scores, and critical post-mortem takeaways.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMock} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Series / Provider</label>
                <Input
                  placeholder="e.g., AIMCAT 2027-01, SIMCAT 02"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Date Taken</label>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Sectional Scores */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-slate-50 dark:bg-slate-900/30 space-y-3">
              <span className="text-xs font-bold text-foreground block">Sectional Attempts & Scores</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-blue-600">QA Score</label>
                  <Input
                    type="number"
                    value={qaScore}
                    onChange={(e) => setQaScore(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-emerald-600">DILR Score</label>
                  <Input
                    type="number"
                    value={dilrScore}
                    onChange={(e) => setDilrScore(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-amber-600">VARC Score</label>
                  <Input
                    type="number"
                    value={varcScore}
                    onChange={(e) => setVarcScore(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Percentile (Optional)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 94.25"
                value={percentile}
                onChange={(e) => setPercentile(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Biggest Lesson / Strategic Takeaway</label>
              <Textarea
                placeholder="What was the primary root-cause of lost marks? (e.g., Spent 14 mins on 1 dead-end DILR set)"
                value={biggestLesson}
                onChange={(e) => setBiggestLesson(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Evaluation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
