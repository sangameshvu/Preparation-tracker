import React, { useState, useMemo } from 'react';
import { Search, Layers, ChevronRight, Bookmark, BookmarkCheck, BookOpen, Volume2 } from 'lucide-react';
import { RootWord } from '../../types/vocabulary';

interface RootWordFamilyExplorerProps {
  roots: RootWord[];
  bookmarkedRootIds: string[];
  onToggleBookmark: (rootId: string) => void;
}

export const RootWordFamilyExplorer: React.FC<RootWordFamilyExplorerProps> = ({
  roots,
  bookmarkedRootIds,
  onToggleBookmark
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeRootId, setActiveRootId] = useState<string>(roots[0]?.id || '');

  // Extract origins
  const origins = useMemo(() => {
    const set = new Set<string>();
    roots.forEach((r) => set.add(r.origin_language));
    return ['All', ...Array.from(set)];
  }, [roots]);

  // Filtered roots
  const filteredRoots = useMemo(() => {
    return roots.filter((r) => {
      const matchSearch =
        r.root.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.core_meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.derived_words.some((d) => d.word.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchOrigin = selectedOrigin === 'All' || r.origin_language === selectedOrigin;
      const matchDiff = selectedDifficulty === 'All' || r.difficulty === selectedDifficulty;

      return matchSearch && matchOrigin && matchDiff;
    });
  }, [roots, searchQuery, selectedOrigin, selectedDifficulty]);

  const activeRoot = useMemo(() => {
    return roots.find((r) => r.id === activeRootId) || filteredRoots[0] || roots[0];
  }, [roots, activeRootId, filteredRoots]);

  const speakTerm = (term: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(term);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-500" />
          Word Family & Etymology Explorer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore Latin and Greek root systems. Master one root to effortlessly unlock 5–10 related high-frequency MBA exam words.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roots, meanings, or derived words..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            {origins.map((o) => (
              <option key={o} value={o}>
                Origin: {o}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Master Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Root Word List (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#121826] p-4 shadow-xs max-h-[600px] overflow-y-auto space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            Available Roots ({filteredRoots.length})
          </div>

          {filteredRoots.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching roots found. Try adjusting your search query.
            </div>
          ) : (
            filteredRoots.map((r) => {
              const isSelected = activeRoot?.id === r.id;
              const isBm = bookmarkedRootIds.includes(r.id);

              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRootId(r.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-700'
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
                      {r.root}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      = "{r.core_meaning}"
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {r.origin_language}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Root Deep-Dive & Word Family (7 Cols) */}
        {activeRoot && (
          <div className="lg:col-span-7 rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-[#121826] dark:via-[#161c2e] dark:to-[#1b1933] p-6 sm:p-7 shadow-sm space-y-6">
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-4 border-b border-indigo-100 dark:border-indigo-950 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 capitalize tracking-tight">
                    {activeRoot.root}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakTerm(activeRoot.root)}
                    className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Pronounce"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                    Origin: {activeRoot.origin_language}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                    Level: {activeRoot.difficulty}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleBookmark(activeRoot.id)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors shadow-2xs"
                title={bookmarkedRootIds.includes(activeRoot.id) ? 'Remove Bookmark' : 'Bookmark Root'}
              >
                {bookmarkedRootIds.includes(activeRoot.id) ? (
                  <BookmarkCheck className="h-5 w-5 text-amber-500 fill-amber-500" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Core Etymology & Meaning */}
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 p-4 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Core Meaning:
              </span>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                "{activeRoot.core_meaning}"
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {activeRoot.explanation}
              </p>
            </div>

            {/* Word Family Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Derived Word Family ({activeRoot.derived_words.length} terms)
                </span>
                <span className="text-[11px] text-slate-400">
                  High-Utility Exam Vocabulary
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRoot.derived_words.map((dw) => (
                  <div
                    key={dw.word}
                    className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white capitalize">
                          {dw.word}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakTerm(dw.word)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                      {dw.part_of_speech && (
                        <span className="text-[10px] font-medium text-slate-500">
                          {dw.part_of_speech}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug font-medium">
                      {dw.meaning}
                    </p>

                    {dw.synonyms && dw.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {dw.synonyms.slice(0, 3).map((syn) => (
                          <span
                            key={syn}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
