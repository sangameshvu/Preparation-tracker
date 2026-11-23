import React, { useState } from 'react';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  RotateCw,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';
import { VocabWord, RootWord, CardReviewRecord } from '../../types/vocabulary';

interface VocabFlashcardProps {
  type: 'word' | 'root';
  item: VocabWord | RootWord;
  currentIndex: number;
  totalCards: number;
  currentReview?: CardReviewRecord;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onMarkStatus: (status: 'known' | 'needs_revision') => void;
  onNext: () => void;
  onPrev: () => void;
}

export const VocabFlashcard: React.FC<VocabFlashcardProps> = ({
  type,
  item,
  currentIndex,
  totalCards,
  currentReview,
  isBookmarked,
  onToggleBookmark,
  onMarkStatus,
  onNext,
  onPrev
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip when card item changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [item.id]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const term = type === 'word' ? (item as VocabWord).word : (item as RootWord).root;
      const utterance = new SpeechSynthesisUtterance(term);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const isWord = type === 'word';
  const wordItem = isWord ? (item as VocabWord) : null;
  const rootItem = !isWord ? (item as RootWord) : null;

  const difficultyColors = {
    beginner: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    intermediate: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    advanced: 'border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Top Controls: Counter & Category Badge */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              difficultyColors[item.difficulty]
            }`}
          >
            Level: {item.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentReview && (
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                currentReview.status === 'known'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {currentReview.status === 'known' ? '✓ Marked Known' : '⚡ Needs Revision'}
            </span>
          )}
          <button
            type="button"
            onClick={onToggleBookmark}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-2xs cursor-pointer"
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this item'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="relative w-full h-[380px] sm:h-[420px] cursor-pointer group"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* ================= CARD FRONT ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#121826]/95 glass-thick p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Header / Subdued indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {isWord ? <BookOpen className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isWord ? 'Vocabulary Word' : 'Root Word'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(item.exam_relevance || ['CAT', 'XAT', 'GRE']).map((exam) => (
                  <span
                    key={exam}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Term & Pronunciation */}
            <div className="flex flex-col items-center justify-center text-center my-auto py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white capitalize">
                  {isWord ? wordItem?.word : rootItem?.root}
                </h2>
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Pronounce"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              {/* Sub-label */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {isWord ? wordItem?.part_of_speech : `Origin: ${rootItem?.origin_language}`}
                </span>
                {rootItem?.variants && rootItem.variants.length > 1 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Variants: {rootItem.variants.join(', ')}
                  </span>
                )}
              </div>

              {/* Prompt Question */}
              <div className="mt-6 px-4 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium">
                {isWord
                  ? 'Do you know the meaning and contextual usage of this word?'
                  : 'What does this root mean and what words derive from it?'}
              </div>
            </div>

            {/* Bottom Hint */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <span className="flex items-center gap-1.5 font-medium">
                <RotateCw className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                Click card or press flip to reveal
              </span>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                Front ➔ Back
              </span>
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 dark:from-[#121826] dark:via-[#151c2e] dark:to-[#1a1c30] glass-thick p-5 sm:p-7 flex flex-col justify-between shadow-xl overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Header: Term & Tag */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 capitalize">
                  {isWord ? wordItem?.word : rootItem?.root}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({isWord ? wordItem?.part_of_speech : `${rootItem?.origin_language} root`})
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Answer & Details
              </span>
            </div>

            {/* Content Body */}
            <div className="my-auto py-2 space-y-3">
              {/* Definition / Core Meaning */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                  {isWord ? 'Definition:' : 'Core Meaning:'}
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {isWord ? wordItem?.definition : `"${rootItem?.core_meaning}"`}
                </p>
                {!isWord && rootItem?.explanation && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                    {rootItem.explanation}
                  </p>
                )}
              </div>

              {/* Example Context (for Words) */}
              {isWord && wordItem?.example && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-0.5">
                    Contextual Example:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{wordItem.example}"
                  </p>
                </div>
              )}

              {/* Synonyms & Antonyms for Words */}
              {isWord && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {wordItem?.synonyms && wordItem.synonyms.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                        Synonyms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {wordItem.synonyms.slice(0, 4).map((syn) => (
                          <span
                            key={syn}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {wordItem?.antonyms && wordItem.antonyms.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block mb-1">
                        Antonyms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {wordItem.antonyms.slice(0, 4).map((ant) => (
                          <span
                            key={ant}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                          >
                            {ant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Word Family for Roots */}
              {!isWord && rootItem?.derived_words && rootItem.derived_words.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1 mb-1">
                    <Layers className="h-3 w-3" />
                    Word Family ({rootItem.derived_words.length} derived words):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {rootItem.derived_words.map((dw) => (
                      <div
                        key={dw.word}
                        className="rounded-lg bg-white/70 dark:bg-slate-900/60 p-2 border border-slate-200/60 dark:border-slate-800/60 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 dark:text-white capitalize font-bold">
                            {dw.word}
                          </strong>
                          {dw.part_of_speech && (
                            <span className="text-[10px] text-slate-500">
                              {dw.part_of_speech}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                          {dw.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Note / Topics */}
              {isWord && wordItem?.learning_note && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                  💡 <strong>Exam Note:</strong> {wordItem.learning_note}
                </p>
              )}
            </div>

            {/* Bottom Flip Reminder */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="flex items-center gap-1.5 font-medium">
                <RotateCw className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                Click card to flip back
              </span>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                Back ➔ Front
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar: I Know This, Need Revision, Navigation */}
      <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Flip</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex === totalCards - 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Rating Buttons: "Need Revision" & "I Know This" */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
          <button
            type="button"
            onClick={() => onMarkStatus('needs_revision')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
              currentReview?.status === 'needs_revision'
                ? 'border-amber-400 bg-amber-500 text-white shadow-amber-500/25'
                : 'border-amber-300/80 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Need Revision</span>
          </button>

          <button
            type="button"
            onClick={() => onMarkStatus('known')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
              currentReview?.status === 'known'
                ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-600/25'
                : 'border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>I Know This</span>
          </button>
        </div>
      </div>
    </div>
  );
};
