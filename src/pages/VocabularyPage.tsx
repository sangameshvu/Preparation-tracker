import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Layers,
  RefreshCw,
  Search,
  Award,
  Flame,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Volume2,
  ChevronRight,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import {
  DifficultyLevel,
  ExamType,
  VocabWord,
  RootWord,
  DailyVocabSession,
  VocabUserProgress
} from '../types/vocabulary';
import {
  ALL_WORDS,
  ALL_ROOTS,
  WORD_MAP,
  ROOT_MAP,
  getTodayDateStr,
  getWordOfTheDay,
  loadUserVocabProgress,
  saveUserVocabProgress,
  getOrCreateDailySession,
  recordCardReview,
  toggleItemBookmark,
  generateDailyQuiz
} from '../services/vocabularyService';
import { VocabFlashcard } from '../components/vocabulary/VocabFlashcard';
import { RootWordFamilyExplorer } from '../components/vocabulary/RootWordFamilyExplorer';
import { VocabQuiz } from '../components/vocabulary/VocabQuiz';
import { RevisionZone } from '../components/vocabulary/RevisionZone';
import { toast } from 'sonner';

export const VocabularyPage: React.FC = () => {
  const { profile } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary active tabs
  const tabParam = searchParams.get('tab');
  const modeParam = searchParams.get('mode');

  const [activeTab, setActiveTab] = useState<'daily' | 'revision' | 'explorer' | 'search' | 'quiz' | 'progress'>(
    (tabParam as any) || 'daily'
  );

  // Deck mode in Daily Learn: 'words' | 'roots'
  const [activeDeck, setActiveDeck] = useState<'words' | 'roots'>(
    modeParam === 'roots' ? 'roots' : 'words'
  );

  // Card Indices
  const [wordCardIndex, setWordCardIndex] = useState(0);
  const [rootCardIndex, setRootCardIndex] = useState(0);

  // Progress State
  const [progress, setProgress] = useState<VocabUserProgress>(() => {
    return loadUserVocabProgress(profile?.id || 'guest');
  });

  const todayStr = getTodayDateStr();

  // Load and sync session
  const { session, updatedProgress } = useMemo(() => {
    return getOrCreateDailySession(todayStr, progress);
  }, [todayStr, progress]);

  // Persist session if newly generated
  useEffect(() => {
    if (updatedProgress !== progress) {
      setProgress(updatedProgress);
      saveUserVocabProgress(updatedProgress);
    }
  }, [updatedProgress, progress]);

  // Sync when profile changes
  useEffect(() => {
    const loaded = loadUserVocabProgress(profile?.id || 'guest');
    setProgress(loaded);
  }, [profile?.id]);

  // Handle URL mode switch on mount or param change
  useEffect(() => {
    if (modeParam === 'roots') {
      setActiveDeck('roots');
      setActiveTab('daily');
    } else if (modeParam === 'words') {
      setActiveDeck('words');
      setActiveTab('daily');
    }
    if (tabParam && ['daily', 'revision', 'explorer', 'search', 'quiz', 'progress'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [modeParam, tabParam]);

  // Word of the Day
  const wotd = useMemo(() => getWordOfTheDay(todayStr), [todayStr]);

  // Active Daily Items
  const dailyWords = useMemo(
    () => session.wordIds.map((id) => WORD_MAP.get(id)).filter(Boolean) as VocabWord[],
    [session.wordIds]
  );

  const dailyRoots = useMemo(
    () => session.rootIds.map((id) => ROOT_MAP.get(id)).filter(Boolean) as RootWord[],
    [session.rootIds]
  );

  // Card Status Updates
  const handleMarkCardStatus = (status: 'known' | 'needs_revision') => {
    const isWordDeck = activeDeck === 'words';
    const currentItem = isWordDeck ? dailyWords[wordCardIndex] : dailyRoots[rootCardIndex];
    if (!currentItem) return;

    const { updatedProgress: nextProg, promoted, nextLevel } = recordCardReview(
      progress,
      todayStr,
      isWordDeck ? 'word' : 'root',
      currentItem.id,
      status
    );

    setProgress(nextProg);
    saveUserVocabProgress(nextProg);

    if (promoted && nextLevel) {
      toast.success(
        `🎉 Congratulations! You achieved 80%+ mastery across 3 sessions and unlocked ${nextLevel.toUpperCase()} level!`
      );
    } else {
      toast.info(status === 'known' ? 'Marked as Known ✓' : 'Scheduled for Spaced Revision ⚡');
    }

    // Auto advance to next card if available
    if (isWordDeck) {
      if (wordCardIndex + 1 < dailyWords.length) {
        setWordCardIndex((prev) => prev + 1);
      }
    } else {
      if (rootCardIndex + 1 < dailyRoots.length) {
        setRootCardIndex((prev) => prev + 1);
      }
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (type: 'word' | 'root', id: string) => {
    const nextProg = toggleItemBookmark(progress, type, id);
    setProgress(nextProg);
    saveUserVocabProgress(nextProg);
    const isNowBookmarked =
      type === 'word' ? nextProg.bookmarkedWordIds.includes(id) : nextProg.bookmarkedRootIds.includes(id);
    toast.info(isNowBookmarked ? 'Bookmarked item' : 'Removed bookmark');
  };

  // Manual Level Override
  const handleChangeLevel = (type: 'word' | 'root', level: DifficultyLevel) => {
    const nextProg: VocabUserProgress = {
      ...progress,
      ...(type === 'word' ? { currentWordLevel: level } : { currentRootLevel: level }),
      // Reset daily session for new level so user immediately gets appropriate cards
      sessionsHistory: {
        ...progress.sessionsHistory,
        [todayStr]: {
          ...session,
          ...(type === 'word' ? { wordIds: [], wordReviews: {} } : { rootIds: [], rootReviews: {} })
        }
      }
    };
    // Delete today's session to re-seed with selected difficulty
    delete nextProg.sessionsHistory[todayStr];
    const { session: newSess, updatedProgress: reseeded } = getOrCreateDailySession(todayStr, nextProg);
    setProgress(reseeded);
    saveUserVocabProgress(reseeded);
    toast.success(`Switched ${type === 'word' ? 'vocabulary' : 'root'} level to ${level.toUpperCase()}!`);
  };

  // Quiz Questions
  const quizQuestions = useMemo(() => generateDailyQuiz(session), [session]);

  // Dictionary / Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState<ExamType>('All');
  const [searchDiffFilter, setSearchDiffFilter] = useState<string>('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const filteredSearchWords = useMemo(() => {
    return ALL_WORDS.filter((w) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.synonyms.some((s) => s.toLowerCase().includes(q));

      const matchExam = examFilter === 'All' || (w.exam_relevance && w.exam_relevance.includes(examFilter));
      const matchDiff = searchDiffFilter === 'All' || w.difficulty === searchDiffFilter;
      const matchBm = !onlyBookmarks || progress.bookmarkedWordIds.includes(w.id);

      return matchQuery && matchExam && matchDiff && matchBm;
    });
  }, [searchQuery, examFilter, searchDiffFilter, onlyBookmarks, progress.bookmarkedWordIds]);

  const filteredSearchRoots = useMemo(() => {
    return ALL_ROOTS.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        r.root.toLowerCase().includes(q) ||
        r.core_meaning.toLowerCase().includes(q) ||
        r.derived_words.some((d) => d.word.toLowerCase().includes(q));

      const matchExam = examFilter === 'All' || (r.exam_relevance && r.exam_relevance.includes(examFilter));
      const matchDiff = searchDiffFilter === 'All' || r.difficulty === searchDiffFilter;
      const matchBm = !onlyBookmarks || progress.bookmarkedRootIds.includes(r.id);

      return matchQuery && matchExam && matchDiff && matchBm;
    });
  }, [searchQuery, examFilter, searchDiffFilter, onlyBookmarks, progress.bookmarkedRootIds]);

  // Completion calculation
  const wordsReviewedCount = Object.keys(session.wordReviews).length;
  const rootsReviewedCount = Object.keys(session.rootReviews).length;
  const totalReviewedToday = wordsReviewedCount + rootsReviewedCount;
  const completionPercentage = Math.round((totalReviewedToday / 10) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ================= TOP HERO & DASHBOARD HEADER ================= */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 p-6 sm:p-8 glass-regular shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Daily MBA Vocabulary Engine</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Master 10 Cards Today: 5 Words + 5 Roots
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Systematic vocabulary building for CAT, XAT and GRE. Practice daily high-frequency words, decode root families, and lock in concepts with spaced revision.
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            {/* Streak */}
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 shadow-2xs">
              <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {progress.currentStreak} Day Streak
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Best: {progress.longestStreak} days
                </div>
              </div>
            </div>

            {/* Daily Completion */}
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 shadow-2xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {totalReviewedToday}/10 Today
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {completionPercentage}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Word of the Day Highlight Banner */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/50 p-4 rounded-2xl border">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold shrink-0">
              ⚡
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Word of the Day:
                </span>
                <strong className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                  {wotd.word}
                </strong>
                <span className="text-xs text-slate-500 italic">({wotd.part_of_speech})</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {wotd.definition} — <span className="italic">"{wotd.example}"</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Exam: {wotd.exam_relevance.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/70 dark:border-slate-800/70 scrollbar-none">
        {[
          { id: 'daily', label: 'Daily Flashcards', icon: BookOpen },
          { id: 'revision', label: 'Revision Zone (SRS)', icon: RefreshCw },
          { id: 'explorer', label: 'Word Family Explorer', icon: Layers },
          { id: 'search', label: 'Search & Bookmarks', icon: Search },
          { id: 'quiz', label: 'Mini Assessment', icon: Award },
          { id: 'progress', label: 'Progress & Retention', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: DAILY FLASHCARDS ================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Deck Switcher Cards (Section 1: High Frequency vs Section 2: Root Words) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High Frequency Words Section Card */}
            <div
              onClick={() => setActiveDeck('words')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                activeDeck === 'words'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      High-Frequency Words
                    </h3>
                    <span className="text-xs text-slate-500">5 Daily Words</span>
                  </div>
                </div>

                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {wordsReviewedCount}/5 Done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${(wordsReviewedCount / 5) * 100}%` }}
                />
              </div>

              {/* Level Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                <span className="text-slate-500 font-medium">Difficulty Level:</span>
                <select
                  value={progress.currentWordLevel}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleChangeLevel('word', e.target.value as DifficultyLevel);
                  }}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-blue-700 dark:text-blue-400 focus:outline-hidden"
                >
                  <option value="beginner">Beginner (Level 1)</option>
                  <option value="intermediate">Intermediate (Level 2)</option>
                  <option value="advanced">Advanced (Level 3)</option>
                </select>
              </div>
            </div>

            {/* Root Words Section Card */}
            <div
              onClick={() => setActiveDeck('roots')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                activeDeck === 'roots'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Layers className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Root Words & Word Families
                    </h3>
                    <span className="text-xs text-slate-500">5 Daily Roots</span>
                  </div>
                </div>

                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  {rootsReviewedCount}/5 Done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(rootsReviewedCount / 5) * 100}%` }}
                />
              </div>

              {/* Level Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                <span className="text-slate-500 font-medium">Difficulty Level:</span>
                <select
                  value={progress.currentRootLevel}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleChangeLevel('root', e.target.value as DifficultyLevel);
                  }}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-indigo-700 dark:text-indigo-400 focus:outline-hidden"
                >
                  <option value="beginner">Beginner (Level 1)</option>
                  <option value="intermediate">Intermediate (Level 2)</option>
                  <option value="advanced">Advanced (Level 3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Card Viewer */}
          <div className="pt-2">
            {activeDeck === 'words' ? (
              dailyWords.length > 0 ? (
                <VocabFlashcard
                  type="word"
                  item={dailyWords[wordCardIndex]}
                  currentIndex={wordCardIndex}
                  totalCards={dailyWords.length}
                  currentReview={session.wordReviews[dailyWords[wordCardIndex]?.id]}
                  isBookmarked={progress.bookmarkedWordIds.includes(dailyWords[wordCardIndex]?.id)}
                  onToggleBookmark={() => handleToggleBookmark('word', dailyWords[wordCardIndex]?.id)}
                  onMarkStatus={handleMarkCardStatus}
                  onNext={() => setWordCardIndex((i) => Math.min(i + 1, dailyWords.length - 1))}
                  onPrev={() => setWordCardIndex((i) => Math.max(i - 1, 0))}
                />
              ) : (
                <div className="text-center p-8 text-xs text-slate-400">Loading daily words...</div>
              )
            ) : dailyRoots.length > 0 ? (
              <VocabFlashcard
                type="root"
                item={dailyRoots[rootCardIndex]}
                currentIndex={rootCardIndex}
                totalCards={dailyRoots.length}
                currentReview={session.rootReviews[dailyRoots[rootCardIndex]?.id]}
                isBookmarked={progress.bookmarkedRootIds.includes(dailyRoots[rootCardIndex]?.id)}
                onToggleBookmark={() => handleToggleBookmark('root', dailyRoots[rootCardIndex]?.id)}
                onMarkStatus={handleMarkCardStatus}
                onNext={() => setRootCardIndex((i) => Math.min(i + 1, dailyRoots.length - 1))}
                onPrev={() => setRootCardIndex((i) => Math.max(i - 1, 0))}
              />
            ) : (
              <div className="text-center p-8 text-xs text-slate-400">Loading daily roots...</div>
            )}
          </div>

          {/* Session Complete Callout */}
          {wordsReviewedCount >= 5 && rootsReviewedCount >= 5 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-300 dark:border-emerald-800 text-center max-w-xl mx-auto shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>All 10 Cards Completed Today!</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Ready for Today's Mini Assessment?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Reinforce these 10 terms with a 5-question adaptive quiz.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Take Mini Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: REVISION ZONE (SRS) ================= */}
      {activeTab === 'revision' && (
        <RevisionZone
          progress={progress}
          onReviewCard={(type, itemId, status) => {
            const { updatedProgress: nextProg } = recordCardReview(
              progress,
              todayStr,
              type,
              itemId,
              status
            );
            setProgress(nextProg);
            saveUserVocabProgress(nextProg);
            toast.info(status === 'known' ? 'Mastered card!' : 'Scheduled next interval');
          }}
        />
      )}

      {/* ================= TAB 3: WORD FAMILY EXPLORER ================= */}
      {activeTab === 'explorer' && (
        <RootWordFamilyExplorer
          roots={ALL_ROOTS}
          bookmarkedRootIds={progress.bookmarkedRootIds}
          onToggleBookmark={(rootId) => handleToggleBookmark('root', rootId)}
        />
      )}

      {/* ================= TAB 4: SEARCH & BOOKMARKS ================= */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              MBA Vocabulary Dictionary & Search
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search all 390+ high-frequency vocabulary entries and 100+ Latin/Greek roots with real-time exam filtering.
            </p>
          </div>

          {/* Search Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by word, definition, root, or synonym..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Exam Filter */}
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value as ExamType)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Exams</option>
                <option value="CAT">CAT Only</option>
                <option value="XAT">XAT Only</option>
                <option value="GRE">GRE Only</option>
              </select>

              {/* Difficulty */}
              <select
                value={searchDiffFilter}
                onChange={(e) => setSearchDiffFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Only Bookmarks Toggle */}
              <button
                type="button"
                onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  onlyBookmarks
                    ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>Bookmarks ({progress.bookmarkedWordIds.length + progress.bookmarkedRootIds.length})</span>
              </button>
            </div>
          </div>

          {/* Results: Words */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] p-6 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Matching High-Frequency Words ({filteredSearchWords.length})
            </div>

            {filteredSearchWords.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 text-center">No words found matching filters.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredSearchWords.slice(0, 50).map((w) => {
                  const isBm = progress.bookmarkedWordIds.includes(w.id);
                  return (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                            {w.word}
                          </strong>
                          <span className="text-[10px] text-slate-500">({w.part_of_speech})</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase">
                            {w.difficulty}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark('word', w.id)}
                          className="text-slate-400 hover:text-amber-500"
                        >
                          {isBm ? (
                            <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {w.definition}
                      </p>
                      {w.example && (
                        <p className="text-[11px] text-slate-500 italic">
                          "{w.example}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results: Roots */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] p-6 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Matching Roots ({filteredSearchRoots.length})
            </div>

            {filteredSearchRoots.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 text-center">No roots found matching filters.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredSearchRoots.map((r) => {
                  const isBm = progress.bookmarkedRootIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 capitalize">
                            {r.root}
                          </strong>
                          <span className="text-xs text-slate-500">= "{r.core_meaning}"</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark('root', r.id)}
                          className="text-slate-400 hover:text-amber-500"
                        >
                          {isBm ? (
                            <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {r.origin_language} root · Family: {r.derived_words.map((d) => d.word).join(', ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: MINI ASSESSMENT ================= */}
      {activeTab === 'quiz' && (
        <VocabQuiz
          questions={quizQuestions}
          onFinishQuiz={(score, total) => {
            const nextProg: VocabUserProgress = {
              ...progress,
              quizScores: [
                ...(progress.quizScores || []),
                { date: todayStr, score, total }
              ]
            };
            setProgress(nextProg);
            saveUserVocabProgress(nextProg);
            toast.success(`Completed daily assessment: ${score}/${total}!`);
          }}
          onRetakeQuiz={() => {}}
        />
      )}

      {/* ================= TAB 6: PROGRESS & RETENTION ================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Learning Progress & Retention Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Detailed tracking of words and roots learned, spaced repetition mastery, and difficulty level progression.
            </p>
          </div>

          {/* Big Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Words Learned</span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {progress.totalWordsLearned}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">out of 396 high-frequency words</span>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Roots Learned</span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {progress.totalRootsLearned}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">out of 101 Greek/Latin roots</span>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]">
              <span className="text-xs text-slate-400 font-bold uppercase">Mastered in SRS</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {progress.spacedRepetitionCards.filter((c) => c.masteryStatus === 'mastered').length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">reached 30-day retention</span>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]">
              <span className="text-xs text-slate-400 font-bold uppercase">Learning Streak</span>
              <div className="text-3xl font-black text-amber-500 mt-2">
                {progress.currentStreak} days
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Longest: {progress.longestStreak} days</span>
            </div>
          </div>

          {/* Difficulty Level Progression Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  High-Frequency Word Progression
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                  {progress.currentWordLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {progress.wordLevelConsecutiveHighScores}/3 consecutive daily sessions with ≥80% mastery completed towards next level.
              </p>
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{ width: `${(progress.wordLevelConsecutiveHighScores / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Root Word Progression
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                  {progress.currentRootLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {progress.rootLevelConsecutiveHighScores}/3 consecutive daily sessions with ≥80% mastery completed towards next level.
              </p>
              <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all"
                  style={{ width: `${(progress.rootLevelConsecutiveHighScores / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
