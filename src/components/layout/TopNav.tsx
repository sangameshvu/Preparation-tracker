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
    <header className="sticky top-3 z-20 mx-3 sm:mx-6 md:mx-8 mb-2 flex h-14 sm:h-16 items-center justify-between glass-regular rounded-2xl sm:rounded-[28px] border px-3 sm:px-6 md:px-8 transition-colors shadow-lg">
      {/* Left: Dynamic Page Title */}
      <div className="flex items-center gap-2 min-w-0 shrink">
        <div className="flex flex-col min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground leading-none truncate max-w-[130px] sm:max-w-none">
            {getPageTitle()}
          </h1>
          <span className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block truncate">
            Phase {stats.currentPhase.phaseNumber} • Week {stats.currentWeek} of 52
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger (Desktop / Tablet) */}
      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm mx-2 md:mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full glass-thin hover:opacity-90 text-xs text-muted-foreground transition-all cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">Search syllabus, notes, mocks...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono glass-subtier rounded-md text-muted-foreground font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Coach Pill, Quick Add, Theme, Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button (<640px) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Search"
          className="flex sm:hidden h-8 w-8 items-center justify-center rounded-full glass-thin text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Ask Coach Outlined Pill Button */}
        <button
          type="button"
          onClick={onOpenCoach}
          className="inline-flex items-center justify-center gap-1.5 h-8 px-2 sm:px-3 rounded-full glass-thin hover:bg-black/5 dark:hover:bg-white/10 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-all shadow-xs cursor-pointer"
          title="Open AI Study Coach"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Ask Coach</span>
        </button>

        {/* Quick Add Button (Desktop / Tablet) */}
        <Button
          size="sm"
          onClick={onOpenQuickAdd}
          className="hidden md:inline-flex h-8 gap-1.5 text-xs font-semibold shadow-md rounded-full px-3.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Quick Add</span>
        </Button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-full glass-thin text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-600 hover:ring-2 hover:ring-blue-500/40 transition-all overflow-hidden shrink-0"
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
