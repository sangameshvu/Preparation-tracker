import React from 'react';
import { useStudyTimer, formatTimerDigits } from '../../context/StudyTimerContext';
import { useAppData } from '../../context/AppDataContext';
import { SectionType, TimerMode } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX,
  Plus,
  Clock,
  Sparkles,
  BookOpen,
  Layers,
  Flame,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const StudyTimerModal: React.FC = () => {
  const {
    isRunning,
    isPaused,
    mode,
    targetMinutes,
    displaySeconds,
    elapsedSeconds,
    progressPercent,
    section,
    topicId,
    topicName,
    sessionNotes,
    soundEnabled,
    isPipActive,
    isModalOpen,
    startTimer,
    pauseTimer,
    resumeTimer,
    togglePause,
    resetTimer,
    stopAndLog,
    togglePip,
    closeTimerModal,
    setMode,
    setTargetMinutes,
    setSection,
    setTopic,
    setSessionNotes,
    setSoundEnabled,
    addFiveMinutes
  } = useStudyTimer();

  const { topics } = useAppData();

  // Filter topics for the active section
  const sectionTopics = topics.filter((t) => t.section === section);

  const POMODORO_PRESETS = [
    { label: '25m', mins: 25, desc: 'Pomodoro' },
    { label: '45m', mins: 45, desc: 'CAT Section' },
    { label: '60m', mins: 60, desc: '1 Hour' },
    { label: '90m', mins: 90, desc: 'Deep Focus' }
  ];

  const handleSectionChange = (newSec: SectionType) => {
    setSection(newSec);
    const firstTop = topics.find((t) => t.section === newSec);
    if (firstTop) {
      setTopic(firstTop.id, firstTop.topicName);
    } else {
      setTopic('', `${newSec} General Study`);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeTimerModal()}>
      <DialogContent className="sm:max-w-md glass-regular border border-border/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <DialogHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>CAT Study Focus Timer</span>
                {isPipActive && (
                  <Badge variant="blue" className="text-[10px] font-mono gap-1 py-0">
                    <ExternalLink className="h-2.5 w-2.5" />
                    PiP Active
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Track and log your active CAT study hours across subjects.
              </DialogDescription>
            </div>
          </div>

          {/* Sound & PiP Quick Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute alert sounds' : 'Unmute alert sounds'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-500" />}
            </button>
            <button
              type="button"
              onClick={togglePip}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                isPipActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
              title="Toggle Picture-in-Picture floating window (runs while browsing other websites)"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Mode Selector: Stopwatch vs Pomodoro */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/50 my-1">
          <button
            type="button"
            onClick={() => setMode('stopwatch')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
              mode === 'stopwatch'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Open Stopwatch</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('pomodoro')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
              mode === 'pomodoro'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Target Countdown</span>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 justify-between pt-1">
          {(['Quant', 'DILR', 'VARC', 'General'] as SectionType[]).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => handleSectionChange(sec)}
              className={cn(
                'flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer',
                section === sec
                  ? sec === 'Quant'
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-400'
                    : sec === 'DILR'
                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-600 dark:text-purple-400'
                    : sec === 'VARC'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-card/40 border-border/50 text-muted-foreground hover:text-foreground'
              )}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Topic Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Syllabus Topic / Target</span>
            <span className="font-mono text-[10px]">{sectionTopics.length} topics in {section}</span>
          </label>
          <div className="relative">
            <select
              value={topicId}
              onChange={(e) => {
                const selected = sectionTopics.find((t) => t.id === e.target.value);
                if (selected) {
                  setTopic(selected.id, selected.topicName);
                } else {
                  setTopic('', e.target.value);
                }
              }}
              className="w-full h-8 pl-3 pr-8 text-xs font-medium bg-card border border-border/70 rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="">{section} General Focus</option>
              {sectionTopics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.area}: {top.topicName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Pomodoro Presets (if countdown mode) */}
        {mode === 'pomodoro' && (
          <div className="flex items-center gap-1.5">
            {POMODORO_PRESETS.map((p) => (
              <button
                key={p.mins}
                type="button"
                onClick={() => setTargetMinutes(p.mins)}
                className={cn(
                  'flex-1 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center',
                  targetMinutes === p.mins
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-card/50 border-border/60 text-muted-foreground hover:text-foreground'
                )}
              >
                <div>{p.label}</div>
              </button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFiveMinutes}
              className="h-8 text-xs px-2 gap-0.5 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Add 5 minutes to countdown"
            >
              <Plus className="h-3 w-3" />
              <span>5m</span>
            </Button>
          </div>
        )}

        {/* Large Digital Clock Display */}
        <div className="relative py-4 my-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-card/80 to-card/40 border border-border/60 shadow-inner">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                !isRunning
                  ? 'bg-slate-400'
                  : isPaused
                  ? 'bg-amber-400'
                  : 'bg-emerald-500 animate-pulse'
              )}
            />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
              {!isRunning
                ? 'READY TO START'
                : isPaused
                ? 'TIMER PAUSED'
                : mode === 'pomodoro'
                ? 'FOCUSING • COUNTDOWN'
                : 'FOCUSING • STOPWATCH'}
            </span>
          </div>

          <div
            className={cn(
              'font-mono font-extrabold tracking-tight text-5xl sm:text-6xl select-none',
              !isRunning
                ? 'text-foreground'
                : isPaused
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-blue-600 dark:text-blue-400'
            )}
          >
            {formatTimerDigits(displaySeconds)}
          </div>

          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            {topicName || `${section} Practice`}
            {mode === 'pomodoro' && ` • Goal: ${targetMinutes} mins`}
          </p>

          {/* Progress bar */}
          <div className="w-4/5 h-1.5 bg-muted/60 rounded-full mt-3 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                isPaused ? 'bg-amber-500' : 'bg-blue-600'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Session Note (optional) */}
        <div>
          <Input
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Quick notes / LOD / problem sets (e.g. 15 questions LOD-2)..."
            className="h-8 text-xs bg-card/60"
          />
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2 pt-1">
          {/* Play / Pause */}
          <Button
            type="button"
            onClick={togglePause}
            className={cn(
              'flex-1 h-10 font-bold text-xs gap-1.5 shadow-sm cursor-pointer text-white',
              !isRunning || isPaused
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            {!isRunning ? (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Start Study Session</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Resume Timer</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 fill-white" />
                <span>Pause Timer</span>
              </>
            )}
          </Button>

          {/* Stop & Log Time */}
          <Button
            type="button"
            onClick={() => stopAndLog()}
            disabled={!isRunning && elapsedSeconds === 0}
            className="flex-1 h-10 font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Finish & Log Time</span>
          </Button>

          {/* Reset */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={resetTimer}
            disabled={!isRunning && elapsedSeconds === 0}
            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Picture-in-Picture Banner Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={togglePip}
            className="w-full p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 transition-all text-xs flex items-center justify-between text-blue-700 dark:text-blue-300 font-semibold cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span>{isPipActive ? 'Picture-in-Picture Window Active' : 'Open in Picture-in-Picture Mode'}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-800 dark:text-blue-200">
              Float Over Other Websites →
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
