import React from 'react';
import { useStudyTimer, formatTimerDigits } from '../../context/StudyTimerContext';
import { Play, Pause, ExternalLink, CheckCircle2, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StudyTimerFloatingDock: React.FC = () => {
  const {
    isRunning,
    isPaused,
    displaySeconds,
    section,
    topicName,
    isModalOpen,
    isPipActive,
    togglePause,
    togglePip,
    stopAndLog,
    openTimerModal
  } = useStudyTimer();

  // Only show the floating dock if timer is running or paused, AND the main modal is NOT open, AND not already in PiP
  if ((!isRunning && displaySeconds === 0) || isModalOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 md:left-auto md:right-36 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full glass-thick border border-border/80 shadow-xl text-foreground">
        {/* Pulsing Dot & Section Badge */}
        <div
          onClick={openTimerModal}
          className="flex items-center gap-2 cursor-pointer select-none"
          title="Click to open full timer controls"
        >
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && !isPaused && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2.5 w-2.5',
                !isRunning
                  ? 'bg-slate-400'
                  : isPaused
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              )}
            />
          </span>

          <div className="flex flex-col">
            <span className="font-mono font-extrabold text-xs tracking-tight">
              {formatTimerDigits(displaySeconds)}
            </span>
            <span className="text-[9px] font-semibold text-muted-foreground truncate max-w-[100px]">
              {section} • {topicName || 'Studying'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 pl-1 border-l border-border/60">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={togglePause}
            className={cn(
              'h-7 w-7 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer shadow-xs',
              isPaused ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
            )}
            title={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? <Play className="h-3 w-3 fill-white" /> : <Pause className="h-3 w-3 fill-white" />}
          </button>

          {/* Picture-in-Picture */}
          <button
            type="button"
            onClick={togglePip}
            className={cn(
              'h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer',
              isPipActive
                ? 'bg-blue-600 text-white'
                : 'glass-thin hover:bg-white/10 text-muted-foreground hover:text-foreground'
            )}
            title="Pop out into floating Picture-in-Picture window"
          >
            <ExternalLink className="h-3 w-3" />
          </button>

          {/* Quick Finish & Log */}
          <button
            type="button"
            onClick={() => stopAndLog()}
            className="h-7 w-7 rounded-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white transition-transform active:scale-95 cursor-pointer shadow-xs"
            title="Finish & log study time"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>

          {/* Expand to Modal */}
          <button
            type="button"
            onClick={openTimerModal}
            className="h-7 w-7 rounded-full flex items-center justify-center glass-thin hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Expand timer view"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
