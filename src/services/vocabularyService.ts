import highFrequencyWordsData from '../data/vocabulary/highFrequencyWords.json';
import rootWordsData from '../data/vocabulary/rootWords.json';
import {
  VocabWord,
  RootWord,
  DifficultyLevel,
  DailyVocabSession,
  SpacedRepetitionCard,
  VocabUserProgress,
  QuizQuestion,
  ExamType
} from '../types/vocabulary';

// Type-cast imported datasets
export const ALL_WORDS: VocabWord[] = highFrequencyWordsData as VocabWord[];
export const ALL_ROOTS: RootWord[] = rootWordsData as RootWord[];

// Quick lookup maps
export const WORD_MAP = new Map<string, VocabWord>(ALL_WORDS.map((w) => [w.id, w]));
export const ROOT_MAP = new Map<string, RootWord>(ALL_ROOTS.map((r) => [r.id, r]));

const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30];

// Hash function for deterministic seed based on date string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Format date utility
export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export {
  createDefaultUserProgress,
  loadUserVocabProgress,
  saveUserVocabProgress
} from './vocabStorage';

// Word of the Day (Deterministic across calendar days)
export function getWordOfTheDay(dateStr: string = getTodayDateStr()): VocabWord {
  const seed = hashString(`wotd-${dateStr}`);
  // Pick from core/intermediate or advanced
  const index = seed % ALL_WORDS.length;
  return ALL_WORDS[index] || ALL_WORDS[0];
}

// Deterministic selection of 5 words and 5 roots for a specific date
export function getOrCreateDailySession(
  dateStr: string,
  progress: VocabUserProgress
): { session: DailyVocabSession; updatedProgress: VocabUserProgress } {
  // Check if session already exists for this date
  if (progress.sessionsHistory[dateStr]) {
    return { session: progress.sessionsHistory[dateStr], updatedProgress: progress };
  }

  // 1. Select 5 High-Frequency Words for current level
  const wordLevel = progress.currentWordLevel;
  const levelWords = ALL_WORDS.filter((w) => w.difficulty === wordLevel);
  const eligibleWords = levelWords.length >= 5 ? levelWords : ALL_WORDS;

  // Filter out words studied in recent 10 sessions to prevent immediate repeat
  const recentWordIds = new Set<string>();
  const pastDates = Object.keys(progress.sessionsHistory).sort().reverse().slice(0, 10);
  pastDates.forEach((d) => {
    progress.sessionsHistory[d].wordIds.forEach((id) => recentWordIds.add(id));
  });

  let candidatesWords = eligibleWords.filter((w) => !recentWordIds.has(w.id));
  if (candidatesWords.length < 5) {
    candidatesWords = eligibleWords;
  }

  const wordSeed = hashString(`words-${dateStr}-${wordLevel}`);
  const selectedWordIds: string[] = [];
  const wordPool = [...candidatesWords];

  for (let i = 0; i < 5; i++) {
    const idx = (wordSeed + i * 17) % wordPool.length;
    selectedWordIds.push(wordPool[idx].id);
    wordPool.splice(idx, 1);
  }

  // 2. Select 5 Root Words for current level
  const rootLevel = progress.currentRootLevel;
  const levelRoots = ALL_ROOTS.filter((r) => r.difficulty === rootLevel);
  const eligibleRoots = levelRoots.length >= 5 ? levelRoots : ALL_ROOTS;

  const recentRootIds = new Set<string>();
  pastDates.forEach((d) => {
    progress.sessionsHistory[d].rootIds.forEach((id) => recentRootIds.add(id));
  });

  let candidatesRoots = eligibleRoots.filter((r) => !recentRootIds.has(r.id));
  if (candidatesRoots.length < 5) {
    candidatesRoots = eligibleRoots;
  }

  const rootSeed = hashString(`roots-${dateStr}-${rootLevel}`);
  const selectedRootIds: string[] = [];
  const rootPool = [...candidatesRoots];

  for (let i = 0; i < 5; i++) {
    const idx = (rootSeed + i * 19) % rootPool.length;
    selectedRootIds.push(rootPool[idx].id);
    rootPool.splice(idx, 1);
  }

  const newSession: DailyVocabSession = {
    sessionDate: dateStr,
    wordIds: selectedWordIds,
    rootIds: selectedRootIds,
    wordsCompleted: false,
    rootsCompleted: false,
    wordReviews: {},
    rootReviews: {}
  };

  const updatedProgress: VocabUserProgress = {
    ...progress,
    sessionsHistory: {
      ...progress.sessionsHistory,
      [dateStr]: newSession
    }
  };

  return { session: newSession, updatedProgress };
}

// Update card review within daily session
export function recordCardReview(
  progress: VocabUserProgress,
  dateStr: string,
  type: 'word' | 'root',
  itemId: string,
  status: 'known' | 'needs_revision'
): { updatedProgress: VocabUserProgress; promoted: boolean; nextLevel?: DifficultyLevel } {
  const currentSession = progress.sessionsHistory[dateStr] || getOrCreateDailySession(dateStr, progress).session;

  const reviewRecord = {
    status,
    reviewedAt: new Date().toISOString()
  };

  const updatedSession: DailyVocabSession = {
    ...currentSession,
    wordReviews: type === 'word' ? { ...currentSession.wordReviews, [itemId]: reviewRecord } : currentSession.wordReviews,
    rootReviews: type === 'root' ? { ...currentSession.rootReviews, [itemId]: reviewRecord } : currentSession.rootReviews
  };

  // Check completion
  const wordsReviewedCount = Object.keys(updatedSession.wordReviews).length;
  const rootsReviewedCount = Object.keys(updatedSession.rootReviews).length;
  updatedSession.wordsCompleted = wordsReviewedCount >= updatedSession.wordIds.length;
  updatedSession.rootsCompleted = rootsReviewedCount >= updatedSession.rootIds.length;

  // Handle Spaced Repetition card update
  let updatedSRS = [...progress.spacedRepetitionCards];
  const existingSRSIdx = updatedSRS.findIndex((c) => c.type === type && c.itemId === itemId);

  const itemDifficulty =
    type === 'word'
      ? WORD_MAP.get(itemId)?.difficulty || progress.currentWordLevel
      : ROOT_MAP.get(itemId)?.difficulty || progress.currentRootLevel;

  if (status === 'needs_revision') {
    // Add or reset in SRS
    const nextDue = addDaysToDateStr(dateStr, 1);
    if (existingSRSIdx >= 0) {
      updatedSRS[existingSRSIdx] = {
        ...updatedSRS[existingSRSIdx],
        lastReviewedDate: dateStr,
        nextReviewDate: nextDue,
        intervalIndex: 0,
        reviewCount: updatedSRS[existingSRSIdx].reviewCount + 1,
        masteryStatus: 'learning'
      };
    } else {
      updatedSRS.push({
        id: `srs_${type}_${itemId}`,
        type,
        itemId,
        lastReviewedDate: dateStr,
        nextReviewDate: nextDue,
        intervalIndex: 0,
        reviewCount: 1,
        masteryStatus: 'learning',
        difficulty: itemDifficulty
      });
    }
  } else if (status === 'known' && existingSRSIdx >= 0) {
    // Advance SRS
    const currentCard = updatedSRS[existingSRSIdx];
    const nextIntervalIdx = currentCard.intervalIndex + 1;
    if (nextIntervalIdx < SRS_INTERVALS_DAYS.length) {
      const days = SRS_INTERVALS_DAYS[nextIntervalIdx];
      updatedSRS[existingSRSIdx] = {
        ...currentCard,
        lastReviewedDate: dateStr,
        nextReviewDate: addDaysToDateStr(dateStr, days),
        intervalIndex: nextIntervalIdx,
        reviewCount: currentCard.reviewCount + 1,
        masteryStatus: nextIntervalIdx >= 3 ? 'mastered' : 'reviewing'
      };
    } else {
      updatedSRS[existingSRSIdx] = {
        ...currentCard,
        lastReviewedDate: dateStr,
        nextReviewDate: addDaysToDateStr(dateStr, 30),
        intervalIndex: SRS_INTERVALS_DAYS.length - 1,
        reviewCount: currentCard.reviewCount + 1,
        masteryStatus: 'mastered'
      };
    }
  }

  // Handle Streak & Totals
  let currentStreak = progress.currentStreak;
  let longestStreak = progress.longestStreak;
  let lastActiveDate = progress.lastActiveDate;

  if (lastActiveDate !== dateStr) {
    const yesterday = addDaysToDateStr(dateStr, -1);
    if (lastActiveDate === yesterday) {
      currentStreak += 1;
    } else if (lastActiveDate === '') {
      currentStreak = 1;
    } else {
      currentStreak = 1; // broken streak restarted
    }
    lastActiveDate = dateStr;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  // Count total items ever learned/reviewed
  const allWordIdsSet = new Set<string>();
  const allRootIdsSet = new Set<string>();
  Object.values({ ...progress.sessionsHistory, [dateStr]: updatedSession }).forEach((s) => {
    Object.keys(s.wordReviews).forEach((id) => allWordIdsSet.add(id));
    Object.keys(s.rootReviews).forEach((id) => allRootIdsSet.add(id));
  });

  // Check Level Progression (3 consecutive sessions with >= 80% mastery, i.e. 4/5 or 5/5)
  let promoted = false;
  let nextLevel: DifficultyLevel | undefined;
  let newWordLevel = progress.currentWordLevel;
  let newRootLevel = progress.currentRootLevel;
  let newWordConsecutive = progress.wordLevelConsecutiveHighScores;
  let newRootConsecutive = progress.rootLevelConsecutiveHighScores;

  const nextLevelMap: Record<DifficultyLevel, DifficultyLevel | null> = {
    beginner: 'intermediate',
    intermediate: 'advanced',
    advanced: null
  };

  if (type === 'word' && updatedSession.wordsCompleted) {
    const knownCount = Object.values(updatedSession.wordReviews).filter((r) => r.status === 'known').length;
    const masteryRate = knownCount / updatedSession.wordIds.length;
    if (masteryRate >= 0.8) {
      newWordConsecutive += 1;
      if (newWordConsecutive >= 3 && nextLevelMap[progress.currentWordLevel]) {
        newWordLevel = nextLevelMap[progress.currentWordLevel]!;
        newWordConsecutive = 0;
        promoted = true;
        nextLevel = newWordLevel;
      }
    } else {
      newWordConsecutive = 0;
    }
  } else if (type === 'root' && updatedSession.rootsCompleted) {
    const knownCount = Object.values(updatedSession.rootReviews).filter((r) => r.status === 'known').length;
    const masteryRate = knownCount / updatedSession.rootIds.length;
    if (masteryRate >= 0.8) {
      newRootConsecutive += 1;
      if (newRootConsecutive >= 3 && nextLevelMap[progress.currentRootLevel]) {
        newRootLevel = nextLevelMap[progress.currentRootLevel]!;
        newRootConsecutive = 0;
        promoted = true;
        nextLevel = newRootLevel;
      }
    } else {
      newRootConsecutive = 0;
    }
  }

  const updatedProgress: VocabUserProgress = {
    ...progress,
    currentWordLevel: newWordLevel,
    currentRootLevel: newRootLevel,
    totalWordsLearned: allWordIdsSet.size,
    totalRootsLearned: allRootIdsSet.size,
    currentStreak,
    longestStreak,
    lastActiveDate,
    wordLevelConsecutiveHighScores: newWordConsecutive,
    rootLevelConsecutiveHighScores: newRootConsecutive,
    sessionsHistory: {
      ...progress.sessionsHistory,
      [dateStr]: updatedSession
    },
    spacedRepetitionCards: updatedSRS
  };

  return { updatedProgress, promoted, nextLevel };
}

// Toggle bookmark
export function toggleItemBookmark(
  progress: VocabUserProgress,
  type: 'word' | 'root',
  id: string
): VocabUserProgress {
  if (type === 'word') {
    const has = progress.bookmarkedWordIds.includes(id);
    return {
      ...progress,
      bookmarkedWordIds: has
        ? progress.bookmarkedWordIds.filter((x) => x !== id)
        : [...progress.bookmarkedWordIds, id]
    };
  } else {
    const has = progress.bookmarkedRootIds.includes(id);
    return {
      ...progress,
      bookmarkedRootIds: has
        ? progress.bookmarkedRootIds.filter((x) => x !== id)
        : [...progress.bookmarkedRootIds, id]
    };
  }
}

// Get Due Revision Cards
export function getDueRevisionCards(
  progress: VocabUserProgress,
  todayStr: string = getTodayDateStr()
): SpacedRepetitionCard[] {
  return progress.spacedRepetitionCards.filter((c) => c.nextReviewDate <= todayStr);
}

// Generate Mini Assessment Quiz from today's session
export function generateDailyQuiz(session: DailyVocabSession): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const words = session.wordIds.map((id) => WORD_MAP.get(id)).filter(Boolean) as VocabWord[];
  const roots = session.rootIds.map((id) => ROOT_MAP.get(id)).filter(Boolean) as RootWord[];

  // 1. Word Definition Question
  if (words.length > 0) {
    const targetWord = words[0];
    const otherDefs = ALL_WORDS.filter((w) => w.id !== targetWord.id)
      .slice(0, 3)
      .map((w) => w.definition);
    const options = [targetWord.definition, ...otherDefs].sort(() => 0.5 - Math.random());
    questions.push({
      id: `q_word_def_${targetWord.id}`,
      type: 'word_definition',
      question: `What is the most accurate definition of the word "${targetWord.word}"?`,
      options,
      correctIndex: options.indexOf(targetWord.definition),
      explanation: `"${targetWord.word}" (${targetWord.part_of_speech}): ${targetWord.definition}`,
      sourceItem: { type: 'word', id: targetWord.id, term: targetWord.word }
    });
  }

  // 2. Fill in the Blank Question
  if (words.length > 1) {
    const targetWord = words[1];
    // Replace word in example sentence with blank
    const regex = new RegExp(`\\b${targetWord.word}\\w*\\b`, 'gi');
    const blankedSentence = targetWord.example.replace(regex, '__________');
    const otherWords = ALL_WORDS.filter((w) => w.id !== targetWord.id)
      .slice(0, 3)
      .map((w) => w.word);
    const options = [targetWord.word, ...otherWords].sort(() => 0.5 - Math.random());
    questions.push({
      id: `q_fib_${targetWord.id}`,
      type: 'fill_in_the_blank',
      question: `Complete the sentence with the most appropriate word: "${blankedSentence}"`,
      options,
      correctIndex: options.indexOf(targetWord.word),
      explanation: `Full context: "${targetWord.example}"`,
      sourceItem: { type: 'word', id: targetWord.id, term: targetWord.word }
    });
  }

  // 3. Synonym / Context Question
  if (words.length > 2 && words[2].synonyms.length > 0) {
    const targetWord = words[2];
    const correctSynonym = targetWord.synonyms[0];
    const distractorWords = ALL_WORDS.filter((w) => w.id !== targetWord.id && !targetWord.synonyms.includes(w.word))
      .slice(0, 3)
      .map((w) => w.word);
    const options = [correctSynonym, ...distractorWords].sort(() => 0.5 - Math.random());
    questions.push({
      id: `q_syn_${targetWord.id}`,
      type: 'word_definition',
      question: `Which of the following is a direct synonym of "${targetWord.word}"?`,
      options,
      correctIndex: options.indexOf(correctSynonym),
      explanation: `Synonyms of "${targetWord.word}": ${targetWord.synonyms.join(', ')}`,
      sourceItem: { type: 'word', id: targetWord.id, term: targetWord.word }
    });
  }

  // 4. Root Meaning Question
  if (roots.length > 0) {
    const targetRoot = roots[0];
    const otherMeanings = ALL_ROOTS.filter((r) => r.id !== targetRoot.id)
      .slice(0, 3)
      .map((r) => r.core_meaning);
    const options = [targetRoot.core_meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
    questions.push({
      id: `q_root_meaning_${targetRoot.id}`,
      type: 'root_meaning',
      question: `What is the core meaning of the ${targetRoot.origin_language} root "${targetRoot.root}"?`,
      options,
      correctIndex: options.indexOf(targetRoot.core_meaning),
      explanation: `The root "${targetRoot.root}" comes from ${targetRoot.origin_language} meaning "${targetRoot.core_meaning}".`,
      sourceItem: { type: 'root', id: targetRoot.id, term: targetRoot.root }
    });
  }

  // 5. Root Word Family Question
  if (roots.length > 1 && roots[1].derived_words.length > 0) {
    const targetRoot = roots[1];
    const correctDerived = targetRoot.derived_words[0].word;
    const otherDerived = ALL_ROOTS.filter((r) => r.id !== targetRoot.id)
      .map((r) => r.derived_words[0]?.word)
      .filter(Boolean)
      .slice(0, 3);
    const options = [correctDerived, ...otherDerived].sort(() => 0.5 - Math.random());
    questions.push({
      id: `q_word_family_${targetRoot.id}`,
      type: 'word_family',
      question: `Which word belongs to the word family derived from the root "${targetRoot.root}" (${targetRoot.core_meaning})?`,
      options,
      correctIndex: options.indexOf(correctDerived),
      explanation: `"${correctDerived}" is derived from root "${targetRoot.root}". Derived words: ${targetRoot.derived_words.map((d) => d.word).join(', ')}.`,
      sourceItem: { type: 'root', id: targetRoot.id, term: targetRoot.root }
    });
  }

  return questions;
}


