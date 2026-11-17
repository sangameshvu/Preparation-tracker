import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Calendar as CalendarIcon,
  Clock,
  History,
  CheckCircle2,
  BookOpen,
  Trophy,
  AlertTriangle,
  Flame,
  FileText,
  Filter,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ActivityCategory, SectionType } from '../types';
import { format, parseISO, subDays, addDays } from 'date-fns';

export const HistoryPage: React.FC = () => {
  const { activities, addActivity, deleteActivity } = useAppData();

  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [sectionFilter, setSectionFilter] = useState<'all' | SectionType>('all');

  // Manual Session Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDetails, setManualDetails] = useState('');
  const [manualSection, setManualSection] = useState<SectionType>('Quant');
  const [manualCategory, setManualCategory] = useState<ActivityCategory>('topic');
  const [manualDuration, setManualDuration] = useState(45);
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleCreateManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    addActivity({
      date: manualDate,
      category: manualCategory,
      title: manualTitle.trim(),
      details: manualDetails.trim() || undefined,
      section: manualSection,
      durationMinutes: Number(manualDuration) || 30
    });
    setManualTitle('');
    setManualDetails('');
    setIsDialogOpen(false);
  };

  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const map: Record<string, typeof activities> = {};
    activities.forEach((act) => {
      if (!map[act.date]) map[act.date] = [];
      map[act.date].push(act);
    });
    return map;
  }, [activities]);

  // Unique active dates
  const activeDates = Object.keys(activitiesByDate).sort().reverse();

  // Filtered activities for current selected date or view
  const currentDayActivities = useMemo(() => {
    const dayActs = activitiesByDate[selectedDate] || [];
    return dayActs.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (sectionFilter !== 'all' && a.section !== sectionFilter) return false;
      return true;
    });
  }, [activitiesByDate, selectedDate, categoryFilter, sectionFilter]);

  const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
    topic: <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    task: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    mock: <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    mistake: <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
    goal: <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
    note: <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
  };

  const handleDateShift = (direction: 'prev' | 'next') => {
    const current = parseISO(selectedDate);
    const shifted = direction === 'prev' ? subDays(current, 1) : addDays(current, 1);
    setSelectedDate(format(shifted, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Activity History</h1>
            <Badge variant="blue" className="font-mono text-xs">
              Daily Tracking
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Complete audit trail of what you studied and completed on every single date. Pick a day to view its detailed timeline.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Plus className="h-3.5 w-3.5" />
              <span>Log Study Session</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Log Study Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateManualSession} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Date</label>
                <Input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Activity Title</label>
                <Input
                  placeholder="e.g., Practiced 25 Time, Speed & Distance Questions"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Key Learnings / Details</label>
                <Input
                  placeholder="e.g., Mastered relative speed concepts for trains and circular tracks"
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Section</label>
                  <Select value={manualSection} onValueChange={(v) => setManualSection(v as SectionType)}>
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
                  <label className="text-xs font-medium text-foreground">Minutes</label>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Record Activity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 2. Date Navigation Ribbon */}
      <Card className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => handleDateShift('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-sm text-foreground">
                {format(parseISO(selectedDate), 'EEEE, dd MMMM yyyy')}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => handleDateShift('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'}
              size="sm"
              className={selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-600 text-white h-7 text-xs' : 'h-7 text-xs'}
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
            >
              Today
            </Button>
            <Button
              variant={selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'default' : 'outline'}
              size="sm"
              className={selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd') ? 'bg-blue-600 text-white h-7 text-xs' : 'h-7 text-xs'}
              onClick={() => setSelectedDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))}
            >
              Yesterday
            </Button>
            <Button
              variant={selectedDate === format(subDays(new Date(), 2), 'yyyy-MM-dd') ? 'default' : 'outline'}
              size="sm"
              className={selectedDate === format(subDays(new Date(), 2), 'yyyy-MM-dd') ? 'bg-blue-600 text-white h-7 text-xs' : 'h-7 text-xs'}
              onClick={() => setSelectedDate(format(subDays(new Date(), 2), 'yyyy-MM-dd'))}
            >
              2 Days Ago
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Daily Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-xl border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" />
                  <span>Activities Logged on {selectedDate}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentDayActivities.length} study events recorded on this date.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                  <SelectTrigger className="h-7 text-xs w-[110px] rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="topic">Topics</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="mock">Mocks</SelectItem>
                    <SelectItem value="mistake">Mistakes</SelectItem>
                    <SelectItem value="goal">Goals</SelectItem>
                    <SelectItem value="note">Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {currentDayActivities.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-foreground">No study activities recorded on this date</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Study activities automatically record as you complete topics, tasks, and mocks.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 text-xs"
                    onClick={() => {
                      setManualDate(selectedDate);
                      setIsDialogOpen(true);
                    }}
                  >
                    + Log Activity for {selectedDate}
                  </Button>
                </div>
              ) : (
                currentDayActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between p-3.5 rounded-xl border border-border/70 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-border/80 shadow-2xs">
                        {categoryIcons[act.category]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{act.title}</span>
                        {act.details && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{act.details}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          {act.section && (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{act.section}</span>
                          )}
                          {act.durationMinutes && <span>• {act.durationMinutes} mins</span>}
                          <span>• {format(parseISO(act.timestamp), 'hh:mm a')}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                      onClick={() => deleteActivity(act.id)}
                      title="Delete activity record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Active Dates Calendar Archive */}
        <div className="space-y-4">
          <Card className="rounded-xl border border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold">Past Study Dates Archive</CardTitle>
              <CardDescription className="text-xs">
                Jump directly to any date with recorded study history.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5">
              {activeDates.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No dates recorded yet.</p>
              ) : (
                activeDates.map((dateStr) => {
                  const count = activitiesByDate[dateStr]?.length || 0;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
                      }`}
                    >
                      <span className="font-mono">{dateStr}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                        }`}
                      >
                        {count} events
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
