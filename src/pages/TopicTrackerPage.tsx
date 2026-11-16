import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Edit2,
  Filter,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SectionType, ConfidenceScore } from '../types';

export const TopicTrackerPage: React.FC = () => {
  const { topics, topicProgress, updateTopicProgress } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'All' | SectionType>('All');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'sortOrder' | 'confidence' | 'planWeek'>('sortOrder');
  const [sortAsc, setSortAsc] = useState(true);

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

  const getConfidenceBadge = (level: ConfidenceScore) => {
    switch (level) {
      case 1:
        return (
          <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-mono">
            L1: Unfamiliar
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-mono">
            L2: Weak
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
            L3: Average
          </Badge>
        );
      case 4:
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            L4: Good
          </Badge>
        );
      case 5:
        return (
          <Badge className="bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] font-mono">
            L5: Mastered
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">CAT Master Topic Tracker</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete syllabus catalog (53 topics). Track concepts, practice problems, PYQs, and 5-level mastery ratings.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Section Tabs */}
          {(['All', 'Quant', 'DILR', 'VARC'] as const).map((sec) => (
            <Button
              key={sec}
              size="sm"
              variant={sectionFilter === sec ? 'purple' : 'ghost'}
              className="h-8 text-xs font-semibold"
              onClick={() => setSectionFilter(sec)}
            >
              {sec} {sec === 'All' ? '(53)' : sec === 'Quant' ? '(25)' : sec === 'DILR' ? '(18)' : '(10)'}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search topic or subtopics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Confidence Filter */}
          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
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

      {/* Topics Master Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center cursor-pointer" onClick={() => toggleSort('sortOrder')}>
                    #
                  </th>
                  <th className="py-3 px-3">Subject / Area</th>
                  <th className="py-3 px-3 min-w-[200px]">Topic & Subtopics</th>
                  <th className="py-3 px-3 text-center">Week</th>
                  <th className="py-3 px-3 text-center">Concept</th>
                  <th className="py-3 px-3 text-center">Practice</th>
                  <th className="py-3 px-3 text-center">PYQs</th>
                  <th className="py-3 px-3 text-center cursor-pointer" onClick={() => toggleSort('confidence')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Confidence</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">Rev 1</th>
                  <th className="py-3 px-3 text-center">Rev 2</th>
                  <th className="py-3 px-3 text-center">Actions</th>
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

                  return (
                    <React.Fragment key={topic.id}>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-center text-muted-foreground">
                          {topic.sortOrder}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <Badge
                              variant={topic.section === 'Quant' ? 'quant' : topic.section === 'DILR' ? 'dilr' : 'varc'}
                              className="w-fit text-[9px] px-1 py-0 mb-0.5"
                            >
                              {topic.section}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground font-medium">{topic.area}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs">{topic.topicName}</span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">{topic.subtopics || '–'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                          W{topic.planWeek}
                        </td>
                        {/* Concept Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={tp.conceptDone}
                            onCheckedChange={(checked) =>
                              updateTopicProgress(topic.id, { conceptDone: Boolean(checked) })
                            }
                          />
                        </td>
                        {/* Practice Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={tp.practiceDone}
                            onCheckedChange={(checked) =>
                              updateTopicProgress(topic.id, { practiceDone: Boolean(checked) })
                            }
                          />
                        </td>
                        {/* PYQs Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={tp.pyqsDone}
                            onCheckedChange={(checked) =>
                              updateTopicProgress(topic.id, { pyqsDone: Boolean(checked) })
                            }
                          />
                        </td>
                        {/* Confidence 1-5 */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Select
                              value={String(tp.confidence)}
                              onValueChange={(val) =>
                                updateTopicProgress(topic.id, { confidence: parseInt(val, 10) as ConfidenceScore })
                              }
                            >
                              <SelectTrigger className="h-6 text-[10px] px-2 w-[110px]">
                                <SelectValue>{getConfidenceBadge(tp.confidence)}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1: Unfamiliar</SelectItem>
                                <SelectItem value="2">2: Weak</SelectItem>
                                <SelectItem value="3">3: Average</SelectItem>
                                <SelectItem value="4">4: Good</SelectItem>
                                <SelectItem value="5">5: Mastered</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        {/* Rev 1 */}
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={tp.revision1Done}
                            onCheckedChange={(checked) =>
                              updateTopicProgress(topic.id, { revision1Done: Boolean(checked) })
                            }
                          />
                        </td>
                        {/* Rev 2 */}
                        <td className="py-2.5 px-3 text-center">
                          <Checkbox
                            checked={tp.revision2Done}
                            onCheckedChange={(checked) =>
                              updateTopicProgress(topic.id, { revision2Done: Boolean(checked) })
                            }
                          />
                        </td>
                        {/* Expand Details */}
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                            title="Expand notes"
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </td>
                      </tr>

                      {/* Expandable Subtopic & Notes Drawer */}
                      {isExpanded && (
                        <tr className="bg-muted/15 border-b border-border/70">
                          <td colSpan={11} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                                  Granular Subtopics Syllabus:
                                </span>
                                <p className="text-xs text-muted-foreground bg-background p-3 rounded-lg border border-border/80">
                                  {topic.subtopics || 'No granular subtopics specified.'}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                                  Personal Topic Revision Notes:
                                </span>
                                <Input
                                  placeholder="Add quick reminders, formula tags, or weak problem types..."
                                  value={tp.notes || ''}
                                  onChange={(e) => updateTopicProgress(topic.id, { notes: e.target.value })}
                                  className="text-xs"
                                />
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
