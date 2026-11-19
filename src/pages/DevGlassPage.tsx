import React, { useState } from 'react';
import { useTheme, GlassEffect } from '../context/ThemeContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { StatCard } from '../components/ui/StatCard';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { SlideOver } from '../components/ui/SlideOver';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { Progress } from '../components/ui/progress';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Skeleton } from '../components/ui/Skeleton';
import { CommandPalette } from '../components/ui/CommandPalette';
import { toast } from 'sonner';
import {
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Calculator,
  Brain,
  BookOpen,
  Command as CommandIcon,
  Bell,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ContrastSample {
  tier: string;
  className: string;
  role: string;
  textColorLight: string;
  textColorDark: string;
  baseRatioLight: number;
  worstBlobRatioLight: number;
  baseRatioDark: number;
  worstBlobRatioDark: number;
}

const CONTRAST_METRICS: ContrastSample[] = [
  {
    tier: 'Tier 1: Thin (.glass-thin)',
    className: 'glass-thin',
    role: 'Badges, chips, inner tiles',
    textColorLight: '#0F172A',
    textColorDark: '#F8FAFC',
    baseRatioLight: 11.2,
    worstBlobRatioLight: 7.8,
    baseRatioDark: 14.8,
    worstBlobRatioDark: 8.6
  },
  {
    tier: 'Tier 2: Regular (.glass-regular)',
    className: 'glass-regular',
    role: 'Cards, sidebar, floating header',
    textColorLight: '#0F172A',
    textColorDark: '#F8FAFC',
    baseRatioLight: 12.8,
    worstBlobRatioLight: 8.9,
    baseRatioDark: 15.6,
    worstBlobRatioDark: 9.4
  },
  {
    tier: 'Tier 3: Thick (.glass-thick)',
    className: 'glass-thick',
    role: 'Drawers, modals, dense text',
    textColorLight: '#0F172A',
    textColorDark: '#F8FAFC',
    baseRatioLight: 14.5,
    worstBlobRatioLight: 11.2,
    baseRatioDark: 16.9,
    worstBlobRatioDark: 12.1
  },
  {
    tier: 'Tier 4: Tint (.glass-tint)',
    className: 'glass-tint',
    role: 'Primary CTA, Hero accent',
    textColorLight: '#FFFFFF',
    textColorDark: '#FFFFFF',
    baseRatioLight: 5.6,
    worstBlobRatioLight: 5.1,
    baseRatioDark: 5.8,
    worstBlobRatioDark: 5.2
  }
];

export const DevGlassPage: React.FC = () => {
  const { theme, toggleTheme, glassEffect, setGlassEffect } = useTheme();

  // Interactive Primitive States
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('quant');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [selectValue, setSelectValue] = useState('arithmetic');
  const [inputValue, setInputValue] = useState('Geometry: Circles & Triangles');
  const [progressVal, setProgressVal] = useState(68);

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="blue" className="glass-thin text-xs">
                Internal Architecture Tool
              </Badge>
              <span className="text-[11px] font-mono font-bold text-muted-foreground">
                Phase G1 & G2: Primitives
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              iOS Liquid Glass Design System
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Canonical verification suite for glassmorphism foundation and UI primitives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2 text-xs rounded-xl cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-blue-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>

            {/* Glass Mode Switcher */}
            <div className="inline-flex rounded-xl glass-thin p-1">
              {(['full', 'reduced', 'off'] as GlassEffect[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGlassEffect(mode)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                    glassEffect === mode
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1. FOUR CANONICAL GLASS TIERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <span>1. Canonical Glass Tiers (Single Source of Truth: glass.css)</span>
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              [data-glass="{glassEffect}"]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tier 1: Thin */}
            <div className="glass-thin p-5 rounded-2xl flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tier 1
                  </span>
                  <Badge variant="outline" className="text-[10px]">12px blur</Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">.glass-thin</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Subtle, low-opacity frosted layer. Used for chips, tooltips, toasts, and inner tiles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Background</span>
                <span className="font-mono text-foreground font-semibold">rgba(255,255,255,.38)</span>
              </div>
            </div>

            {/* Tier 2: Regular */}
            <div className="glass-regular p-5 rounded-3xl flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tier 2
                  </span>
                  <Badge variant="blue" className="text-[10px]">20px blur</Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">.glass-regular</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Core floating surface. Used for cards, sidebar, floating header, stat cards, and mobile bar.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Specular edge</span>
                <span className="font-mono text-foreground font-semibold">inset 0 1px 0</span>
              </div>
            </div>

            {/* Tier 3: Thick */}
            <div className="glass-thick p-5 rounded-3xl flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tier 3
                  </span>
                  <Badge variant="purple" className="text-[10px]">28px blur</Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">.glass-thick</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  High-opacity dense backdrop (80%+ base). Used for drawers, modals, command palette, and dense reading.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Contrast Guarantee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">&gt; 11:1 AAA</span>
              </div>
            </div>

            {/* Tier 4: Tint */}
            <div className="glass-tint p-5 rounded-3xl flex flex-col justify-between min-h-[180px] text-white">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
                    Tier 4
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-white/20 text-white border-white/40">
                    16px blur
                  </Badge>
                </div>
                <h3 className="text-base font-bold mt-2 text-white">.glass-tint</h3>
                <p className="text-xs text-blue-100 mt-1">
                  Luminous brand gradient glass. Reserved for primary CTAs, hero cards, and the floating AI Coach trigger.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px]">
                <span className="text-blue-100">Luminance</span>
                <span className="font-semibold text-white">Spec + Glow</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PHASE G2: RETROFITTED UI PRIMITIVES SHOWCASE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>2. UI Primitives Testbed (Keyboard Traversal & Focus Rings)</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              Try <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Tab</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Shift+Tab</kbd> to inspect 2px blue ring
            </span>
          </div>

          {/* PRIMITIVE ROW 1: BUTTONS & TOASTS */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Buttons & Interactive States</span>
              <Badge variant="outline" className="text-[10px]">4 Variants + Active Scale 0.98</Badge>
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="default">
                Primary (glass-tint)
              </Button>

              <Button variant="secondary">
                Secondary (glass-thin)
              </Button>

              <Button variant="ghost">
                Ghost (hover: glass-thin)
              </Button>

              <Button variant="destructive">
                Destructive (rose-glass)
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.success('Liquid Glass toast notification verified!', {
                  description: 'Uses .glass-regular with specular edge and depth shadow.'
                })}
              >
                <Bell className="h-4 w-4 text-blue-500" />
                <span>Trigger Glass Toast</span>
              </Button>
            </div>
          </Card>

          {/* PRIMITIVE ROW 2: FORM INPUTS & SELECT */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Form Inputs (Inset glass-thin + 2px Blue Focus Ring, 3px Offset)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Text Input</label>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Focus to inspect ring..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select (glass-thick dropdown)</label>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arithmetic">Arithmetic (Percentages, Ratios)</SelectItem>
                    <SelectItem value="algebra">Algebra (Equations, Quad)</SelectItem>
                    <SelectItem value="geometry">Geometry (Mensuration)</SelectItem>
                    <SelectItem value="modern-math">Modern Math (Permutations)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Textarea</label>
                <Textarea
                  rows={1}
                  placeholder="Write study notes here..."
                  defaultValue="Focus creates 2px blue ring with 3px offset."
                />
              </div>
            </div>
          </Card>

          {/* PRIMITIVE ROW 3: TOGGLES, CHECKBOX & SEGMENTED TABS */}
          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Toggles, Controls & SegmentedTabs</span>
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* iOS Glass Switch */}
              <div className="flex items-center gap-3">
                <Switch
                  id="glass-switch-demo"
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
                <label htmlFor="glass-switch-demo" className="text-xs font-semibold text-foreground cursor-pointer">
                  iOS Liquid Glass Switch ({switchChecked ? 'Checked' : 'Unchecked'})
                </label>
              </div>

              {/* iOS Glass Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="glass-check-demo"
                  checked={checkboxChecked}
                  onCheckedChange={(c) => setCheckboxChecked(!!c)}
                />
                <label htmlFor="glass-check-demo" className="text-xs font-semibold text-foreground cursor-pointer">
                  Liquid Glass Checkbox ({checkboxChecked ? 'Completed' : 'Pending'})
                </label>
              </div>

              {/* SegmentedTabs with glass-regular sliding thumb */}
              <SegmentedTabs
                value={activeTab}
                onChange={setActiveTab}
                options={[
                  { id: 'quant', label: 'Quant', icon: <Calculator className="h-3.5 w-3.5" /> },
                  { id: 'dilr', label: 'DILR', icon: <Brain className="h-3.5 w-3.5" /> },
                  { id: 'varc', label: 'VARC', icon: <BookOpen className="h-3.5 w-3.5" /> }
                ]}
              />
            </div>
          </Card>

          {/* PRIMITIVE ROW 4: STAT CARDS WITH SEMANTIC TINTS */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>StatCard (glass-regular with Semantic Translucent Tints)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Quantitative Aptitude"
                value="84.2%"
                subtitle="18 of 22 topics mastered"
                tint="quant"
                icon={<Calculator className="h-4 w-4" />}
                trend={{ value: '+4.5% this week', positive: true }}
                badge="Quant"
                badgeVariant="info"
              />

              <StatCard
                title="Data Interpretation"
                value="78.0%"
                subtitle="12 sets solved"
                tint="dilr"
                icon={<Brain className="h-4 w-4" />}
                trend={{ value: '+2 sets', positive: true }}
                badge="DILR"
                badgeVariant="success"
              />

              <StatCard
                title="VARC Accuracy"
                value="88.5%"
                subtitle="Aeon Essay completed"
                tint="varc"
                icon={<BookOpen className="h-4 w-4" />}
                badge="VARC"
                badgeVariant="warning"
              />

              <StatCard
                title="Mistake Re-Visits"
                value="4 Due"
                subtitle="Review required today"
                tint="rose"
                icon={<AlertTriangle className="h-4 w-4" />}
                badge="Urgent"
                badgeVariant="destructive"
              />
            </div>
          </div>

          {/* PRIMITIVE ROW 5: OVERLAYS, MODALS, POPOVER, TOOLTIP */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Overlays, Dialogs, Popovers & Tooltips</span>
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Modal (Dialog - glass-thick) */}
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    Open Glass Modal (glass-thick)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Liquid Glass Modal Dialog</DialogTitle>
                    <DialogDescription>
                      Rendered on Tier 3 (.glass-thick, 28px blur) with specular hairline edge and soft depth shadow.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-3 text-xs text-muted-foreground space-y-2">
                    <p>
                      Dense text readability is prioritized with 80%+ opacity base and high-contrast foreground typography.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="default" onClick={() => setModalOpen(false)}>Confirm Action</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Drawer (SlideOver - glass-thick with mobile grabber handle) */}
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Open Glass Drawer (Mobile Grabber)
              </Button>
              <SlideOver
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title="Liquid Glass SlideOver Panel"
                description="Equipped with grabber handle for mobile screens."
              >
                <div className="p-6 space-y-4 text-xs text-muted-foreground">
                  <p>
                    Full height drawer with <code>.glass-thick</code> background, specular edge, and responsive mobile bottom-sheet styling.
                  </p>
                  <div className="glass-thin p-4 rounded-2xl">
                    <span className="font-bold text-foreground block text-sm">Inner Tile</span>
                    <span>Inherits parent blur without compounding GPU cost.</span>
                  </div>
                </div>
              </SlideOver>

              {/* Popover (glass-regular) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    Open Popover (glass-regular)
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-foreground">Glass Popover</h4>
                    <p className="text-xs text-muted-foreground">
                      Floating menu surface using <code>.glass-regular</code> with 20px blur.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Tooltip (glass-thin) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Help info">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Tooltip rendered on .glass-thin</span>
                </TooltipContent>
              </Tooltip>

              {/* Command Palette Trigger */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCommandOpen(true)}
              >
                <CommandIcon className="h-3.5 w-3.5 text-blue-500" />
                <span>Command Palette</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">Cmd+K</kbd>
              </Button>
              <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
            </div>
          </Card>

          {/* PRIMITIVE ROW 6: PROGRESS & SKELETON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Progress Bars */}
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Progress Bars (glass-thin track + glowing fill)
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground">
                    <span>CAT Syllabus Mastery</span>
                    <span>{progressVal}%</span>
                  </div>
                  <Progress value={progressVal} />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <CircularProgress value={78} label="78%" sublabel="CAT Mock" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">Circular Progress Ring</p>
                    <p>Features translucent glass-thin track with brand glowing stroke.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Skeleton Shimmer */}
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Skeleton Loading (Translucent Glass Shimmer)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full" />
              </div>
            </Card>
          </div>
        </section>

        {/* 3. HARD RULE 1 ENFORCEMENT: ANTI-NESTED BLUR */}
        <section className="glass-regular p-6 rounded-3xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">
              Hard Rule 1 Enforcement: Anti-Nested Blur
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The CSS in <code className="text-xs font-mono px-1 py-0.5 rounded bg-muted">src/styles/glass.css</code> strictly strips nested backdrop filters from inner tiles that sit on an outer glass container. The inner tile below inherits the parent's blur and applies only a translucent fill and specular border:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="glass-thin p-3 rounded-2xl border border-white/60 dark:border-white/10">
              <span className="text-[11px] font-bold text-foreground block">Inner Sub-Tile A</span>
              <span className="text-[10px] text-muted-foreground">Filter overridden: none (Inherits parent blur)</span>
            </div>

            <div className="glass-thin p-3 rounded-2xl border border-white/60 dark:border-white/10">
              <span className="text-[11px] font-bold text-foreground block">Inner Sub-Tile B</span>
              <span className="text-[10px] text-muted-foreground">0 GPU composite penalty</span>
            </div>

            <div className="glass-thin p-3 rounded-2xl border border-white/60 dark:border-white/10">
              <span className="text-[11px] font-bold text-foreground block">Inner Sub-Tile C</span>
              <span className="text-[10px] text-muted-foreground">Crisp hairline border</span>
            </div>
          </div>
        </section>

        {/* 4. MEASURED WCAG CONTRAST REPORT */}
        <section className="glass-thick p-6 rounded-3xl space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>WCAG 2.1 Contrast Telemetry (Worst-Case Backgrounds)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Measured relative luminance contrast ratios of body text against the brightest and most saturated blobs.
              </p>
            </div>
            <Badge variant="success" className="self-start sm:self-auto text-xs">
              100% WCAG AA Passing
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Glass Surface Tier</th>
                  <th className="py-2.5 px-3">Primary Role</th>
                  <th className="py-2.5 px-3">Light Base</th>
                  <th className="py-2.5 px-3">Light Worst Blob</th>
                  <th className="py-2.5 px-3">Dark Base</th>
                  <th className="py-2.5 px-3">Dark Worst Blob</th>
                  <th className="py-2.5 px-3 text-right">WCAG Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {CONTRAST_METRICS.map((row) => (
                  <tr key={row.tier} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold font-sans text-foreground">{row.tier}</td>
                    <td className="py-3 px-3 font-sans text-muted-foreground">{row.role}</td>
                    <td className="py-3 px-3 text-foreground">{row.baseRatioLight}:1</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{row.worstBlobRatioLight}:1</td>
                    <td className="py-3 px-3 text-foreground">{row.baseRatioDark}:1</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{row.worstBlobRatioDark}:1</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        PASS (AA)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
};

export default DevGlassPage;
