import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Sparkles,
  User,
  Bot,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { Link, useLocation } from 'react-router-dom';
import { AuthModal } from '../auth/AuthModal';

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
  const { profile, stats, isAuthenticated } = useAppData();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Dynamic Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/plan') || path === '/planner' || path === '/topics') return 'Plan';
    if (path.startsWith('/practice') || path === '/mocks' || path === '/mistakes') return 'Practice';
    if (path.startsWith('/insights') || path === '/analytics' || path === '/history') return 'Insights';
    if (path.startsWith('/notes') || path === '/sticky-board') return 'Notes';
    if (path.startsWith('/guide')) return 'Preparation Guide';
    if (path.startsWith('/resources')) return 'Resources';
    if (path.startsWith('/routines')) return 'Daily Routines';
    if (path.startsWith('/ai-coach') || path.startsWith('/coach')) return 'AI Study Coach & Assistant';
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

      {/* Right: Streak Pill, Coach Pill, Quick Add, Theme, Avatar */}
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

        {/* Study Streak Flame Pill */}
        <Link
          to="/practice"
          className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
            stats.streakAtRisk
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'glass-thin text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
          }`}
          title={`Active Aeon Reading Streak: ${stats.currentStreak} days (Best: ${stats.bestStreak}d). ${stats.streakAtRisk ? 'Streak at risk! Yesterday missing — click to save!' : 'Streak active.'}`}
        >
          <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
          <span className="font-mono">{stats.currentStreak}d</span>
        </Link>

        {/* Ask Coach Outlined Pill Button */}
        <button
          type="button"
          onClick={onOpenCoach}
          className={`inline-flex items-center justify-center gap-1.5 h-8 px-2 sm:px-3 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer ${
            location.pathname.startsWith('/ai-coach') || location.pathname.startsWith('/coach')
              ? 'glass-tint text-white'
              : 'glass-thin hover:bg-black/5 dark:hover:bg-white/10 text-blue-600 dark:text-blue-400'
          }`}
          title="Open AI Study Coach & Assistant"
        >
          <Sparkles className="h-3.5 w-3.5" />
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

        {/* User Profile Avatar / Account Trigger */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-sm hover:ring-2 hover:ring-blue-500/40 transition-all overflow-hidden shrink-0 cursor-pointer"
            title={`Profile: ${profile.displayName || 'Sangamesh V U'} (${profile.email || ''}) - Click to manage`}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
            ) : (
              <span>
                {profile.displayName
                  ? profile.displayName
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'SV'}
              </span>
            )}
            <span
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background"
              title="Profile Active & Synced"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full text-xs font-semibold glass-thin hover:bg-blue-500/10 hover:border-blue-500/40 text-blue-600 dark:text-blue-400 transition-all shadow-xs cursor-pointer"
            title="Sign In or Register Profile"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

        {/* Profile & Account Auth Modal */}
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </header>
  );
};
