export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExamType = 'CAT' | 'XAT' | 'GRE' | 'All';

export interface VocabWord {
  id: string;
  word: string;
  part_of_speech: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: DifficultyLevel;
  original_difficulty?: string;
  topics: string[];
  exam_relevance: string[];
  learning_note: string;
}

export interface DerivedWord {
  word: string;
  part_of_speech?: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  antonym_note?: string;
  example?: string;
}

export interface RootWord {
  id: string;
  root: string;
  element: string;
  variants?: string[];
  origin_language: string;
  core_meaning: string;
  element_type?: string;
  explanation: string;
  difficulty: DifficultyLevel;
  derived_words: DerivedWord[];
  word_families: DerivedWord[];
  exam_relevance: string[];
}

export interface CardReviewRecord {
  status: 'known' | 'needs_revision';
  reviewedAt: string;
}

export interface DailyVocabSession {
  sessionDate: string; // YYYY-MM-DD
  wordIds: string[]; // 5 high frequency words
  rootIds: string[]; // 5 roots
  wordsCompleted: boolean;
  rootsCompleted: boolean;
  wordReviews: Record<string, CardReviewRecord>;
  rootReviews: Record<string, CardReviewRecord>;
}

export interface SpacedRepetitionCard {
  id: string;
  type: 'word' | 'root';
  itemId: string;
  lastReviewedDate: string;
  nextReviewDate: string;
  intervalIndex: number; // 0 (1d), 1 (3d), 2 (7d), 3 (14d), 4 (30d)
  reviewCount: number;
  masteryStatus: 'learning' | 'reviewing' | 'mastered';
  difficulty: DifficultyLevel;
}

export interface QuizQuestion {
  id: string;
  type: 'word_definition' | 'fill_in_the_blank' | 'root_meaning' | 'word_family';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceItem: {
    type: 'word' | 'root';
    id: string;
    term: string;
  };
}

export interface VocabUserProgress {
  userId: string;
  currentWordLevel: DifficultyLevel;
  currentRootLevel: DifficultyLevel;
  totalWordsLearned: number;
  totalRootsLearned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  wordLevelConsecutiveHighScores: number; // 3 sessions >= 80% triggers level up
  rootLevelConsecutiveHighScores: number;
  bookmarkedWordIds: string[];
  bookmarkedRootIds: string[];
  sessionsHistory: Record<string, DailyVocabSession>;
  spacedRepetitionCards: SpacedRepetitionCard[];
  quizScores: { date: string; score: number; total: number }[];
}
