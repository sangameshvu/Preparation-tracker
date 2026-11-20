import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPalette } from '../ui/CommandPalette';
import { QuickAddModal } from './QuickAddModal';
import { AmbientBackground } from '../common/AmbientBackground';
import { Sparkles } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleOpenCoach = () => {
    navigate('/ai-coach');
  };

  // Progressive enhancement: Specular cursor-follow highlight for desktop pointer devices
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;

    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.specular-follow') as HTMLElement | null;
      if (!target) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="flex min-h-screen text-foreground antialiased font-sans relative selection:bg-blue-500/20">
      {/* ONE fixed full-viewport ambient background layer */}
      <AmbientBackground />

      {/* Streamlined Desktop Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenCoach={handleOpenCoach}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNav
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenCoach={handleOpenCoach}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed 5-Slot Bottom Navigation (<768px) */}
      <MobileBottomNav onOpenCoach={handleOpenCoach} />

      {/* Floating "Ask Coach" Pill Button (Desktop only, hidden when already on coach page) */}
      {!location.pathname.startsWith('/ai-coach') && !location.pathname.startsWith('/coach') && (
        <button
          type="button"
          onClick={handleOpenCoach}
          className="hidden md:flex fixed bottom-8 right-8 z-50 items-center gap-2 px-4 py-2.5 rounded-full glass-tint font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
        >
          <Sparkles className="h-4 w-4 text-blue-200 group-hover:rotate-12 transition-transform" />
          <span>Ask Coach</span>
        </button>
      )}

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        onOpenCoach={handleOpenCoach}
      />

      {/* Global Quick Add Modal */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
};
