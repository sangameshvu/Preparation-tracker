import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  ShieldCheck,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  Database,
  Layers,
  BookOpen,
  Calendar,
  Compass,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';

export const AdminPanelPage: React.FC = () => {
  const { profile, weeklyPlans, updateWeeklyPlan, topics, resources, updateResource, addResource, deleteResource, guideSections, updateGuideSection, resetAllData } = useAppData();

  const [activeTab, setActiveTab] = useState<'weeks' | 'topics' | 'resources' | 'guide' | 'database'>('weeks');
  const [editingWeek, setEditingWeek] = useState<(typeof weeklyPlans)[0] | null>(null);
  const [editingGuide, setEditingGuide] = useState<(typeof guideSections)[0] | null>(null);

  // Week editing state
  const [quantPlan, setQuantPlan] = useState('');
  const [dilrPlan, setDilrPlan] = useState('');
  const [varcPlan, setVarcPlan] = useState('');
  const [testsPlanned, setTestsPlanned] = useState('');
  const [milestoneAdmin, setMilestoneAdmin] = useState('');

  // Guide editing state
  const [guideTitle, setGuideTitle] = useState('');
  const [guideContent, setGuideContent] = useState('');

  const handleOpenEditWeek = (w: (typeof weeklyPlans)[0]) => {
    setEditingWeek(w);
    setQuantPlan(w.quantPlan);
    setDilrPlan(w.dilrPlan);
    setVarcPlan(w.varcPlan);
    setTestsPlanned(w.testsPlanned);
    setMilestoneAdmin(w.milestoneAdmin);
  };

  const handleSaveWeek = () => {
    if (!editingWeek) return;
    updateWeeklyPlan(editingWeek.id, {
      quantPlan,
      dilrPlan,
      varcPlan,
      testsPlanned,
      milestoneAdmin,
    });
    setEditingWeek(null);
  };

  const handleOpenEditGuide = (g: (typeof guideSections)[0]) => {
    setEditingGuide(g);
    setGuideTitle(g.title);
    setGuideContent(g.contentMarkdown);
  };

  const handleSaveGuide = () => {
    if (!editingGuide) return;
    updateGuideSection(editingGuide.id, {
      title: guideTitle,
      contentMarkdown: guideContent,
    });
    setEditingGuide(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">System Administration Suite</h1>
            <Badge variant="purple" className="text-xs gap-1">
              <ShieldCheck className="h-3 w-3" />
              Owner Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-5 h-9 w-full">
          <TabsTrigger value="weeks" className="text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Weekly Plans (52)</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Master Topics (53)</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Resources (28)</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="text-xs gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prep Guide</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="text-xs gap-1.5">
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: WEEKLY PLANS */}
        <TabsContent value="weeks" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Manage 52 Weekly Study Plans</CardTitle>
              <CardDescription className="text-xs">
                Edit the master Quant, DILR, and VARC syllabus assignments, milestones, and test schedules for any week.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Week</th>
                      <th className="py-2.5 px-3">Quant Syllabus</th>
                      <th className="py-2.5 px-3">DILR</th>
                      <th className="py-2.5 px-3">VARC</th>
                      <th className="py-2.5 px-3">Tests</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {weeklyPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold">W{plan.weekNumber}</td>
                        <td className="py-2.5 px-3 text-muted-foreground line-clamp-1 max-w-[200px]">{plan.quantPlan}</td>
                        <td className="py-2.5 px-3 text-muted-foreground line-clamp-1 max-w-[180px]">{plan.dilrPlan}</td>
                        <td className="py-2.5 px-3 text-muted-foreground line-clamp-1 max-w-[180px]">{plan.varcPlan}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{plan.testsPlanned || '–'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleOpenEditWeek(plan)}
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TOPICS */}
        <TabsContent value="topics" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Master Topics Registry (53 Topics)</CardTitle>
              <CardDescription className="text-xs">
                Inspect the system master topic catalog extracted from the workbook.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Area</th>
                      <th className="py-2.5 px-3">Topic Name</th>
                      <th className="py-2.5 px-3">Subtopics</th>
                      <th className="py-2.5 px-3">Week</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {topics.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{t.sortOrder}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={t.section === 'Quant' ? 'quant' : t.section === 'DILR' ? 'dilr' : 'varc'} className="text-[9px] px-1.5 py-0">
                            {t.section}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{t.area}</td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">{t.topicName}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-[11px] max-w-[280px] truncate">{t.subtopics || '–'}</td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">W{t.planWeek}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RESOURCES */}
        <TabsContent value="resources" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Manage Resources & URLs</CardTitle>
              <CardDescription className="text-xs">
                Update URLs, names, or phase usage for all 28 curated study resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border/80 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Resource Name</th>
                      <th className="py-2.5 px-3">Intended Usage</th>
                      <th className="py-2.5 px-3">URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-purple-400">{res.section}</td>
                        <td className="py-2.5 px-3 font-medium text-foreground">{res.resourceName}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{res.intendedUsage}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {res.url}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: PREPARATION GUIDE */}
        <TabsContent value="guide" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Manage PDF Blueprint Sections</CardTitle>
              <CardDescription className="text-xs">
                Edit markdown text for any section of the preparation guide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {guideSections.map((sec) => (
                <div key={sec.id} className="p-3.5 rounded-xl border border-border/70 flex items-center justify-between">
                  <div>
                    <strong className="text-sm text-foreground block">{sec.title}</strong>
                    <span className="text-[10px] font-mono text-muted-foreground">Key: {sec.sectionKey}</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleOpenEditGuide(sec)}>
                    <Edit2 className="h-3 w-3" />
                    <span>Edit Markdown</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: DATABASE MAINTENANCE */}
        <TabsContent value="database" className="pt-4">
          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="text-base font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Database Administration & Factory Reset</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Destructive operations. Resetting data restores the pristine initial state from the source Excel workbook and PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                <strong className="text-xs font-semibold text-foreground block">
                  Re-Seed Master Workbook Data
                </strong>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Restores all 52 weekly plans, 53 topics, 28 resources, 3 routines, and PDF blueprint content to default workbook values.
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-2 text-xs gap-1.5"
                  onClick={() => {
                    if (window.confirm('Confirm factory reset? All custom notes, tasks, mocks, and mistakes will be cleared.')) {
                      resetAllData();
                    }
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Execute Factory Reset</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Week Dialog */}
      <Dialog open={Boolean(editingWeek)} onOpenChange={(open) => !open && setEditingWeek(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Week {editingWeek?.weekNumber} Syllabus Plan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update the weekly subject assignments. Changes immediately reflect in the Weekly Planner and Home Dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium text-muted-foreground block mb-1">Quant Syllabus</label>
              <Textarea value={quantPlan} onChange={(e) => setQuantPlan(e.target.value)} rows={2} />
            </div>

            <div>
              <label className="font-medium text-muted-foreground block mb-1">DILR Syllabus</label>
              <Textarea value={dilrPlan} onChange={(e) => setDilrPlan(e.target.value)} rows={2} />
            </div>

            <div>
              <label className="font-medium text-muted-foreground block mb-1">VARC Syllabus</label>
              <Textarea value={varcPlan} onChange={(e) => setVarcPlan(e.target.value)} rows={2} />
            </div>

            <div>
              <label className="font-medium text-muted-foreground block mb-1">Tests Scheduled</label>
              <Input value={testsPlanned} onChange={(e) => setTestsPlanned(e.target.value)} />
            </div>

            <div>
              <label className="font-medium text-muted-foreground block mb-1">Milestones & Admin Reminders</label>
              <Input value={milestoneAdmin} onChange={(e) => setMilestoneAdmin(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditingWeek(null)}>Cancel</Button>
            <Button variant="default" size="sm" onClick={handleSaveWeek}>Save Week Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Guide Dialog */}
      <Dialog open={Boolean(editingGuide)} onOpenChange={(open) => !open && setEditingGuide(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Blueprint Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium text-muted-foreground block mb-1">Title</label>
              <Input value={guideTitle} onChange={(e) => setGuideTitle(e.target.value)} />
            </div>
            <div>
              <label className="font-medium text-muted-foreground block mb-1">Markdown Content</label>
              <Textarea value={guideContent} onChange={(e) => setGuideContent(e.target.value)} rows={10} className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditingGuide(null)}>Cancel</Button>
            <Button variant="default" size="sm" onClick={handleSaveGuide}>Save Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
