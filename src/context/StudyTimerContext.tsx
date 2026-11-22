import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAppData } from './AppDataContext';
import { SectionType, TimerMode, StudyTimerPersistedState } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TIMER_STORAGE_KEY = 'cat2027_active_study_timer';

interface StudyTimerContextType {
  // Timer State
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerMode;
  targetMinutes: number;
  displaySeconds: number;
  elapsedSeconds: number;
  progressPercent: number;
  section: SectionType;
  topicId: string;
  topicName: string;
  sessionNotes: string;
  soundEnabled: boolean;
  isPipActive: boolean;
  pipType: 'document' | 'video' | null;
  isModalOpen: boolean;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  togglePause: () => void;
  resetTimer: () => void;
  stopAndLog: (overrideNotes?: string) => void;
  togglePip: () => Promise<void>;
  enterPip: () => Promise<void>;
  exitPip: () => void;
  openTimerModal: () => void;
  closeTimerModal: () => void;
  setMode: (mode: TimerMode) => void;
  setTargetMinutes: (mins: number) => void;
  setSection: (section: SectionType) => void;
  setTopic: (topicId: string, topicName: string) => void;
  setSessionNotes: (notes: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  addFiveMinutes: () => void;
}

const StudyTimerContext = createContext<StudyTimerContextType | undefined>(undefined);

export const formatTimerDigits = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

// Web Audio API harmonic sound synthesizers
const playChimeSound = (type: 'finish' | 'pomodoro_end' | 'tick') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'finish') {
      // Harmonic celebratory chord (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } else if (type === 'pomodoro_end') {
      // Gentle 2-tone bell for pomodoro interval
      [880, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.65);
      });
    }
  } catch (err) {
    // Audio context may be suspended before user interaction
  }
};

export const StudyTimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addActivity } = useAppData();

  // Load initial persisted state
  const [persisted, setPersisted] = useState<StudyTimerPersistedState>(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse timer state:', e);
    }
    return {
      isRunning: false,
      isPaused: false,
      mode: 'stopwatch',
      accumulatedSeconds: 0,
      lastStartTimestamp: null,
      targetMinutes: 45,
      section: 'Quant',
      topicId: '',
      topicName: 'Algebra & Arithmetic',
      sessionNotes: '',
      soundEnabled: true
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipType, setPipType] = useState<'document' | 'video' | null>(null);

  // Computed live elapsed seconds
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (persisted.isRunning && !persisted.isPaused && persisted.lastStartTimestamp) {
      const delta = Math.floor((Date.now() - persisted.lastStartTimestamp) / 1000);
      return persisted.accumulatedSeconds + delta;
    }
    return persisted.accumulatedSeconds;
  });

  // References for PiP
  const pipWindowRef = useRef<any>(null);
  const videoPipRef = useRef<HTMLVideoElement | null>(null);
  const canvasPipRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<any>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(persisted));
    } catch (e) {
      console.error('Failed to persist timer state', e);
    }
  }, [persisted]);

  // Main high-precision wall-clock timer tick
  useEffect(() => {
    if (persisted.isRunning && !persisted.isPaused) {
      const updateElapsed = () => {
        const lastStart = persisted.lastStartTimestamp || Date.now();
        const delta = Math.floor((Date.now() - lastStart) / 1000);
        const total = persisted.accumulatedSeconds + delta;
        setElapsedSeconds(total);

        // Check Pomodoro countdown completion
        if (persisted.mode === 'pomodoro') {
          const targetSec = persisted.targetMinutes * 60;
          if (total >= targetSec) {
            // Target reached!
            if (persisted.soundEnabled) {
              playChimeSound('pomodoro_end');
            }
            toast.success(`🎯 Focus target reached! Completed ${persisted.targetMinutes} minutes.`, {
              duration: 6000
            });
            // Automatically pause at completion
            setPersisted((prev) => ({
              ...prev,
              isRunning: true,
              isPaused: true,
              accumulatedSeconds: targetSec,
              lastStartTimestamp: null
            }));
          }
        }
      };

      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedSeconds(persisted.accumulatedSeconds);
    }
  }, [
    persisted.isRunning,
    persisted.isPaused,
    persisted.lastStartTimestamp,
    persisted.accumulatedSeconds,
    persisted.mode,
    persisted.targetMinutes,
    persisted.soundEnabled
  ]);

  // Derived display seconds
  const displaySeconds =
    persisted.mode === 'pomodoro'
      ? Math.max(0, persisted.targetMinutes * 60 - elapsedSeconds)
      : elapsedSeconds;

  const progressPercent =
    persisted.mode === 'pomodoro'
      ? Math.min(100, Math.round((elapsedSeconds / (persisted.targetMinutes * 60)) * 100))
      : Math.min(100, Math.round(((elapsedSeconds % 3600) / 3600) * 100));

  // Sync to MediaSession API
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        const timeStr = formatTimerDigits(displaySeconds);
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `CAT Study Timer: ${timeStr}`,
          artist: `${persisted.section} • ${persisted.topicName || 'General Focus'}`,
          album: persisted.isPaused ? '⏸️ PAUSED' : '⏱️ FOCUSING'
        });

        navigator.mediaSession.setActionHandler('play', () => {
          resumeTimer();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          pauseTimer();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          stopAndLog();
        });
      } catch (e) {
        // MediaSession action handler might not be fully supported in some environments
      }
    }
  }, [displaySeconds, persisted.isPaused, persisted.section, persisted.topicName]);

  // Timer Actions
  const startTimer = useCallback(() => {
    const now = Date.now();
    setPersisted((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      lastStartTimestamp: now
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    if (!persisted.isRunning || persisted.isPaused) return;
    const now = Date.now();
    const lastStart = persisted.lastStartTimestamp || now;
    const delta = Math.floor((now - lastStart) / 1000);
    const newAccumulated = persisted.accumulatedSeconds + delta;

    setPersisted((prev) => ({
      ...prev,
      isPaused: true,
      accumulatedSeconds: newAccumulated,
      lastStartTimestamp: null
    }));
    setElapsedSeconds(newAccumulated);
    toast.info('Study timer paused.');
  }, [persisted.isRunning, persisted.isPaused, persisted.lastStartTimestamp, persisted.accumulatedSeconds]);

  const resumeTimer = useCallback(() => {
    if (!persisted.isRunning || !persisted.isPaused) return;
    const now = Date.now();
    setPersisted((prev) => ({
      ...prev,
      isPaused: false,
      lastStartTimestamp: now
    }));
    toast.success('Study timer resumed.');
  }, [persisted.isRunning, persisted.isPaused]);

  const togglePause = useCallback(() => {
    if (!persisted.isRunning) {
      startTimer();
    } else if (persisted.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  }, [persisted.isRunning, persisted.isPaused, startTimer, resumeTimer, pauseTimer]);

  const resetTimer = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      accumulatedSeconds: 0,
      lastStartTimestamp: null
    }));
    setElapsedSeconds(0);
    toast.info('Study timer reset.');
  }, []);

  const stopAndLog = useCallback(
    (overrideNotes?: string) => {
      // Calculate total studied minutes (at least 1 min if >= 20 seconds, else exact)
      const finalSecs = elapsedSeconds;
      const studiedMins = Math.max(1, Math.round(finalSecs / 60));

      if (finalSecs < 10) {
        toast.info('Timer session was under 10 seconds; discarded without logging.');
        resetTimer();
        return;
      }

      const notes = overrideNotes !== undefined ? overrideNotes : persisted.sessionNotes;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const topicDisplay = persisted.topicName ? ` - ${persisted.topicName}` : '';

      addActivity({
        date: todayStr,
        category: 'study',
        title: `Study Session: ${persisted.section}${topicDisplay}`,
        details: `${studiedMins} mins studied via ${
          persisted.mode === 'pomodoro' ? 'Pomodoro Focus' : 'Stopwatch'
        }.${notes ? ` Notes: "${notes}"` : ''}`,
        section: persisted.section,
        durationMinutes: studiedMins
      });

      if (persisted.soundEnabled) {
        playChimeSound('finish');
      }

      toast.success(
        `🎉 Great study session! Logged ${studiedMins} mins of ${persisted.section} to your Study History.`
      );

      // Reset timer
      resetTimer();

      // Close PiP window if active
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    },
    [
      elapsedSeconds,
      persisted.sessionNotes,
      persisted.topicName,
      persisted.section,
      persisted.mode,
      persisted.soundEnabled,
      addActivity,
      resetTimer
    ]
  );

  const addFiveMinutes = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      targetMinutes: prev.targetMinutes + 5
    }));
    toast.info('+5 minutes added to focus goal');
  }, []);

  // Update Live Document PiP Window UI
  const updateDocumentPipUI = useCallback(() => {
    const pipWin = pipWindowRef.current;
    if (!pipWin || pipWin.closed) return;

    const digitsEl = pipWin.document.getElementById('pip-digits');
    const statusTextEl = pipWin.document.getElementById('pip-status-text');
    const statusDotEl = pipWin.document.getElementById('pip-status-dot');
    const pauseBtn = pipWin.document.getElementById('pip-pause-btn');
    const topicEl = pipWin.document.getElementById('pip-topic');
    const badgeEl = pipWin.document.getElementById('pip-badge');

    if (digitsEl) {
      digitsEl.textContent = formatTimerDigits(displaySeconds);
      if (persisted.isPaused) {
        digitsEl.classList.add('paused');
      } else {
        digitsEl.classList.remove('paused');
      }
    }

    if (statusTextEl && statusDotEl) {
      if (!persisted.isRunning) {
        statusTextEl.textContent = 'READY TO FOCUS';
        statusDotEl.className = 'dot paused';
      } else if (persisted.isPaused) {
        statusTextEl.textContent = 'PAUSED';
        statusDotEl.className = 'dot paused';
      } else {
        statusTextEl.textContent = persisted.mode === 'pomodoro' ? 'COUNTDOWN FOCUS' : 'STOPWATCH RUNNING';
        statusDotEl.className = 'dot';
      }
    }

    if (pauseBtn) {
      if (!persisted.isRunning) {
        pauseBtn.innerHTML = '▶ Start';
        pauseBtn.className = 'btn-primary';
      } else if (persisted.isPaused) {
        pauseBtn.innerHTML = '▶ Resume';
        pauseBtn.className = 'btn-primary';
      } else {
        pauseBtn.innerHTML = '⏸ Pause';
        pauseBtn.className = 'btn-pause';
      }
    }

    if (topicEl) {
      topicEl.textContent = persisted.topicName || `${persisted.section} Focus`;
    }

    if (badgeEl) {
      badgeEl.textContent = persisted.section;
      badgeEl.className = `badge badge-${persisted.section.toLowerCase()}`;
    }
  }, [displaySeconds, persisted]);

  // Keep Document PiP updated when state changes
  useEffect(() => {
    if (isPipActive && pipType === 'document') {
      updateDocumentPipUI();
    }
  }, [isPipActive, pipType, updateDocumentPipUI]);

  // Enter Picture-in-Picture
  const enterPip = useCallback(async () => {
    // 1. Try Document Picture-in-Picture API (Chrome/Edge 111+)
    if ('documentPictureInPicture' in window) {
      try {
        if (pipWindowRef.current && !pipWindowRef.current.closed) {
          pipWindowRef.current.focus();
          return;
        }

        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 360,
          height: 290,
          disallowReturnToOpener: false
        });

        pipWindowRef.current = pipWin;
        setIsPipActive(true);
        setPipType('document');

        // Style the Document PiP window
        const styleEl = pipWin.document.createElement('style');
        styleEl.textContent = `
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
          body {
            background: #090d16;
            color: #f8fafc;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100vh;
            padding: 16px;
            user-select: none;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
          }
          .badge {
            padding: 3px 9px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .badge-quant { background: rgba(59, 130, 246, 0.25); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.5); }
          .badge-dilr { background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.5); }
          .badge-varc { background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); }
          .badge-general { background: rgba(16, 185, 129, 0.25); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.5); }
          .topic {
            font-size: 12px;
            font-weight: 600;
            color: #cbd5e1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 175px;
          }
          .timer-box {
            text-align: center;
            margin: 6px 0;
          }
          .digits {
            font-size: 46px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            font-weight: 800;
            letter-spacing: 0.02em;
            color: #38bdf8;
            text-shadow: 0 0 24px rgba(56, 189, 248, 0.4);
            line-height: 1.1;
          }
          .digits.paused {
            color: #fbbf24;
            text-shadow: 0 0 24px rgba(251, 191, 36, 0.35);
          }
          .status-line {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-top: 4px;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 1.5s infinite;
          }
          .dot.paused {
            background: #f59e0b;
            animation: none;
          }
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
          }
          .controls {
            display: flex;
            gap: 8px;
            margin-top: 4px;
          }
          button {
            border: none;
            cursor: pointer;
            border-radius: 12px;
            font-weight: 700;
            font-size: 12px;
            padding: 9px 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.15s ease;
          }
          .btn-primary {
            flex: 2;
            background: #2563eb;
            color: #ffffff;
            box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4);
          }
          .btn-primary:hover { background: #1d4ed8; }
          .btn-pause {
            flex: 2;
            background: #d97706;
            color: #ffffff;
            box-shadow: 0 2px 10px rgba(217, 119, 6, 0.4);
          }
          .btn-pause:hover { background: #b45309; }
          .btn-secondary {
            flex: 2;
            background: #059669;
            color: #ffffff;
            box-shadow: 0 2px 10px rgba(5, 150, 105, 0.4);
          }
          .btn-secondary:hover { background: #047857; }
          .btn-icon {
            background: #1e293b;
            color: #94a3b8;
            padding: 9px 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .btn-icon:hover { background: #334155; color: #ffffff; }
        `;
        pipWin.document.head.appendChild(styleEl);

        // Body content
        pipWin.document.body.innerHTML = `
          <div class="header">
            <span id="pip-badge" class="badge badge-${persisted.section.toLowerCase()}">${persisted.section}</span>
            <span id="pip-topic" class="topic">${persisted.topicName || 'CAT Study Session'}</span>
          </div>

          <div class="timer-box">
            <div id="pip-digits" class="digits">${formatTimerDigits(displaySeconds)}</div>
            <div class="status-line">
              <span id="pip-status-dot" class="dot ${persisted.isPaused ? 'paused' : ''}"></span>
              <span id="pip-status-text">${persisted.isPaused ? 'PAUSED' : 'FOCUSING...'}</span>
            </div>
          </div>

          <div class="controls">
            <button id="pip-pause-btn" class="${persisted.isPaused ? 'btn-primary' : 'btn-pause'}">
              ${persisted.isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button id="pip-log-btn" class="btn-secondary">
              ✓ Log Time
            </button>
            <button id="pip-reset-btn" class="btn-icon" title="Reset Timer">
              ↺
            </button>
          </div>
        `;

        // Wire Event Handlers
        const pauseBtn = pipWin.document.getElementById('pip-pause-btn');
        const logBtn = pipWin.document.getElementById('pip-log-btn');
        const resetBtn = pipWin.document.getElementById('pip-reset-btn');

        if (pauseBtn) {
          pauseBtn.onclick = () => {
            togglePause();
          };
        }

        if (logBtn) {
          logBtn.onclick = () => {
            stopAndLog();
          };
        }

        if (resetBtn) {
          resetBtn.onclick = () => {
            resetTimer();
          };
        }

        // Window close handler
        pipWin.addEventListener('pagehide', () => {
          setIsPipActive(false);
          setPipType(null);
          pipWindowRef.current = null;
        });

        toast.success('✨ Picture-in-Picture active! You can now browse other websites while tracking your study.');
        return;
      } catch (err) {
        console.warn('Document Picture-in-Picture failed, falling back to Video Canvas PiP:', err);
      }
    }

    // 2. Fallback: Canvas Stream to Video PiP (Universal browser support)
    try {
      if (!canvasPipRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 320;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        canvasPipRef.current = canvas;
      }

      if (!videoPipRef.current) {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        videoPipRef.current = video;
      }

      const canvas = canvasPipRef.current;
      const video = videoPipRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw canvas loop
      const renderCanvas = () => {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 480, 320);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#111827');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 480, 320);

        // Header Section
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 16px -apple-system, sans-serif';
        ctx.fillText(`CAT 2027 HQ • ${persisted.section.toUpperCase()}`, 30, 45);

        // Topic name
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px -apple-system, sans-serif';
        ctx.fillText(persisted.topicName || 'Active Study Session', 30, 72);

        // Big Digits
        const digits = formatTimerDigits(displaySeconds);
        ctx.font = 'bold 72px ui-monospace, monospace';
        ctx.fillStyle = persisted.isPaused ? '#fbbf24' : '#38bdf8';
        ctx.fillText(digits, 30, 175);

        // Status badge
        ctx.fillStyle = persisted.isPaused ? '#f59e0b' : '#10b981';
        ctx.beginPath();
        ctx.arc(40, 230, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 18px -apple-system, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(
          persisted.isPaused ? 'PAUSED (Tap Play to Resume)' : 'FOCUSING (Tap Pause to Hold)',
          58,
          236
        );

        // Progress bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(30, 270, 420, 10);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(30, 270, (420 * progressPercent) / 100, 10);

        animationFrameRef.current = requestAnimationFrame(renderCanvas);
      };

      renderCanvas();

      if (!video.srcObject) {
        const stream = (canvas as any).captureStream(30);
        video.srcObject = stream;
        await video.play();
      }

      await video.requestPictureInPicture();
      setIsPipActive(true);
      setPipType('video');

      video.addEventListener(
        'leavepictureinpicture',
        () => {
          setIsPipActive(false);
          setPipType(null);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        },
        { once: true }
      );

      toast.success('✨ Picture-in-Picture window opened!');
    } catch (err) {
      console.error('Failed to open Video PiP:', err);
      toast.error('Picture-in-Picture could not be opened in this browser.');
    }
  }, [persisted, displaySeconds, progressPercent, togglePause, stopAndLog, resetTimer]);

  const exitPip = useCallback(() => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
    }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
    setIsPipActive(false);
    setPipType(null);
  }, []);

  const togglePip = useCallback(async () => {
    if (isPipActive) {
      exitPip();
    } else {
      await enterPip();
    }
  }, [isPipActive, exitPip, enterPip]);

  return (
    <StudyTimerContext.Provider
      value={{
        isRunning: persisted.isRunning,
        isPaused: persisted.isPaused,
        mode: persisted.mode,
        targetMinutes: persisted.targetMinutes,
        displaySeconds,
        elapsedSeconds,
        progressPercent,
        section: persisted.section,
        topicId: persisted.topicId,
        topicName: persisted.topicName,
        sessionNotes: persisted.sessionNotes,
        soundEnabled: persisted.soundEnabled,
        isPipActive,
        pipType,
        isModalOpen,
        startTimer,
        pauseTimer,
        resumeTimer,
        togglePause,
        resetTimer,
        stopAndLog,
        togglePip,
        enterPip,
        exitPip,
        openTimerModal: () => setIsModalOpen(true),
        closeTimerModal: () => setIsModalOpen(false),
        setMode: (mode) => setPersisted((p) => ({ ...p, mode })),
        setTargetMinutes: (targetMinutes) => setPersisted((p) => ({ ...p, targetMinutes })),
        setSection: (section) => setPersisted((p) => ({ ...p, section })),
        setTopic: (topicId, topicName) => setPersisted((p) => ({ ...p, topicId, topicName })),
        setSessionNotes: (sessionNotes) => setPersisted((p) => ({ ...p, sessionNotes })),
        setSoundEnabled: (soundEnabled) => setPersisted((p) => ({ ...p, soundEnabled })),
        addFiveMinutes
      }}
    >
      {children}
    </StudyTimerContext.Provider>
  );
};

export const useStudyTimer = () => {
  const context = useContext(StudyTimerContext);
  if (!context) {
    throw new Error('useStudyTimer must be used within a StudyTimerProvider');
  }
  return context;
};
