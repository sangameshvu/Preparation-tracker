import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { MistakeItem, SectionType, MistakeCategory } from '../types';
import { format, parseISO, addDays } from 'date-fns';

export const MistakeLogPage: React.FC = () => {
  const { mistakes, addMistake, updateMistake, deleteMistake, convertSampleMistake, deleteSampleMistake } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMistake, setEditingMistake] = useState<MistakeItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<'all' | 'unresolved' | 'overdue'>('unresolved');

  // Form State
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formSection, setFormSection] = useState<SectionType>('Quant');
  const [formTopic, setFormTopic] = useState('');
  const [formSource, setFormSource] = useState('Daily Practice');
  const [formQuestion, setFormQuestion] = useState('');
  const [formType, setFormType] = useState<MistakeCategory>('Calculation error');
  const [formWhatWrong, setFormWhatWrong] = useState('');
  const [formRule, setFormRule] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hasSampleMistake = mistakes.some((m) => m.isSample);
  const genuineMistakes = mistakes.filter((m) => !m.isSample);

  // Filtered Mistakes
  const filteredMistakes = useMemo(() => {
    return genuineMistakes.filter((m) => {
      if (categoryFilter !== 'all' && m.mistakeType !== categoryFilter) return false;
      if (sectionFilter !== 'all' && m.section !== sectionFilter) return false;
      if (resolvedFilter === 'unresolved' && m.reSolved) return false;
      if (resolvedFilter === 'overdue' && (m.reSolved || m.revisitDate >= todayStr)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.topic.toLowerCase().includes(q) ||
          m.whatWentWrong.toLowerCase().includes(q) ||
          m.ruleForNextTime.toLowerCase().includes(q) ||
          m.source.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [genuineMistakes, categoryFilter, sectionFilter, resolvedFilter, searchQuery, todayStr]);

  // Overdue count
  const overdueCount = genuineMistakes.filter((m) => !m.reSolved && m.revisitDate < todayStr).length;
  const pendingCount = genuineMistakes.filter((m) => !m.reSolved).length;

  // Chart data
  const categoryCounts: Record<string, number> = {};
  genuineMistakes.forEach((m) => {
    categoryCounts[m.mistakeType] = (categoryCounts[m.mistakeType] || 0) + 1;
  });

  const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#EC4899'];

  const handleOpenAdd = () => {
    setEditingMistake(null);
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormSection('Quant');
    setFormTopic('');
    setFormSource('Daily Practice');
    setFormQuestion('');
    setFormType('Calculation error');
    setFormWhatWrong('');
    setFormRule('');
    setModalOpen(true);
  };

  const handleOpenEdit = (m: MistakeItem) => {
    setEditingMistake(m);
    setFormDate(m.date);
    setFormSection(m.section);
    setFormTopic(m.topic);
    setFormSource(m.source);
    setFormQuestion(m.questionRef);
    setFormType(m.mistakeType);
    setFormWhatWrong(m.whatWentWrong);
    setFormRule(m.ruleForNextTime);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim() || !formWhatWrong.trim()) return;

    if (editingMistake) {
      updateMistake(editingMistake.id, {
        date: formDate,
        section: formSection,
        topic: formTopic.trim(),
        source: formSource.trim(),
        questionRef: formQuestion.trim() || 'General',
        mistakeType: formType,
        whatWentWrong: formWhatWrong.trim(),
        ruleForNextTime: formRule.trim() || 'Review concept',
      });
    } else {
      addMistake({
        date: formDate,
        section: formSection,
        topic: formTopic.trim(),
        source: formSource.trim(),
        questionRef: formQuestion.trim() || 'General',
        mistakeType: formType,
        whatWentWrong: formWhatWrong.trim(),
        ruleForNextTime: formRule.trim() || 'Review concept',
        reSolved: false,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mistake Log & Root-Cause Remediation</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Log every incorrect, skipped or slow question. Spaced repetition engine automatically schedules re-solving in 7 days.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="default" size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Record Mistake</span>
        </Button>
      </div>

      {/* Sample Mistake Banner */}
      {hasSampleMistake && (
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-foreground block">
                Sample Mistake Record Detected (Euler's Theorem in Remainders)
              </strong>
              <p className="text-muted-foreground mt-0.5">
                The original planner workbook contains 1 sample mistake row. It is isolated from your active revision queue.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={deleteSampleMistake}>
              Discard Sample
            </Button>
            <Button size="sm" variant="default" className="h-8 text-xs" onClick={convertSampleMistake}>
              Adopt Sample
            </Button>
          </div>
        </div>
      )}

      {/* Overdue / Active Alerts Bar */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <span>
              <strong>{overdueCount} mistake(s) are overdue for re-solving!</strong> The 7-day revisit window has expired. Re-solve these questions today.
            </span>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs shrink-0"
            onClick={() => setResolvedFilter('overdue')}
          >
            View Overdue Queue
          </Button>
        </div>
      )}

      {/* Analytics Strip & Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Recorded Mistakes</span>
            <div className="text-3xl font-bold font-mono text-foreground mt-1">{genuineMistakes.length}</div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {genuineMistakes.filter((m) => m.reSolved).length} re-solved successfully
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Active Revision Queue:</span>
              <strong className="text-amber-400 font-mono font-bold">{pendingCount} pending</strong>
            </div>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Repeated Error Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-44 flex items-center">
            {chartData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center w-full">
                No mistakes recorded yet. Clean slate!
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={resolvedFilter === 'unresolved' ? 'purple' : 'ghost'}
            className="h-8 text-xs"
            onClick={() => setResolvedFilter('unresolved')}
          >
            Pending Revision ({pendingCount})
          </Button>
          <Button
            size="sm"
            variant={resolvedFilter === 'overdue' ? 'destructive' : 'ghost'}
            className="h-8 text-xs"
            onClick={() => setResolvedFilter('overdue')}
          >
            Overdue ({overdueCount})
          </Button>
          <Button
            size="sm"
            variant={resolvedFilter === 'all' ? 'secondary' : 'ghost'}
            className="h-8 text-xs"
            onClick={() => setResolvedFilter('all')}
          >
            All ({genuineMistakes.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search topic or takeaway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Section Filter */}
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="h-8 text-xs w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="Quant">Quant</SelectItem>
              <SelectItem value="DILR">DILR</SelectItem>
              <SelectItem value="VARC">VARC</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Concept gap">Concept gap</SelectItem>
              <SelectItem value="Calculation error">Calculation error</SelectItem>
              <SelectItem value="Misread question">Misread question</SelectItem>
              <SelectItem value="Time sink">Time sink</SelectItem>
              <SelectItem value="Wrong guess">Wrong guess</SelectItem>
              <SelectItem value="Option elimination">Option elimination</SelectItem>
              <SelectItem value="Set selection">Set selection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mistake Entries Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Topic & Source</th>
                  <th className="py-2.5 px-3">Mistake Category</th>
                  <th className="py-2.5 px-3 min-w-[200px]">What Went Wrong</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Rule For Next Time</th>
                  <th className="py-2.5 px-3 text-center">Revisit Date</th>
                  <th className="py-2.5 px-3 text-center">Re-solved</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMistakes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                      No mistake records found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredMistakes.map((m) => {
                    const isOverdue = !m.reSolved && m.revisitDate < todayStr;
                    return (
                      <tr key={m.id} className={`hover:bg-muted/30 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                          {m.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={m.section === 'Quant' ? 'quant' : m.section === 'DILR' ? 'dilr' : 'varc'} className="text-[9px] px-1.5 py-0">
                            {m.section}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-foreground block">{m.topic}</strong>
                          <span className="text-[10px] text-muted-foreground">{m.source} ({m.questionRef})</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px]">
                            {m.mistakeType}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-[11px] leading-relaxed">
                          {m.whatWentWrong}
                        </td>
                        <td className="py-2.5 px-3 text-purple-700 dark:text-purple-300 font-semibold text-[11px] leading-relaxed">
                          {m.ruleForNextTime}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                          <span className={isOverdue ? 'text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded' : 'text-muted-foreground'}>
                            {m.revisitDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={m.reSolved}
                            onCheckedChange={(checked) => updateMistake(m.id, { reSolved: Boolean(checked) })}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(m)}
                              title="Edit Mistake"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-400"
                              onClick={() => deleteMistake(m.id)}
                              title="Delete Mistake"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingMistake ? 'Edit Mistake Entry' : 'Record Mistake'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Root-cause analysis: categorize the error and set an actionable rule. Spaced repetition automatically sets revisit date to 7 days from now.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Section</label>
                <Select value={formSection} onValueChange={(v) => setFormSection(v as SectionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quant">Quant</SelectItem>
                    <SelectItem value="DILR">DILR</SelectItem>
                    <SelectItem value="VARC">VARC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Mistake Category</label>
                <Select value={formType} onValueChange={(v) => setFormType(v as MistakeCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concept gap">Concept gap</SelectItem>
                    <SelectItem value="Calculation error">Calculation error</SelectItem>
                    <SelectItem value="Misread question">Misread question</SelectItem>
                    <SelectItem value="Time sink">Time sink</SelectItem>
                    <SelectItem value="Wrong guess">Wrong guess</SelectItem>
                    <SelectItem value="Option elimination">Option elimination</SelectItem>
                    <SelectItem value="Set selection">Set selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Topic</label>
                <Input
                  placeholder="e.g. Modulus, Binary Logic, RC Tone"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Source & Q Ref</label>
                <Input
                  placeholder="e.g. SIMCAT 1 Q18 or PYQ 2022 Slot 2"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">What went wrong?</label>
              <Textarea
                placeholder="Explain why you made the mistake or spent too long..."
                value={formWhatWrong}
                onChange={(e) => setFormWhatWrong(e.target.value)}
                required
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Rule for next time</label>
              <Input
                placeholder="Actionable takeaway rule to apply in future problem solving..."
                value={formRule}
                onChange={(e) => setFormRule(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="default" size="sm">Save Mistake</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
