import { VocabUserProgress } from '../types/vocabulary';

export function createDefaultUserProgress(userId: string): VocabUserProgress {
  return {
    userId,
    currentWordLevel: 'beginner',
    currentRootLevel: 'beginner',
    totalWordsLearned: 0,
    totalRootsLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    wordLevelConsecutiveHighScores: 0,
    rootLevelConsecutiveHighScores: 0,
    bookmarkedWordIds: [],
    bookmarkedRootIds: [],
    sessionsHistory: {},
    spacedRepetitionCards: [],
    quizScores: []
  };
}

export function loadUserVocabProgress(userId: string): VocabUserProgress {
  try {
    const key = `cat2027_vocab_progress_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.userId === userId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load vocab progress from storage:', e);
  }
  return createDefaultUserProgress(userId);
}

export function saveUserVocabProgress(progress: VocabUserProgress): void {
  try {
    const key = `cat2027_vocab_progress_${progress.userId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save vocab progress to storage:', e);
  }
}
