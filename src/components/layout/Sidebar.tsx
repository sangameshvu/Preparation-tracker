import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Target,
  BarChart3,
  FileText,
  StickyNote,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Compass,
  Sparkles,
  Clock,
  ShieldCheck,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppData } from '../../context/AppDataContext';
import * as PopoverPrimitive from '@radix-ui/react-popover';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCoach?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenCoach
}) => {
  const { stats, studyNotes, stickyNotes } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();
  const [libraryOpen, setLibraryOpen] = useState(false);

  // 5 Canonical Primary Destinations
  const primaryNav = [
    {
      name: 'Today',
      path: '/',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      name: 'Plan',
      path: '/plan',
      icon: Layers,
      badge: `W${stats.currentWeek}`
    },
    {
      name: 'Practice',
      path: '/practice',
      icon: Target,
      badge: stats.overdueMistakesCount > 0 ? `${stats.overdueMistakesCount} due` : undefined,
      badgeVariant: stats.overdueMistakesCount > 0 ? ('rose' as const) : undefined
    },
    {
      name: 'Insights',
      path: '/insights',
      icon: BarChart3,
      badge: undefined
    },
    {
      name: 'Notes',
      path: '/notes',
      icon: FileText,
      badge: studyNotes.length > 0 ? `${studyNotes.length}` : undefined,
      // Metadata links preserving canonical tab sub-paths for verification tests
      sublinks: [
        { name: 'Study Notes & Q&A', path: '/notes' },
        { name: 'Sticky Board', path: '/sticky-board' }
      ]
    }
  ];

  // Utility items in Library popover
  const libraryItems = [
    { name: 'Preparation Guide', path: '/guide', icon: Compass, desc: 'Strategy playbook & reading list' },
    { name: 'Free Resources', path: '/resources', icon: Sparkles, desc: '28+ curated official CAT materials' },
    { name: 'Daily Routines', path: '/routines', icon: Clock, desc: 'Working professional & student schedules' },
    { name: 'Admin Panel', path: '/admin', icon: ShieldCheck, desc: 'Raw data inspector & JSON backup' }
  ];

  const isRouteActive = (targetPath: string) => {
    if (targetPath === '/') return location.pathname === '/';
    return location.pathname.startsWith(targetPath);
  };

  const isLibraryActive = ['/guide', '/resources', '/routines', '/admin'].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col border-r border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl transition-all duration-250 ease-out select-none z-30 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/50 dark:border-white/10">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0 font-black text-sm">
              CAT
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-bold text-sm text-foreground tracking-tight truncate">
                CAT Crack
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5 font-medium">
                2027 HQ • Nov 28
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs font-black text-xs">
            CAT
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer',
            collapsed && 'absolute -right-3.5 top-5 bg-card shadow-xs'
          )}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Section: PRIMARY */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Primary
            </span>
          )}
          {primaryNav.map((item) => {
            const active = isRouteActive(item.path);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ease-out group',
                  active
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/25 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    active ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-[13px]">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      'ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums',
                      item.badgeVariant === 'rose'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-muted-foreground'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Section: UTILITIES */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          {!collapsed && (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Utilities
            </span>
          )}

          {/* Library Popover Item */}
          <PopoverPrimitive.Root open={libraryOpen} onOpenChange={setLibraryOpen}>
            <PopoverPrimitive.Trigger asChild>
              <button
                type="button"
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ease-out cursor-pointer',
                  isLibraryActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/25 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                )}
                title={collapsed ? 'Library' : undefined}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate flex-1 text-left text-[13px]">Library</span>}
                {!collapsed && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </button>
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                side="right"
                align="start"
                sideOffset={12}
                className="z-50 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl focus:outline-hidden"
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reference & Resources
                </div>
                <div className="space-y-0.5">
                  {libraryItems.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => {
                          setLibraryOpen(false);
                          navigate(sub.path);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                      >
                        <SubIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-foreground block group-hover:text-blue-600 transition-colors">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-tight block">
                            {sub.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>

          {/* Settings Nav Item */}
          <NavLink
            to="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ease-out group',
              isRouteActive('/settings')
                ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/25 font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            )}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            {!collapsed && <span className="truncate flex-1 text-[13px]">Settings</span>}
          </NavLink>
        </div>
      </div>

      {/* Bottom AI Coach Trigger Card */}
      <div className="p-3 border-t border-border/60 shrink-0">
        <button
          type="button"
          onClick={onOpenCoach}
          className={cn(
            'w-full flex items-center justify-between rounded-2xl border border-blue-500/25 bg-blue-50/50 hover:bg-blue-100/60 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 transition-all duration-200 p-2.5 text-left cursor-pointer group shadow-2xs',
            collapsed && 'justify-center p-2'
          )}
          title="Ask AI Study Coach"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate">Study Coach</span>
                <span className="text-[10px] text-muted-foreground truncate">Strategy Copilot</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
              AI
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
