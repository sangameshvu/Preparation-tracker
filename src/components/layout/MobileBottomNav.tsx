import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Target,
  FileText,
  MoreHorizontal,
  BarChart3,
  BookOpen,
  Settings,
  Sparkles,
  Compass,
  Clock,
  ShieldCheck,
  Sun,
  Moon,
  Bot,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface MobileBottomNavProps {
  onOpenCoach?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCoach }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, studyNotes } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const mainTabs = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Plan', path: '/plan', icon: Layers },
    {
      name: 'Practice',
      path: '/practice',
      icon: Target,
      badge: stats.overdueMistakesCount > 0 ? stats.overdueMistakesCount : undefined
    },
    {
      name: 'Notes',
      path: '/notes',
      icon: FileText,
      badge: studyNotes.length > 0 ? studyNotes.length : undefined
    }
  ];

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = ['/insights', '/analytics', '/history', '/guide', '/resources', '/routines', '/admin', '/settings'].some(
    (p) => location.pathname.startsWith(p)
  );

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 h-16 glass-regular rounded-full border px-2 flex items-center justify-around shadow-2xl"
      >
        {mainTabs.map((tab) => {
          const active = isTabActive(tab.path);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-[10px] font-medium transition-all relative py-1 rounded-full',
                active
                  ? 'glass-thin bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-400/40 shadow-xs'
                  : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-4.5 w-4.5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[8px] font-bold text-white tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{tab.name}</span>
            </NavLink>
          );
        })}

        {/* 5th Slot: More Tab */}
        <button
          type="button"
          onClick={() => setMoreDrawerOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-[10px] font-medium transition-all cursor-pointer py-1 rounded-full',
            isMoreActive
              ? 'glass-thin bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-400/40 shadow-xs'
              : 'text-muted-foreground'
          )}
        >
          <MoreHorizontal className="h-4.5 w-4.5" />
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      {/* "More" Bottom Sheet Drawer */}
      <DialogPrimitive.Root open={moreDrawerOpen} onOpenChange={setMoreDrawerOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[28px] glass-thick p-6 shadow-2xl max-h-[85vh] overflow-y-auto focus:outline-hidden">
            <div className="mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <DialogPrimitive.Title className="text-base font-bold text-foreground">
                More Destinations & Utilities
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-full p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="py-4 space-y-4">
              {/* AI Study Coach & Assistant */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  AI Intelligence
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    navigate('/ai-coach');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl glass-tint text-white shadow-md text-left cursor-pointer"
                >
                  <Bot className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="text-sm font-bold block">AI Study Coach & Assistant</span>
                    <span className="text-xs text-white/80">Coach Mode & General Assistant Mode</span>
                  </div>
                </button>
              </div>

              {/* Daily Vocabulary */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Daily Vocabulary & Roots
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    navigate('/vocabulary');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100/50 transition-colors text-left"
                >
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <span className="text-sm font-semibold text-foreground block">Daily Vocabulary</span>
                    <span className="text-xs text-muted-foreground">5 High-Frequency Words + 5 Roots (10/day)</span>
                  </div>
                </button>
              </div>

              {/* Insights */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Analytics & History
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    navigate('/insights');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 hover:bg-blue-50/50 transition-colors text-left"
                >
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-sm font-semibold text-foreground block">Insights Hub</span>
                    <span className="text-xs text-muted-foreground">Score progression & daily study audit</span>
                  </div>
                </button>
              </div>

              {/* Library */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Library & Reference
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDrawerOpen(false);
                      navigate('/guide');
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-left"
                  >
                    <Compass className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold">Prep Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreDrawerOpen(false);
                      navigate('/resources');
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-left"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold">Resources</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreDrawerOpen(false);
                      navigate('/routines');
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-left"
                  >
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold">Routines</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMoreDrawerOpen(false);
                      navigate('/admin');
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-left"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold">Data Backup</span>
                  </button>
                </div>
              </div>

              {/* System & Settings */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  System
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreDrawerOpen(false);
                      navigate('/settings');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-xs font-semibold"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-border/60 text-xs font-semibold"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-blue-500" />
                    )}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>

              {/* AI Coach Action */}
              {onOpenCoach && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreDrawerOpen(false);
                    onOpenCoach();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  <Bot className="h-4 w-4" />
                  <span>Ask AI Study Coach</span>
                </button>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};
