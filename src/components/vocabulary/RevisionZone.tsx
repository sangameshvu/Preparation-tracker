import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Layers,
  BookOpen,
  Volume2,
  ChevronRight
} from 'lucide-react';
import {
  VocabUserProgress,
  SpacedRepetitionCard
} from '../../types/vocabulary';
import { WORD_MAP, ROOT_MAP, getTodayDateStr } from '../../services/vocabularyService';

interface RevisionZoneProps {
  progress: VocabUserProgress;
  onReviewCard: (type: 'word' | 'root', itemId: string, status: 'known' | 'needs_revision') => void;
}

export const RevisionZone: React.FC<RevisionZoneProps> = ({
  progress,
  onReviewCard
}) => {
  const [activeFilter, setActiveFilter] = useState<'due' | 'struggled' | 'mastered' | 'all'>('due');
  const todayStr = getTodayDateStr();

  const dueCards = progress.spacedRepetitionCards.filter((c) => c.nextReviewDate <= todayStr);
  const struggledCards = progress.spacedRepetitionCards.filter((c) => c.masteryStatus === 'learning');
  const masteredCards = progress.spacedRepetitionCards.filter((c) => c.masteryStatus === 'mastered');

  let displayCards: SpacedRepetitionCard[] = [];
  if (activeFilter === 'due') displayCards = dueCards;
  else if (activeFilter === 'struggled') displayCards = struggledCards;
  else if (activeFilter === 'mastered') displayCards = masteredCards;
  else displayCards = progress.spacedRepetitionCards;

  const speakTerm = (term: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(term);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-amber-500" />
          Spaced Repetition & Revision Zone
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scientifically timed intervals (1d, 3d, 7d, 14d, 30d) designed to lock high-frequency words and roots into long-term memory.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveFilter('due')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === 'due'
              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40'
              : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Due Today</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {dueCards.length}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Requires active recall
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('struggled')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === 'struggled'
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40'
              : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Needs Work</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {struggledCards.length}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Marked for review
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('mastered')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === 'mastered'
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
              : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Mastered</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {masteredCards.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Long-term retention
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
              : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Tracked</span>
            <Award className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {progress.spacedRepetitionCards.length}
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            All active SRS cards
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {activeFilter === 'due'
              ? 'Cards Due for Review Today'
              : activeFilter === 'struggled'
              ? 'Struggled Cards'
              : activeFilter === 'mastered'
              ? 'Mastered Terms'
              : 'All Revision Cards'}
            {' '}({displayCards.length})
          </div>

          <div className="text-xs text-slate-500">
            Click "Know" or "Revise" to update interval
          </div>
        </div>

        {displayCards.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {activeFilter === 'due'
              ? '🎉 All caught up! No cards currently due for review today.'
              : 'No items in this category yet. Review daily cards to build your spaced repetition deck!'}
          </div>
        ) : (
          <div className="space-y-3">
            {displayCards.map((c) => {
              const isWord = c.type === 'word';
              const wordItem = isWord ? WORD_MAP.get(c.itemId) : null;
              const rootItem = !isWord ? ROOT_MAP.get(c.itemId) : null;
              const term = isWord ? wordItem?.word : rootItem?.root;
              const meaning = isWord ? wordItem?.definition : rootItem?.core_meaning;

              return (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0">
                      {isWord ? <BookOpen className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                          {term}
                        </strong>
                        <button
                          type="button"
                          onClick={() => speakTerm(term || '')}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {isWord ? wordItem?.part_of_speech : `${rootItem?.origin_language} root`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                        {meaning}
                      </p>
                      {isWord && wordItem?.example && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{wordItem.example}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <div className="text-right text-[11px] text-slate-400 hidden sm:block mr-2">
                      <div>Interval: Step {c.intervalIndex + 1}/5</div>
                      <div>Due: {c.nextReviewDate}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onReviewCard(c.type, c.itemId, 'needs_revision')}
                      className="px-3 py-1.5 rounded-xl border border-amber-300/80 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                      title="Reset interval to 1 day"
                    >
                      Needs Work
                    </button>

                    <button
                      type="button"
                      onClick={() => onReviewCard(c.type, c.itemId, 'known')}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                      title="Advance to next interval"
                    >
                      Mastered ✓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
