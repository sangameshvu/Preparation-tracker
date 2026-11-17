import React from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Link, useLocation } from 'react-router-dom';

interface TopNavProps {
  onOpenCommandPalette: () => void;
  onOpenQuickAdd: () => void;
  onOpenCoach: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenCommandPalette,
  onOpenQuickAdd,
  onOpenCoach
}) => {
  const { theme, toggleTheme } = useTheme();
  const { profile, stats } = useAppData();
  const location = useLocation();

  // Dynamic Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Today';
    if (path.startsWith('/plan') || path === '/planner' || path === '/topics') return 'Plan';
    if (path.startsWith('/practice') || path === '/mocks' || path === '/mistakes') return 'Practice';
    if (path.startsWith('/insights') || path === '/analytics' || path === '/history') return 'Insights';
    if (path.startsWith('/notes') || path === '/sticky-board') return 'Notes';
    if (path.startsWith('/guide')) return 'Preparation Guide';
    if (path.startsWith('/resources')) return 'Free Resources';
    if (path.startsWith('/routines')) return 'Daily Routines';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/admin')) return 'Data & Backup';
    return 'CAT 2027 HQ';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/90 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Dynamic Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground leading-none">
            {getPageTitle()}
          </h1>
          <span className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
            Phase {stats.currentPhase.phaseNumber} • Week {stats.currentWeek} of 52
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex items-center gap-2 flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full border border-border/80 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-xs text-muted-foreground transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">Search syllabus, notes, mocks...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-card border border-border rounded-md text-muted-foreground font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Coach Pill, Quick Add, Theme, Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Ask Coach Outlined Pill Button */}
        <button
          type="button"
          onClick={onOpenCoach}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/35 bg-card hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
          title="Open AI Study Coach"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Ask Coach</span>
        </button>

        {/* Quick Add Button */}
        <Button
          size="sm"
          onClick={onOpenQuickAdd}
          className="h-8 gap-1.5 text-xs font-semibold shadow-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Quick Add</span>
        </Button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-blue-600" />
          )}
        </button>

        {/* User Profile Avatar */}
        <Link
          to="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-600 hover:ring-2 hover:ring-blue-500/40 transition-all overflow-hidden"
          title="Account & Settings"
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="font-bold text-xs">
              {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'C'}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
