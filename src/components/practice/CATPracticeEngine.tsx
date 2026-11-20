import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer,
  Calculator as CalcIcon,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  Layers,
  Award,
  BookOpen,
  ExternalLink,
  Flame,
  Info
} from 'lucide-react';
import { Tooltip as RadixTooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { initialTopics } from '../../data/topics';
import { CATQuestion, PracticeSessionRecord } from '../../data/catPyqQuestions';
import {
  fetchOrGeneratePracticeQuestions,
  savePracticeSession,
  getPracticeSessions
} from '../../utils/catPracticeEngine';
import { useAppData } from '../../context/AppDataContext';
import { MistakeCategory, SectionType } from '../../types';
import { toast } from 'sonner';

interface CATPracticeEngineProps {
  onSwitchToMistakes?: () => void;
}

export const CATPracticeEngine: React.FC<CATPracticeEngineProps> = ({ onSwitchToMistakes }) => {
  const { addMistake } = useAppData();

  // Mode & Configuration State
  const [section, setSection] = useState<'Quant' | 'DILR' | 'VARC'>('Quant');
  const [selectedTopic, setSelectedTopic] = useState<string>('Percentages & Profit Loss');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [drillMode, setDrillMode] = useState<'Quick Drill' | 'Standard Sprint' | 'Deep Practice'>('Standard Sprint');
  const [difficulty, setDifficulty] = useState<'Foundational' | 'Moderate' | 'Advanced'>('Moderate');

  // Exam Engine State
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [questions, setQuestions] = useState<CATQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 mins
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [sourceInfo, setSourceInfo] = useState<string>('');

  // Calculator State
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcClearNext, setCalcClearNext] = useState<boolean>(false);

  // Mistake Log Modal State
  const [mistakeModalOpen, setMistakeModalOpen] = useState<boolean>(false);
  const [mistakeTargetQuestion, setMistakeTargetQuestion] = useState<CATQuestion | null>(null);
  const [mistakeCategory, setMistakeCategory] = useState<MistakeCategory>('Concept gap');
  const [mistakeReason, setMistakeReason] = useState<string>('');
  const [mistakeRule, setMistakeRule] = useState<string>('');
  const [savedMistakeIds, setSavedMistakeIds] = useState<Record<string, boolean>>({});

  // Recent practice history
  const [history, setHistory] = useState<PracticeSessionRecord[]>([]);

  // Daily Aeon Reading Habit State (Key: cat2027_aeon_reading)
  const [aeonHabit, setAeonHabit] = useState<{
    lastReadDate?: string;
    streak: number;
    totalRead: number;
  }>(() => {
    try {
      const raw = localStorage.getItem('cat2027_aeon_reading');
      return raw ? JSON.parse(raw) : { streak: 0, totalRead: 0 };
    } catch {
      return { streak: 0, totalRead: 0 };
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isAeonReadToday = aeonHabit.lastReadDate === todayStr;

  const handleToggleAeonRead = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const updated = isAeonReadToday
      ? {
          lastReadDate: undefined,
          streak: Math.max(0, aeonHabit.streak - 1),
          totalRead: Math.max(0, aeonHabit.totalRead - 1)
        }
      : {
          lastReadDate: todayStr,
          streak: (aeonHabit.lastReadDate === yesterdayStr ? aeonHabit.streak : 0) + 1,
          totalRead: aeonHabit.totalRead + 1
        };

    setAeonHabit(updated);
    localStorage.setItem('cat2027_aeon_reading', JSON.stringify(updated));
    if (!isAeonReadToday) {
      toast.success('Awesome! Marked today\'s Aeon essay as read. Reading streak updated!');
    } else {
      toast.info('Marked Aeon essay as unread.');
    }
  };

  useEffect(() => {
    setHistory(getPracticeSessions());
  }, [sessionFinished]);

  // Topic options filtered by section
  const availableTopics = useMemo(() => {
    if (section === 'VARC') {
      const list = initialTopics
        .filter((t) => t.section === 'VARC')
        .map((t) => t.topicName);
      return [
        'CAT Pattern: Reading Comprehension (Passage + 4 Qs)',
        ...Array.from(new Set(list))
      ];
    }
    const list = initialTopics
      .filter((t) => t.section === section)
      .map((t) => t.topicName);
    return Array.from(new Set(list));
  }, [section]);

  // Sync selected topic when section changes
  useEffect(() => {
    if (availableTopics.length > 0) {
      setSelectedTopic(availableTopics[0]);
    }
  }, [section, availableTopics]);

  // Timer Countdown
  useEffect(() => {
    if (!sessionActive || sessionFinished || isTimerPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, sessionFinished, isTimerPaused]);

  const startSession = () => {
    const count = drillMode === 'Quick Drill' ? 3 : drillMode === 'Standard Sprint' ? 5 : 10;
    const duration = drillMode === 'Quick Drill' ? 480 : drillMode === 'Standard Sprint' ? 900 : 1800;

    const sourcing = fetchOrGeneratePracticeQuestions(section, selectedTopic, {
      customTopic,
      count,
      difficulty
    });

    setQuestions(sourcing.questions);
    setSourceInfo(sourcing.sourceDescription);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setTimeRemaining(duration);
    setIsTimerPaused(false);
    setSessionActive(true);
    setSessionFinished(false);
    setSavedMistakeIds({});
    toast.success(`Practice session started (${sourcing.sourceDescription})`);
  };

  const finishSession = () => {
    setSessionActive(false);
    setSessionFinished(true);

    // Compute results
    let correctCount = 0;
    let score = 0;
    const attemptedRecords = questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctOptionId;
      if (isCorrect) {
        correctCount++;
        score += 3;
      } else if (selected && !q.isTITA) {
        score -= 1; // Negative marking for wrong MCQ
      }
      return {
        questionId: q.id,
        selectedOptionId: selected,
        isCorrect,
        timeSpent: Math.round((drillMode === 'Quick Drill' ? 480 : drillMode === 'Standard Sprint' ? 900 : 1800 - timeRemaining) / questions.length)
      };
    });

    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const totalTime = (drillMode === 'Quick Drill' ? 480 : drillMode === 'Standard Sprint' ? 900 : 1800) - timeRemaining;

    const sessionRecord: PracticeSessionRecord = {
      id: `practice-${Date.now()}`,
      timestamp: new Date().toISOString(),
      section,
      topic: selectedTopic === 'Other' && customTopic ? customTopic : selectedTopic,
      mode: drillMode,
      difficulty,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      accuracy,
      timeSpentSeconds: totalTime,
      questionsAttempted: attemptedRecords
    };

    savePracticeSession(sessionRecord);
    toast.success(`Practice session completed! Score: ${score} (${accuracy}% accuracy)`);
  };

  const handleSelectOption = (qId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionId
    }));
  };

  const handleClearResponse = (qId: string) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleMarkReview = (qId: string) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const openMistakeModal = (q: CATQuestion) => {
    setMistakeTargetQuestion(q);
    setMistakeCategory('Concept gap');
    setMistakeReason(`Failed to notice condition: ${q.explanation.trapWarning || 'Calculation or logic flaw'}`);
    setMistakeRule(q.explanation.coreFormula || q.explanation.shortcutMethod || 'Carefully verify assumptions.');
    setMistakeModalOpen(true);
  };

  const handleSaveMistake = () => {
    if (!mistakeTargetQuestion) return;

    addMistake({
      date: new Date().toISOString().split('T')[0],
      source: 'Topic Practice Engine',
      section: mistakeTargetQuestion.section as SectionType,
      topic: mistakeTargetQuestion.topic,
      questionRef: mistakeTargetQuestion.sourceExam || mistakeTargetQuestion.id,
      mistakeType: mistakeCategory,
      whatWentWrong: mistakeReason,
      ruleForNextTime: mistakeRule,
      reSolved: false
    });

    setSavedMistakeIds((prev) => ({ ...prev, [mistakeTargetQuestion.id]: true }));
    setMistakeModalOpen(false);
    toast.success('Logged into Mistake Log with spaced revisit in 7 days!');
  };

  // Calculator Helper
  const handleCalcInput = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcMemory(null);
      setCalcOp(null);
      return;
    }
    if (['+', '-', '*', '/'].includes(val)) {
      setCalcMemory(parseFloat(calcDisplay));
      setCalcOp(val);
      setCalcClearNext(true);
      return;
    }
    if (val === '=') {
      if (calcOp && calcMemory !== null) {
        const cur = parseFloat(calcDisplay);
        let res = cur;
        if (calcOp === '+') res = calcMemory + cur;
        if (calcOp === '-') res = calcMemory - cur;
        if (calcOp === '*') res = calcMemory * cur;
        if (calcOp === '/') res = cur !== 0 ? calcMemory / cur : 0;
        setCalcDisplay(res.toString());
        setCalcMemory(null);
        setCalcOp(null);
        setCalcClearNext(true);
      }
      return;
    }
    if (val === 'sqrt') {
      const num = parseFloat(calcDisplay);
      setCalcDisplay(num >= 0 ? Math.sqrt(num).toString() : 'Error');
      return;
    }

    if (calcClearNext) {
      setCalcDisplay(val);
      setCalcClearNext(false);
    } else {
      setCalcDisplay((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIndex];

  // 1. SETUP VIEW (Before session starts)
  if (!sessionActive && !sessionFinished) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121826]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                CAT-Style Topic Practice
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Sharpen speed and accuracy with real CAT 2017–2024 Past Year Questions, verified sets, or AI-calibrated drills.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                3-Tier Sourcing Engine
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Step 1: Section & Topic */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                1. Select Section
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSection('Quant')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                    section === 'Quant'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  Quantitative Aptitude
                </button>
                <button
                  type="button"
                  onClick={() => setSection('DILR')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                    section === 'DILR'
                      ? 'border-teal-500 bg-teal-50/80 text-teal-800 shadow-sm dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-teal-600"></span>
                  Data Interpretation & LR
                </button>
                <button
                  type="button"
                  onClick={() => setSection('VARC')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs sm:text-sm font-semibold transition-all ${
                    section === 'VARC'
                      ? 'border-amber-500 bg-amber-50/80 text-amber-800 shadow-sm dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-600"></span>
                  Verbal Ability & RC
                </button>
              </div>

              {/* Quick Mode Toggle for VARC */}
              {section === 'VARC' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    VARC Practice Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedTopic('CAT Pattern: Reading Comprehension (Passage + 4 Qs)')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedTopic.includes('CAT Pattern')
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🎯 CAT Pattern (Full RC Set)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fallback = availableTopics.find((t) => !t.includes('CAT Pattern')) || 'Main idea & tone';
                        setSelectedTopic(fallback);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                        !selectedTopic.includes('CAT Pattern')
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      📚 Topic-Wise Practice
                    </button>
                  </div>
                </div>
              )}

              {/* Topic Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Topic Selection
                  </label>
                  {section === 'VARC' && selectedTopic.includes('CAT Pattern') && (
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      Standard CAT Pattern
                    </span>
                  )}
                </div>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {availableTopics.map((top) => (
                    <option key={top} value={top}>
                      {top}
                    </option>
                  ))}
                  <option value="Other">Other (Type Custom Topic...)</option>
                </select>
              </div>

              {/* Informative Callout for CAT Pattern RC Mode */}
              {section === 'VARC' && selectedTopic.includes('CAT Pattern') && (
                <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-3.5 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Official CAT VARC Pattern: 1 Full RC Passage + 4 Connected Questions</span>
                  </div>
                  <p className="leading-relaxed text-amber-900/90 dark:text-amber-300/90">
                    Not isolated single questions—this tests real exam stamina. You read an authentic 650–800 word passage on the left and navigate 4 connected questions (Primary Purpose, Contextual Inferences, Author's Tone, and Critical Reasoning) on the right.
                  </p>
                </div>
              )}

              {/* Custom Topic Input */}
              {selectedTopic === 'Other' && (
                <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Custom Topic Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Escapade Puzzles, Critical Reasoning, Base System..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    If this topic is not in the curated PYQ list, our AI generator will synthesize CAT-calibrated questions for it.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Format & Difficulty */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                2. Practice Format & Difficulty
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'Quick Drill', desc: '3 Qs • ~8m' },
                  { mode: 'Standard Sprint', desc: '5 Qs • ~15m' },
                  { mode: 'Deep Practice', desc: '10 Qs • ~30m' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setDrillMode(item.mode as any)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                      drillMode === item.mode
                        ? 'border-blue-500 bg-blue-50/80 font-bold text-blue-700 shadow-sm dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{item.mode}</span>
                    <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Target Percentile Calibration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Foundational', 'Moderate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                        difficulty === lvl
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {lvl === 'Foundational' ? '80th %ile' : lvl === 'Moderate' ? '90th %ile' : '99th %ile (Hard)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sourcing guarantee note */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Three-Tier Sourcing Guarantee:
                </div>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                  1. Real CAT Past Year Questions (2017-2024) with authentic exam conditions.
                  <br />
                  2. Curated topic drills with step-by-step shortcuts.
                  <br />
                  3. Dynamic AI Fallback if custom/unseen topics are chosen.
                </p>
              </div>

              <button
                type="button"
                onClick={startSession}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99]"
              >
                <Play className="h-4 w-4 fill-current" />
                Launch Practice Simulator
              </button>
            </div>
          </div>
        </div>

        {/* DEDICATED SECTION FOR AEON ESSAY & DAILY READING HABIT */}
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:via-[#121826] dark:to-orange-950/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300 font-bold shrink-0 mt-0.5">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Daily Aeon Essay Reading Section
                  </h3>
                  <RadixTooltip>
                    <TooltipTrigger asChild>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-help inline-flex items-center gap-1 hover:bg-amber-200/80 transition-colors">
                        <span>CAT Reading Gold Standard</span>
                        <Info className="h-3 w-3 opacity-75" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-xs p-2.5 leading-relaxed">
                      Direct navigation to today's published long-form Aeon essay (2,500–4,000 words). Develops reading endurance, unfamiliar subject tolerance, and argument-tracking agility for CAT VARC.
                    </TooltipContent>
                  </RadixTooltip>
                </div>
              </div>
            </div>

            {/* Habit Streak Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-100/60 px-3 py-1.5 text-xs font-bold text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-200 shadow-2xs">
                <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span>{aeonHabit.streak} Day Streak</span>
              </div>
            </div>
          </div>

          {/* Action Row: Read Today's Essay & Toggle Habit */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://aeon.co/essays"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Read Today's Aeon Essay</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <a
              href="https://aeon.co/ideas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Explore Aeon Ideas (1k words)</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={handleToggleAeonRead}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isAeonReadToday
                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${isAeonReadToday ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-400'}`} />
              <span>{isAeonReadToday ? 'Today\'s Essay Completed ✓' : 'Mark Today\'s Essay as Read'}</span>
            </button>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto">
              Total Read: <strong className="font-mono text-slate-900 dark:text-white">{aeonHabit.totalRead} essays</strong>
            </span>
          </div>

          {/* Curated High-Frequency CAT Genres on Aeon */}
          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2">
              Browse Aeon by High-Frequency CAT Genres:
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: '🧠 Philosophy & Mind', url: 'https://aeon.co/philosophy' },
                { label: '🧬 Science & Cognition', url: 'https://aeon.co/science' },
                { label: '🏛️ History & Anthropology', url: 'https://aeon.co/history' },
                { label: '🌐 Society & Politics', url: 'https://aeon.co/society' },
                { label: '🎨 Culture & Arts', url: 'https://aeon.co/culture' }
              ].map((genre) => (
                <a
                  key={genre.label}
                  href={genre.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200/70 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-amber-400 hover:text-amber-800 dark:border-amber-900/50 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:text-amber-200 transition-colors"
                >
                  <span>{genre.label}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Previous Practice History */}
        {history.length > 0 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121826]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Recent Practice Sessions ({history.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        item.section === 'Quant'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : item.section === 'DILR'
                          ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                          : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {item.section}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.topic}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.mode} • {item.totalQuestions} Qs • {formatTime(item.timeSpentSeconds)} spent
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Score: <span className={item.score > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>{item.score}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.accuracy}% Accuracy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. ACTIVE EXAM SIMULATOR VIEW
  if (sessionActive && currentQ) {
    const isMarked = markedForReview[currentQ.id];
    const selectedOpt = answers[currentQ.id];

    return (
      <div className="space-y-4">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass-thick px-4 py-3 shadow-lg border">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                currentQ.section === 'Quant'
                  ? 'glass-thin text-blue-700 dark:text-blue-300'
                  : currentQ.section === 'DILR'
                  ? 'glass-thin text-teal-800 dark:text-teal-300'
                  : 'glass-thin text-amber-800 dark:text-amber-300'
              }`}
            >
              {currentQ.section}
            </span>
            <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
              {currentQ.topic}
            </span>
            {currentQ.sourceExam && (
              <span className="hidden sm:inline-flex rounded-full glass-thin px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {currentQ.sourceExam}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Calculator Button */}
            <button
              type="button"
              onClick={() => setShowCalculator(!showCalculator)}
              className="flex items-center gap-1.5 rounded-xl glass-thin px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <CalcIcon className="h-3.5 w-3.5" />
              <span>CAT Calculator</span>
            </button>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 rounded-full glass-regular px-3.5 py-1 font-mono text-xs font-bold tabular-nums border shadow-xs ${
                timeRemaining < 120
                  ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'text-foreground'
              }`}
            >
              <Timer className="h-3.5 w-3.5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Finish Button */}
            <button
              type="button"
              onClick={finishSession}
              className="rounded-xl glass-tint px-3.5 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* On-Screen Calculator Floating Modal */}
        {showCalculator && (
          <div className="fixed bottom-6 right-6 z-50 w-64 rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-[#121826]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">CAT On-Screen Calculator</span>
              <button
                type="button"
                onClick={() => setShowCalculator(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mb-3 rounded-lg bg-slate-100 p-2 text-right font-mono text-lg font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
              {calcDisplay}
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {['C', 'sqrt', '/', '*', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCalcInput(key)}
                  className={`rounded-lg py-2 text-center transition-colors ${
                    key === '='
                      ? 'col-span-1 bg-blue-600 text-white hover:bg-blue-700'
                      : key === '0'
                      ? 'col-span-2 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                      : ['C', 'sqrt', '/', '*', '-', '+'].includes(key)
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Interface: Left Caselet / Right Question or Stacked */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* DILR Caselet / RC Passage Split Panel */}
          {currentQ.caselet ? (
            <div className="lg:col-span-6 rounded-3xl glass-thick p-6 shadow-xl border overflow-y-auto max-h-[600px]">
              <div className="mb-4">
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  currentQ.section === 'VARC'
                    ? 'glass-thin text-amber-800 dark:text-amber-300'
                    : 'glass-thin text-teal-800 dark:text-teal-300'
                }`}>
                  {currentQ.section === 'VARC' ? 'Reading Comprehension Passage' : 'DILR Caselet Data'}
                </span>
                <h3 className="mt-2 text-base font-bold text-foreground">
                  {currentQ.caselet.title}
                </h3>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {currentQ.caselet.description}
              </p>

              {currentQ.caselet.rules && (
                <div className="mt-4 space-y-1.5 rounded-2xl glass-subtier p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Given Conditions:
                  </span>
                  <ul className="list-disc pl-4 text-xs space-y-1 text-foreground">
                    {currentQ.caselet.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentQ.caselet.tableData && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        {currentQ.caselet.tableData.headers.map((h, idx) => (
                          <th key={idx} className="pb-2 font-bold text-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {currentQ.caselet.tableData.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 text-muted-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {/* Question & Options Column */}
          <div className={`${currentQ.caselet ? 'lg:col-span-6' : 'lg:col-span-8'} space-y-6`}>
            <div className="rounded-3xl glass-thick p-6 shadow-xl border">
              {/* Question Number and Status */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
                <span className="text-sm font-bold text-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  {isMarked && (
                    <span className="inline-flex items-center gap-1 rounded-full glass-thin px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                      <Bookmark className="h-3 w-3 fill-current" />
                      Marked for Review
                    </span>
                  )}
                  {selectedOpt && (
                    <span className="rounded-full glass-thin px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Answered
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                {currentQ.questionText}
              </div>

              {/* Option Radio List */}
              <div className="mt-6 space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOpt === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 shadow-sm dark:border-blue-500 dark:bg-blue-950/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'font-semibold text-blue-900 dark:text-blue-100'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleMarkReview(currentQ.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isMarked ? 'fill-current text-purple-600' : ''}`} />
                    {isMarked ? 'Unmark Review' : 'Mark for Review'}
                  </button>
                  {selectedOpt && (
                    <button
                      type="button"
                      onClick={() => handleClearResponse(currentQ.id)}
                      className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      Clear Response
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                      } else {
                        finishSession();
                      }
                    }}
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Save & Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    ) : (
                      'Submit Session'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className={`${currentQ.caselet ? 'lg:col-span-12' : 'lg:col-span-4'} space-y-4`}>
            <div className="rounded-3xl glass-regular p-5 shadow-xl border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Question Palette
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAns = !!answers[q.id];
                  const isRev = !!markedForReview[q.id];
                  const isCurr = idx === currentIndex;

                  let bgClass = 'glass-thin text-foreground';
                  if (isAns && isRev) {
                    bgClass = 'bg-purple-600 text-white shadow-xs';
                  } else if (isAns) {
                    bgClass = 'bg-emerald-600 text-white shadow-xs';
                  } else if (isRev) {
                    bgClass = 'glass-thin text-purple-700 dark:text-purple-300 border border-purple-400';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all ${bgClass} ${
                        isCurr ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-600"></span>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. POST-SESSION DIAGNOSTIC & MISTAKE LOG REVIEW
  if (sessionFinished) {
    let correctCount = 0;
    let score = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans === q.correctOptionId) {
        correctCount++;
        score += 3;
      } else if (ans) {
        score -= 1;
      }
    });

    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Results Banner */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#121826]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Diagnostic Results • {section} ({selectedTopic})
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Practice Session Analysis
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {sourceInfo}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSessionActive(false);
                  setSessionFinished(false);
                }}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Practice Another Topic
              </button>
              {onSwitchToMistakes && (
                <button
                  type="button"
                  onClick={onSwitchToMistakes}
                  className="flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  View Mistake Log
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-blue-50/60 p-4 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Total Score</span>
              <div className="mt-1 text-2xl font-extrabold text-blue-950 dark:text-blue-100 tabular-nums">
                {score} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">pts</span>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50/60 p-4 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Accuracy</span>
              <div className="mt-1 text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 tabular-nums">
                {accuracy}%
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Correct Answers</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {correctCount} / {questions.length}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Time Taken</span>
              <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatTime((drillMode === 'Quick Drill' ? 480 : drillMode === 'Standard Sprint' ? 900 : 1800) - timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Solutions & 1-Click Mistake Log Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Question Breakdown & Solutions
          </h3>

          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correctOptionId;
            const isSaved = !!savedMistakeIds[q.id];

            return (
              <div
                key={q.id}
                className={`rounded-3xl border p-6 transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-[#121826]'
                    : 'border-rose-200 bg-white dark:border-rose-900/60 dark:bg-[#121826]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Q{idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Correct (+3)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        <XCircle className="h-3.5 w-3.5" />
                        {userAns ? 'Incorrect (-1)' : 'Unattempted (0)'}
                      </span>
                    )}
                    {q.sourceExam && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {q.sourceExam}
                      </span>
                    )}
                  </div>

                  {/* 1-Click Add to Mistake Log Button */}
                  {!isCorrect && (
                    <button
                      type="button"
                      disabled={isSaved}
                      onClick={() => openMistakeModal(q)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isSaved
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                      }`}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      {isSaved ? 'Added to Mistake Log' : 'Add to Mistake Log'}
                    </button>
                  )}
                </div>

                {/* Question */}
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {q.questionText}
                </div>

                {/* Options Comparison */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt) => {
                    const isUserChoice = userAns === opt.id;
                    const isRightChoice = q.correctOptionId === opt.id;

                    let optStyle = 'border-slate-200 bg-slate-50/50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
                    if (isRightChoice) {
                      optStyle = 'border-emerald-400 bg-emerald-50/80 font-bold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200';
                    } else if (isUserChoice && !isRightChoice) {
                      optStyle = 'border-rose-400 bg-rose-50/80 font-semibold text-rose-900 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-200';
                    }

                    return (
                      <div key={opt.id} className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs ${optStyle}`}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 font-bold dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                          {opt.id}
                        </span>
                        <span className="truncate">{opt.text}</span>
                        {isRightChoice && <span className="ml-auto text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Correct</span>}
                        {isUserChoice && !isRightChoice && <span className="ml-auto text-[10px] font-bold text-rose-700 dark:text-rose-300">Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Comprehensive Explanation & Shortcut */}
                <div className="mt-4 rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Step-by-Step Solution:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {q.explanation.steps.map((st, sIdx) => (
                      <li key={sIdx}>{st}</li>
                    ))}
                  </ol>

                  {q.explanation.shortcutMethod && (
                    <div className="mt-2 rounded-xl bg-blue-50/80 p-2.5 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                      <span className="font-bold">⚡ CAT Shortcut / Fast Technique: </span>
                      {q.explanation.shortcutMethod}
                    </div>
                  )}

                  {q.explanation.coreFormula && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Key Formula: </span>
                      {q.explanation.coreFormula}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: 1-Click Add Mistake */}
        {mistakeModalOpen && mistakeTargetQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl glass-thick p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Log Mistake for Spaced Repetition
                </h4>
                <button
                  type="button"
                  onClick={() => setMistakeModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-600 dark:text-slate-400 uppercase">Question Topic</span>
                  <div className="mt-1 font-semibold text-slate-900 dark:text-white">
                    [{mistakeTargetQuestion.section}] {mistakeTargetQuestion.topic}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Mistake Category</label>
                  <select
                    value={mistakeCategory}
                    onChange={(e) => setMistakeCategory(e.target.value as MistakeCategory)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    {[
                      'Concept gap',
                      'Calculation error',
                      'Misread question',
                      'Time sink',
                      'Wrong guess',
                      'Option elimination',
                      'Set selection'
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">What Went Wrong?</label>
                  <textarea
                    rows={2}
                    value={mistakeReason}
                    onChange={(e) => setMistakeReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 uppercase">Rule For Next Time</label>
                  <textarea
                    rows={2}
                    value={mistakeRule}
                    onChange={(e) => setMistakeRule(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Spaced Repetition: </span>
                  This mistake will be scheduled for revision in exactly 7 days.
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMistakeModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMistake}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Confirm & Save to Mistake Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
