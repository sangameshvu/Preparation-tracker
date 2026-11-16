import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  BookOpen,
  Clock,
  Compass,
  Bot,
  StickyNote,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppData } from '../../context/AppDataContext';
import { Button } from '../ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { stats } = useAppData();

  const navItems = [
    { name: 'Home / Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Weekly Planner', path: '/planner', icon: CalendarDays, badge: `W${stats.currentWeek}` },
    { name: 'Topic Tracker', path: '/topics', icon: CheckSquare, badge: `${stats.completedTopics}/53` },
    { name: 'Mock Tracker', path: '/mocks', icon: BarChart3, badge: stats.totalMocksAttempted > 0 ? `${stats.totalMocksAttempted}` : undefined },
    { name: 'Mistake Log', path: '/mistakes', icon: AlertTriangle, badge: stats.overdueMistakesCount > 0 ? `${stats.overdueMistakesCount} due` : undefined, badgeVariant: 'destructive' },
    { name: 'Free Resources', path: '/resources', icon: BookOpen, badge: '28' },
    { name: 'Daily Routines', path: '/routines', icon: Clock },
    { name: 'CAT Preparation Guide', path: '/guide', icon: Compass },
    { name: 'AI Study Coach', path: '/ai-coach', icon: Bot, highlight: true },
    { name: 'Notes & Sticky Board', path: '/sticky-board', icon: StickyNote },
    { name: 'Profile & Settings', path: '/settings', icon: Settings },
    { name: 'Admin Panel', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/80 bg-sidebar transition-all duration-300 ease-in-out select-none z-30 shrink-0 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border/60">
        <div className={cn('flex items-center gap-2.5 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                CAT 2027 <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-500/30">HQ</span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">AI Command Centre</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-purple-100/80 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300 font-semibold shadow-xs border border-purple-200 dark:border-purple-500/25'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                  item.highlight ? 'text-purple-600 dark:text-purple-400' : ''
                )}
              />

              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.name}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      AI
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={cn(
                        'ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold',
                        item.badgeVariant === 'destructive'
                          ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 animate-pulse'
                          : 'bg-muted/80 text-muted-foreground'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Collapse Toggle in Collapsed state */}
      {collapsed && (
        <div className="p-2 border-t border-border/60 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Target Progress Pill in expanded state */}
      {!collapsed && (
        <div className="p-3 m-2 border border-border/70 rounded-xl bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground font-medium">Preparation Status</span>
            <span className="font-mono font-bold text-purple-700 dark:text-purple-300">{stats.overallCompletionPct}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.overallCompletionPct)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2 font-mono">
            <span>{stats.daysRemaining} days left</span>
            <span>Phase {stats.currentPhase.phaseNumber}/5</span>
          </div>
        </div>
      )}
    </aside>
  );
};
