import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Layers,
  Target,
  BarChart3,
  FileText,
  BookOpen,
  Sparkles,
  Settings,
  Plus,
  Bot,
  Sun,
  Moon,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenQuickAdd?: () => void;
  onOpenCoach?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onOpenQuickAdd,
  onOpenCoach
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Global keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 rounded-3xl glass-thick p-0 shadow-2xl transition-all duration-200 overflow-hidden focus:outline-hidden">
          <DialogPrimitive.Title className="sr-only">Command Palette</DialogPrimitive.Title>
          <Command className="flex h-full w-full flex-col overflow-hidden bg-transparent text-foreground">
            {/* Search Input Bar */}
            <div className="flex items-center border-b border-border/70 px-4 py-3.5">
              <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                placeholder="Type a command or search..."
                className="flex h-6 w-full rounded-md bg-transparent text-sm outline-hidden placeholder:text-muted-foreground text-foreground"
                autoFocus
              />
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Scrollable Command List */}
            <Command.List className="max-h-[340px] overflow-y-auto p-2 scroll-py-2">
              <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
                No matching results found.
              </Command.Empty>

              {/* Quick Actions Group */}
              <Command.Group
                heading="Quick Actions"
                className="overflow-hidden p-1 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {onOpenCoach && (
                  <Command.Item
                    onSelect={() => runCommand(onOpenCoach)}
                    className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 dark:data-[selected=true]:bg-blue-950/40 dark:data-[selected=true]:text-blue-300 transition-colors"
                  >
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Ask AI Study Coach</span>
                    <span className="ml-auto text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full font-bold">
                      Coach
                    </span>
                  </Command.Item>
                )}

                {onOpenQuickAdd && (
                  <Command.Item
                    onSelect={() => runCommand(onOpenQuickAdd)}
                    className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 dark:data-[selected=true]:bg-blue-950/40 dark:data-[selected=true]:text-blue-300 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Quick Add (Task, Mistake, Mock, Note)</span>
                  </Command.Item>
                )}

                <Command.Item
                  onSelect={() =>
                    runCommand(() => window.open('https://docs.google.com/document/create', '_blank'))
                  }
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 dark:data-[selected=true]:bg-blue-950/40 dark:data-[selected=true]:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Draft New Note in Google Docs</span>
                </Command.Item>
              </Command.Group>

              {/* Navigation Group */}
              <Command.Group
                heading="Navigation"
                className="overflow-hidden p-1 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                <Command.Item
                  onSelect={() => runCommand(() => navigate('/'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Today (Dashboard)</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/plan'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span>Plan (Weekly Roadmap & Topics)</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/practice'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Practice (Topic Practice, Mocks & Mistakes)</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/insights'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>Insights (Analytics & Study History)</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/notes'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Notes (Study Notes & Sticky Board)</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/guide'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Library: Preparation Guide</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/resources'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>Library: Free Resources</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/routines'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Library: Daily Routines</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => navigate('/settings'))}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings & Preferences</span>
                </Command.Item>
              </Command.Group>

              {/* Preferences Group */}
              <Command.Group
                heading="Preferences"
                className="overflow-hidden p-1 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                <Command.Item
                  onSelect={() => runCommand(toggleTheme)}
                  className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground outline-hidden data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-500" />
                  )}
                  <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </Command.Item>
              </Command.Group>
            </Command.List>

            {/* Footer with Keyboard Hints */}
            <div className="flex items-center justify-between border-t border-border/70 px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[9px]">
                    ↑
                  </kbd>
                  <kbd className="rounded border border-border bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[9px]">
                    ↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[9px]">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
              </div>
              <span>CAT 2027 HQ</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
