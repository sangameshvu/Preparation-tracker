import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { MockTestItem } from '../types';
import { format } from 'date-fns';

export const MockTrackerPage: React.FC = () => {
  const { mockTests, addMockTest, updateMockTest, deleteMockTest, convertSampleMock, deleteSampleMock } = useAppData();
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

  const hasSampleMock = mockTests.some((m) => m.isSample);
  const genuineMocks = mockTests.filter((m) => !m.isSample && m.totalScore !== undefined);

  // Calculate Aggregates on genuine mocks
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
    setPercentile(mock.percentile !== undefined ? String(mock.percentile) : '');
    setBiggestLesson(mock.biggestLesson || '');
    setModalOpen(true);
  };

  const handleSaveMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesName.trim()) return;

    if (editingMock) {
      updateMockTest(editingMock.id, {
        seriesName: seriesName.trim(),
        testDate,
        varcAttempts: Number(varcAttempts) || 0,
        varcScore: Number(varcScore) || 0,
        dilrAttempts: Number(dilrAttempts) || 0,
        dilrScore: Number(dilrScore) || 0,
        qaAttempts: Number(qaAttempts) || 0,
        qaScore: Number(qaScore) || 0,
        percentile: percentile ? Number(percentile) : undefined,
        biggestLesson: biggestLesson.trim(),
        analysisDone: Boolean(biggestLesson.trim()),
      });
    } else {
      addMockTest({
        seriesName: seriesName.trim(),
        testDate,
        varcAttempts: Number(varcAttempts) || 0,
        varcScore: Number(varcScore) || 0,
        dilrAttempts: Number(dilrAttempts) || 0,
        dilrScore: Number(dilrScore) || 0,
        qaAttempts: Number(qaAttempts) || 0,
        qaScore: Number(qaScore) || 0,
        percentile: percentile ? Number(percentile) : undefined,
        biggestLesson: biggestLesson.trim(),
        analysisDone: Boolean(biggestLesson.trim()),
        isSample: false,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mock Performance Tracker</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track all 40 full-length mocks. Automated scoring (+3 correct, -1 wrong MCQ), sectional breakdown, and percentile progression.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="purple" size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Log New Mock</span>
        </Button>
      </div>

      {/* Sample Mock Banner */}
      {hasSampleMock && (
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-foreground block">
                Sample Mock Record Detected (SIMCAT 1, Score: 77, Percentile: 82.5)
              </strong>
              <p className="text-muted-foreground mt-0.5">
                The original Excel planner includes 1 illustrative mock row. It is isolated from your actual preparation analytics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={deleteSampleMock}>
              Discard Sample
            </Button>
            <Button size="sm" variant="purple" className="h-8 text-xs" onClick={convertSampleMock}>
              Adopt as Mock #1
            </Button>
          </div>
        </div>
      )}

      {/* KPI Aggregate Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground font-medium block">Mocks Taken</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-foreground">{totalMocksTaken}</span>
            <span className="text-xs text-muted-foreground font-mono">/ 40 slots</span>
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-muted-foreground font-medium block">Best Total Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300">
              {totalMocksTaken > 0 ? bestScore : '–'}
            </span>
            <span className="text-xs text-muted-foreground font-mono">pts</span>
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-muted-foreground font-medium block">Average Total Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {totalMocksTaken > 0 ? avgScore : '–'}
            </span>
            <span className="text-xs text-muted-foreground font-mono">pts</span>
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-muted-foreground font-medium block">Latest Mock Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {totalMocksTaken > 0 ? latestScore : '–'}
            </span>
            <span className="text-xs text-muted-foreground font-mono">pts</span>
          </div>
        </Card>
      </div>

      {/* Analytical Charts */}
      {totalMocksTaken > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Score Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Score Progression Over Mocks
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Total" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sectional Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sectional Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="VARC" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="DILR" fill="#10B981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="QA" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mock Tests Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Mock Tests Record Log (40 Slots)</CardTitle>
          <CardDescription className="text-xs">
            Scoring rule: +3 for correct, -1 for wrong MCQ, 0 for wrong TITA. Attempts = questions answered.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Series / Name</th>
                  <th className="py-2.5 px-3 text-center">VARC (Att/Scr)</th>
                  <th className="py-2.5 px-3 text-center">DILR (Att/Scr)</th>
                  <th className="py-2.5 px-3 text-center">QA (Att/Scr)</th>
                  <th className="py-2.5 px-3 text-center font-bold">Total Attempts</th>
                  <th className="py-2.5 px-3 text-center font-bold">Total Score</th>
                  <th className="py-2.5 px-3 text-center">%ile</th>
                  <th className="py-2.5 px-3 text-center">Analysis</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mockTests.map((mock) => {
                  const hasScore = mock.totalScore !== undefined && mock.totalScore !== null;
                  return (
                    <tr key={mock.id} className={`hover:bg-muted/30 transition-colors ${mock.isSample ? 'bg-purple-500/5' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                        {mock.mockNumber}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {mock.testDate || '–'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {mock.seriesName || <span className="text-muted-foreground/60 italic">Unattempted slot</span>}
                        {mock.isSample && (
                          <Badge variant="purple" className="ml-2 text-[9px] px-1 py-0">Sample</Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {hasScore ? `${mock.varcAttempts ?? '–'} / ${mock.varcScore ?? '–'}` : '–'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {hasScore ? `${mock.dilrAttempts ?? '–'} / ${mock.dilrScore ?? '–'}` : '–'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {hasScore ? `${mock.qaAttempts ?? '–'} / ${mock.qaScore ?? '–'}` : '–'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {hasScore ? mock.totalAttempts : '–'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-extrabold text-purple-700 dark:text-purple-300 text-sm">
                        {hasScore ? mock.totalScore : '–'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                        {mock.percentile ? `${mock.percentile}%` : '–'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {mock.analysisDone ? (
                          <Badge variant="success" className="text-[10px]">Done ✓</Badge>
                        ) : hasScore ? (
                          <Badge variant="warning" className="text-[10px]">Pending</Badge>
                        ) : (
                          '–'
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(mock)}
                            title="Edit / Log Mock"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          {hasScore && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-400"
                              onClick={() => deleteMockTest(mock.id)}
                              title="Delete Mock"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Mock Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingMock ? `Log / Edit Mock #${editingMock.mockNumber}` : 'Log New Mock Exam'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter attempts and scores for VARC, DILR, and Quant. Total attempts and total score calculate automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMock} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Mock Name / Series</label>
                <Input
                  placeholder="e.g. SIMCAT 1 or AIMCAT 2027"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl border border-border/80 bg-muted/20">
              <div>
                <span className="text-xs font-semibold text-purple-400 block mb-1">VARC (40 min)</span>
                <div className="space-y-1.5">
                  <Input
                    type="number"
                    placeholder="Attempts (0-24)"
                    min="0"
                    max="24"
                    value={varcAttempts || ''}
                    onChange={(e) => setVarcAttempts(Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Score"
                    value={varcScore || ''}
                    onChange={(e) => setVarcScore(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-400 block mb-1">DILR (40 min)</span>
                <div className="space-y-1.5">
                  <Input
                    type="number"
                    placeholder="Attempts (0-22)"
                    min="0"
                    max="22"
                    value={dilrAttempts || ''}
                    onChange={(e) => setDilrAttempts(Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Score"
                    value={dilrScore || ''}
                    onChange={(e) => setDilrScore(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-amber-400 block mb-1">Quant (40 min)</span>
                <div className="space-y-1.5">
                  <Input
                    type="number"
                    placeholder="Attempts (0-22)"
                    min="0"
                    max="22"
                    value={qaAttempts || ''}
                    onChange={(e) => setQaAttempts(Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Score"
                    value={qaScore || ''}
                    onChange={(e) => setQaScore(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-background border">
              <span>Total Attempts: <strong>{Number(varcAttempts) + Number(dilrAttempts) + Number(qaAttempts)}</strong></span>
              <span>Total Score: <strong className="text-purple-700 dark:text-purple-300 text-sm">{Number(varcScore) + Number(dilrScore) + Number(qaScore)}</strong></span>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Percentile (Optional)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 88.5"
                value={percentile}
                onChange={(e) => setPercentile(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Biggest Lesson from this Mock</label>
              <Textarea
                placeholder="e.g. Spent 14 min on one DILR set. Rule: switch sets at 8 min if no progress..."
                value={biggestLesson}
                onChange={(e) => setBiggestLesson(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="purple" size="sm">Save Mock Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
