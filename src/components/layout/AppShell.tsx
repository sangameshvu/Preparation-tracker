import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPalette } from '../ui/CommandPalette';
import { AICoachDrawer } from './AICoachDrawer';
import { QuickAddModal } from './QuickAddModal';
import { Sparkles } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const location = useLocation();

  // If user visits /ai-coach directly, open drawer
  React.useEffect(() => {
    if (location.pathname === '/ai-coach') {
      setCoachOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased font-sans">
      {/* Streamlined Desktop Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenCoach={() => setCoachOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNav
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenCoach={() => setCoachOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed 5-Slot Bottom Navigation (<768px) */}
      <MobileBottomNav onOpenCoach={() => setCoachOpen(true)} />

      {/* Floating "Ask Coach" Pill Button (Desktop only) */}
      <button
        type="button"
        onClick={() => setCoachOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
      >
        <Sparkles className="h-4 w-4 text-blue-200 group-hover:rotate-12 transition-transform" />
        <span>Ask Coach</span>
      </button>

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        onOpenCoach={() => setCoachOpen(true)}
      />

      {/* Global Slide-Over AI Study Coach Drawer */}
      <AICoachDrawer open={coachOpen} onOpenChange={setCoachOpen} />

      {/* Global Quick Add Modal */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
};
