import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  BookOpen,
  Calculator,
  Binary,
  BookMarked
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SectionType, ConfidenceScore } from '../types';
import { cn } from '../lib/utils';

export const TopicTrackerPage: React.FC = () => {
  const { topics, topicProgress, updateTopicProgress } = useAppData();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'All' | SectionType>('All');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'sortOrder' | 'confidence' | 'planWeek'>('sortOrder');
  const [sortAsc, setSortAsc] = useState(true);

  // Sync with URL query parameter ?section=Quant etc.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const secParam = params.get('section');
    if (secParam && (secParam === 'Quant' || secParam === 'DILR' || secParam === 'VARC')) {
      setSectionFilter(secParam as SectionType);
    }
  }, [location.search]);

  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        if (sectionFilter !== 'All' && t.section !== sectionFilter) return false;
        if (confidenceFilter !== 'all') {
          const tp = topicProgress[t.id];
          const conf = tp ? tp.confidence : 1;
          if (confidenceFilter === 'priority' && conf > 2) return false;
          if (confidenceFilter !== 'priority' && conf !== parseInt(confidenceFilter, 10)) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.topicName.toLowerCase().includes(q);
          const matchSub = t.subtopics.toLowerCase().includes(q);
          const matchArea = t.area.toLowerCase().includes(q);
          if (!matchName && !matchSub && !matchArea) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'confidence') {
          const confA = topicProgress[a.id]?.confidence || 1;
          const confB = topicProgress[b.id]?.confidence || 1;
          return sortAsc ? confA - confB : confB - confA;
        }
        return sortAsc ? a.sortOrder - b.sortOrder : b.sortOrder - a.sortOrder;
      });
  }, [topics, topicProgress, sectionFilter, confidenceFilter, searchQuery, sortBy, sortAsc]);

  const toggleSort = (field: 'sortOrder' | 'confidence') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const confidenceMeta: Record<
    ConfidenceScore,
    { label: string; short: string; dot: string; triggerClass: string }
  > = {
    1: {
      label: '1: Unfamiliar',
      short: 'L1 · Unfamiliar',
      dot: 'bg-rose-500',
      triggerClass:
        'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30',
    },
    2: {
      label: '2: Weak',
      short: 'L2 · Weak',
      dot: 'bg-amber-500',
      triggerClass:
        'bg-amber-50 text-amber-700 border-amber-200/90 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30',
    },
    3: {
      label: '3: Average',
      short: 'L3 · Average',
      dot: 'bg-yellow-500',
      triggerClass:
        'bg-yellow-50 text-yellow-800 border-yellow-200/90 hover:bg-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-500/30',
    },
    4: {
      label: '4: Good',
      short: 'L4 · Good',
      dot: 'bg-blue-500',
      triggerClass:
        'bg-blue-50 text-blue-700 border-blue-200/90 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500/30',
    },
    5: {
      label: '5: Mastered',
      short: 'L5 · Mastered',
      dot: 'bg-emerald-500',
      triggerClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30',
    },
  };

  // Summary counts for current filter
  const currentSectionTopics = topics.filter((t) => sectionFilter === 'All' || t.section === sectionFilter);
  const completedInFilter = currentSectionTopics.filter((t) => {
    const tp = topicProgress[t.id];
    return tp && tp.conceptDone && tp.practiceDone && tp.pyqsDone;
  }).length;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {sectionFilter === 'All'
              ? 'CAT Master Topic Tracker'
              : sectionFilter === 'Quant'
              ? 'Quantitative Aptitude Track'
              : sectionFilter === 'DILR'
              ? 'Data Interpretation & Logical Reasoning'
              : 'Verbal Ability & Reading Comprehension'}
          </h1>
        </div>

        {/* Section Metrics Badge */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs self-start sm:self-auto">
          <span className="font-semibold text-foreground">Completed:</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {completedInFilter} of {currentSectionTopics.length}
          </span>
          <span className="text-muted-foreground">({Math.round((completedInFilter / (currentSectionTopics.length || 1)) * 100)}%)</span>
        </div>
      </div>

      {/* 2. Filter & Navigation Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Quant', 'DILR', 'VARC'] as const).map((sec) => (
            <Button
              key={sec}
              size="sm"
              variant={sectionFilter === sec ? 'default' : 'ghost'}
              className={cn(
                'h-8 text-xs font-semibold rounded-lg',
                sectionFilter === sec
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setSectionFilter(sec)}
            >
              {sec === 'All' ? 'All (53)' : sec === 'Quant' ? 'Quant (29)' : sec === 'DILR' ? 'DILR (13)' : 'VARC (11)'}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search topic or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>

          {/* Confidence Filter */}
          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="h-8 text-xs w-[130px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="priority">Priority (L1–L2)</SelectItem>
              <SelectItem value="1">L1: Unfamiliar</SelectItem>
              <SelectItem value="2">L2: Weak</SelectItem>
              <SelectItem value="3">L3: Average</SelectItem>
              <SelectItem value="4">L4: Good</SelectItem>
              <SelectItem value="5">L5: Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Topics Master Table */}
      <Card className="rounded-xl border border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center cursor-pointer" onClick={() => toggleSort('sortOrder')}>
                    #
                  </th>
                  <th className="py-3 px-3">Subject & Area</th>
                  <th className="py-3 px-3 min-w-[220px]">Topic & Subtopics</th>
                  <th className="py-3 px-3 text-center">Week</th>
                  <th className="py-3 px-3 text-center">Milestones</th>
                  <th className="py-3 px-3 w-[140px] min-w-[140px] text-center cursor-pointer" onClick={() => toggleSort('confidence')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Confidence</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTopics.map((topic) => {
                  const tp = topicProgress[topic.id] || {
                    topicId: topic.id,
                    conceptDone: false,
                    practiceDone: false,
                    pyqsDone: false,
                    confidence: 1,
                    revision1Done: false,
                    revision2Done: false,
                    updatedAt: new Date().toISOString()
                  };
                  const isExpanded = expandedTopicId === topic.id;

                  const milestoneCount =
                    (tp.conceptDone ? 1 : 0) +
                    (tp.practiceDone ? 1 : 0) +
                    (tp.pyqsDone ? 1 : 0) +
                    (tp.revision1Done ? 1 : 0) +
                    (tp.revision2Done ? 1 : 0);

                  return (
                    <React.Fragment key={topic.id}>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3 font-mono text-center text-muted-foreground">
                          {topic.sortOrder}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span
                              className={`w-fit text-[10px] font-semibold px-1.5 py-0.2 rounded mb-0.5 ${
                                topic.section === 'Quant'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                  : topic.section === 'DILR'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                              }`}
                            >
                              {topic.section}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">{topic.area}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs">{topic.topicName}</span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">{topic.subtopics || '–'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-muted-foreground">
                          W{topic.planWeek}
                        </td>
                        {/* Quick Milestones Progress */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground transition-colors"
                          >
                            <span>{milestoneCount}/5 Done</span>
                            <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        {/* Confidence Dropdown */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center">
                            <Select
                              value={String(tp.confidence)}
                              onValueChange={(val) =>
                                updateTopicProgress(topic.id, { confidence: parseInt(val, 10) as ConfidenceScore })
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  'h-7 w-[128px] px-2.5 py-0 rounded-full border text-[11px] font-semibold flex items-center justify-between gap-1 shadow-xs transition-colors shrink-0',
                                  confidenceMeta[tp.confidence].triggerClass
                                )}
                              >
                                <span className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                                  <span className={cn('h-2 w-2 rounded-full shrink-0', confidenceMeta[tp.confidence].dot)} />
                                  <span className="truncate">{confidenceMeta[tp.confidence].short}</span>
                                </span>
                              </SelectTrigger>
                              <SelectContent className="w-[145px]">
                                {([1, 2, 3, 4, 5] as ConfidenceScore[]).map((level) => (
                                  <SelectItem key={level} value={String(level)} className="text-xs cursor-pointer py-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className={cn('h-2 w-2 rounded-full shrink-0', confidenceMeta[level].dot)} />
                                      <span className="font-medium text-foreground">{confidenceMeta[level].label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        {/* Expand Details */}
                        <td className="py-3 px-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                            title="Expand milestones & notes"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>

                      {/* Expandable Milestone Checkboxes & Notes Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-border/70">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Milestones Checkboxes */}
                              <div className="space-y-2 p-3 rounded-xl border border-border/80 bg-card">
                                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                                  Milestone Checklist
                                </span>
                                <div className="space-y-2 text-xs">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                      checked={tp.conceptDone}
                                      onCheckedChange={(checked) =>
                                        updateTopicProgress(topic.id, { conceptDone: Boolean(checked) })
                                      }
                                    />
                                    <span>Core Concepts & Theory</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                      checked={tp.practiceDone}
                                      onCheckedChange={(checked) =>
                                        updateTopicProgress(topic.id, { practiceDone: Boolean(checked) })
                                      }
                                    />
                                    <span>Practice Problem Sets</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                      checked={tp.pyqsDone}
                                      onCheckedChange={(checked) =>
                                        updateTopicProgress(topic.id, { pyqsDone: Boolean(checked) })
                                      }
                                    />
                                    <span>Past Year CAT Questions (PYQs)</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                      checked={tp.revision1Done}
                                      onCheckedChange={(checked) =>
                                        updateTopicProgress(topic.id, { revision1Done: Boolean(checked) })
                                      }
                                    />
                                    <span>Revision 1 (Spaced Review)</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                      checked={tp.revision2Done}
                                      onCheckedChange={(checked) =>
                                        updateTopicProgress(topic.id, { revision2Done: Boolean(checked) })
                                      }
                                    />
                                    <span>Revision 2 (Mock Re-test)</span>
                                  </label>
                                </div>
                              </div>

                              {/* Granular Subtopics */}
                              <div className="space-y-1.5 p-3 rounded-xl border border-border/80 bg-card">
                                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                                  Granular Syllabus Subtopics
                                </span>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {topic.subtopics || 'No granular subtopics specified.'}
                                </p>
                              </div>

                              {/* Personal Topic Revision Notes */}
                              <div className="space-y-1.5 p-3 rounded-xl border border-border/80 bg-card">
                                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                                  Topic Reminders & Weak Problem Notes
                                </span>
                                <Input
                                  placeholder="Add quick reminders, formula tags, or weak problem types..."
                                  value={tp.notes || ''}
                                  onChange={(e) => updateTopicProgress(topic.id, { notes: e.target.value })}
                                  className="text-xs"
                                />
                                <span className="text-[10px] text-muted-foreground block">
                                  Changes automatically saved to topic record.
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
