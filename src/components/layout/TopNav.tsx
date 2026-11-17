import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  AlertTriangle,
  User,
  Bot
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { QuickAddModal } from './QuickAddModal';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

interface TopNavProps {
  onSearchOpen?: () => void;
}

export const TopNav: React.FC<TopNavProps> = () => {
  const { theme, toggleTheme } = useTheme();
  const { profile, stats, mistakes } = useAppData();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  const formattedDate = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* Left: Date & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:hidden items-center justify-center rounded-lg bg-blue-600 p-1 shadow-xs">
              <img src="/logo.png" alt="CAT Crack Logo" className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <span className="text-xs font-medium text-foreground tracking-tight hidden sm:inline-block">
              {formattedDate}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 font-medium">
              Week {stats.currentWeek} of 52
            </span>
          </div>
        </div>

        {/* Center: Search & Quick Navigation */}
        <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={() => navigate('/topics')}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search syllabus, mocks, mistakes...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Alerts, Theme, Avatar */}
        <div className="flex items-center gap-2">
          {/* Quick-Add Button */}
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold shadow-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            onClick={() => setQuickAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
          </Button>

          {/* Overdue Mistakes Alert Badge */}
          {stats.overdueMistakesCount > 0 && (
            <Link
              to="/mistakes"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 font-semibold hover:bg-rose-100 transition-colors"
              title={`${stats.overdueMistakesCount} mistakes overdue for re-solving`}
            >
              <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
              <span className="font-mono">{stats.overdueMistakesCount} Overdue</span>
            </Link>
          )}

          {/* AI Coach Quick Shortcut */}
          <Link
            to="/ai-coach"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 transition-colors"
            title="Ask AI Study Coach"
          >
            <Bot className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline font-semibold">Coach</span>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Profile Avatar Link */}
          <Link
            to="/settings"
            className="flex items-center gap-2 pl-2 border-l border-border/80 hover:opacity-80 transition-opacity"
            title="Profile & Settings"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-foreground hidden lg:inline max-w-[100px] truncate">
              {profile.displayName}
            </span>
          </Link>
        </div>
      </header>

      {/* Global Quick Add Modal */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
};
