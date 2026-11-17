import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  FileText,
  StickyNote,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  Calculator,
  Binary,
  BookMarked
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppData } from '../../context/AppDataContext';
import { Button } from '../ui/button';

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  badgeVariant?: 'destructive' | 'default';
  highlight?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { stats, studyNotes, stickyNotes, profile } = useAppData();
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      group: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Study Planner', path: '/planner', icon: CalendarDays, badge: `W${stats.currentWeek}` },
        { name: 'Activity History', path: '/history', icon: History, badge: 'New' },
      ]
    },
    {
      group: 'SUBJECT TRACKS',
      items: [
        { name: 'Quantitative Aptitude', path: '/topics?section=Quant', icon: Calculator, badge: '29' },
        { name: 'DILR', path: '/topics?section=DILR', icon: Binary, badge: '13' },
        { name: 'VARC', path: '/topics?section=VARC', icon: BookMarked, badge: '11' },
      ]
    },
    {
      group: 'TESTS & REVISION',
      items: [
        { name: 'Mock Tests', path: '/mocks', icon: BarChart3, badge: stats.totalMocksAttempted > 0 ? `${stats.totalMocksAttempted}` : undefined },
        { name: 'Analytics', path: '/analytics', icon: TrendingUp },
        { name: 'Revision / Mistakes', path: '/mistakes', icon: AlertTriangle, badge: stats.overdueMistakesCount > 0 ? `${stats.overdueMistakesCount} due` : undefined, badgeVariant: 'destructive' },
      ]
    },
    {
      group: 'STUDY DESK',
      items: [
        { name: 'Study Notes & Q&A', path: '/notes', icon: FileText, badge: `${studyNotes.length}` },
        { name: 'Sticky Board', path: '/sticky-board', icon: StickyNote, badge: `${stickyNotes.length}` },
        { name: 'CAT Preparation Guide', path: '/guide', icon: Compass },
        { name: 'AI Study Coach', path: '/ai-coach', icon: Bot, highlight: true },
        { name: 'Free Resources', path: '/resources', icon: BookOpen, badge: '28' },
        { name: 'Daily Routines', path: '/routines', icon: Clock },
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { name: 'Profile & Settings', path: '/settings', icon: Settings },
        { name: 'Admin Panel', path: '/admin', icon: ShieldCheck },
      ]
    }
  ];

  const isItemActive = (path: string) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search === `?${query}`;
    }
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/80 bg-sidebar transition-all duration-300 ease-in-out select-none z-30 shrink-0 h-screen sticky top-0 font-sans',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-border/60">
        <NavLink to="/" className={cn('flex items-center gap-2.5 overflow-hidden group', collapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 p-1.5 shadow-xs shadow-blue-500/20 shrink-0 transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="CAT Crack Logo" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-sidebar-foreground flex items-center gap-1.5">
                CAT Crack <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">PRO</span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">AI CAT 2027 Command</span>
            </div>
          )}
        </NavLink>

        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                    active
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    collapsed && 'justify-center px-0 py-2'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                      active ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span className="truncate flex-1">{item.name}</span>
                      {item.highlight && (
                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          AI
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={cn(
                            'ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold',
                            active
                              ? 'bg-white/20 text-white'
                              : item.badgeVariant === 'destructive'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : 'bg-sidebar-accent text-muted-foreground'
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
          </div>
        ))}
      </nav>

      {/* Footer Collapse Toggle in Collapsed state */}
      {collapsed && (
        <div className="p-2 border-t border-border/60 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User Profile Mini Bar */}
      {!collapsed && (
        <div className="p-3 border-t border-border/60 bg-sidebar-accent/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
              {profile.displayName.charAt(0) || 'S'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">{profile.displayName}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Phase {stats.currentPhase.phaseNumber} • {stats.daysRemaining}d left</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
