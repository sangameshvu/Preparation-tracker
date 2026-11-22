export type SectionType = 'Quant' | 'DILR' | 'VARC' | 'General';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Review' | 'Completed';

export type PriorityType = 'Low' | 'Medium' | 'High' | 'Urgent';

export type MistakeCategory =
  | 'Concept gap'
  | 'Calculation error'
  | 'Misread question'
  | 'Time sink'
  | 'Wrong guess'
  | 'Option elimination'
  | 'Set selection';

export type WeekStatus = 'Not started' | 'In progress' | 'Done' | 'Catch-up needed';

export type ConfidenceScore = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  email?: string;
  password?: string;
  displayName: string;
  avatarUrl?: string;
  catTargetYear: number;
  prepStartDate: string; // ISO date 'YYYY-MM-DD'
  targetExamDate: string; // ISO date 'YYYY-MM-DD'
  preferredDailyHours: number;
  preferredRoutine: string;
  themePreference: 'dark' | 'light' | 'system';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  isAdmin: boolean;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  isAuthenticated: boolean;
  loginTime: string;
}

export interface PrepPhase {
  phaseNumber: number;
  name: string;
  description: string;
  startWeek: number;
  endWeek: number;
  hoursMin: number;
  hoursMax: number;
}

export interface WeeklyPlanItem {
  id: string;
  weekNumber: number;
  startDate: string; // ISO
  endDate: string; // ISO
  monthLabel: string;
  phaseNumber: number;
  quantPlan: string;
  varcPlan: string;
  dilrPlan: string;
  testsPlanned: string;
  milestoneAdmin: string;
  hoursTarget: string;
  status: WeekStatus;
  myNotes?: string;
  actualHoursLogged?: number;
  isBufferWeek: boolean;
}

export interface StudyTask {
  id: string;
  weeklyPlanId?: string;
  topicId?: string;
  title: string;
  description?: string;
  section: SectionType;
  status: TaskStatus;
  priority: PriorityType;
  deadline?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  isTodayFocus: boolean;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TopicItem {
  id: string;
  section: SectionType;
  area: string;
  topicName: string;
  subtopics: string;
  planWeek: string;
  sortOrder: number;
}

export interface TopicProgress {
  topicId: string;
  conceptDone: boolean;
  practiceDone: boolean;
  pyqsDone: boolean;
  confidence: ConfidenceScore;
  revision1Done: boolean;
  revision2Done: boolean;
  notes?: string;
  updatedAt: string;
}

export interface MockTestItem {
  id: string;
  mockNumber: number;
  testDate?: string;
  seriesName?: string;
  varcAttempts?: number;
  varcScore?: number;
  dilrAttempts?: number;
  dilrScore?: number;
  qaAttempts?: number;
  qaScore?: number;
  totalAttempts?: number;
  totalScore?: number;
  percentile?: number;
  analysisDone: boolean;
  biggestLesson?: string;
  isSample: boolean;
}

export interface MockAnalysisItem {
  mockTestId: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  questionsSkipped?: string;
  timeManagementIssues?: string;
  topicsNeedingRevision?: string;
  actionPlan?: string;
}

export interface MistakeItem {
  id: string;
  date: string;
  source: string;
  section: SectionType;
  topic: string;
  topicId?: string;
  mockTestId?: string;
  questionRef: string;
  mistakeType: MistakeCategory;
  whatWentWrong: string;
  ruleForNextTime: string;
  revisitDate: string; // ISO date
  reSolved: boolean;
  isSample: boolean;
}

export type ResourceCategoryType = "PYQ's" | 'Mocks' | 'Concepts' | 'Practice';

export interface ResourceItem {
  id: string;
  section: string; // 'Quant' | 'DILR' | 'VARC' | 'Reading' | 'PYQs' | 'Mocks' | 'Community' | 'Intro'
  category?: ResourceCategoryType | string;
  resourceName: string;
  intendedUsage: string;
  url: string;
  isFavorited?: boolean;
  isCompleted?: boolean;
  personalNotes?: string;
}

export interface TimeBlockItem {
  timeRange: string;
  activity: string;
  section: SectionType;
}

export interface DailyRoutineTemplate {
  id: string;
  classification: string;
  title: string;
  targetHours: number;
  timeBlocks: TimeBlockItem[];
}

export interface StickyNoteItem {
  id: string;
  title?: string;
  purpose?: string;
  date?: string;
  section?: SectionType | 'General';
  content: string;
  color: 'charcoal' | 'lavender' | 'emerald' | 'amber' | 'rose' | 'cyan';
  positionX: number;
  positionY: number;
  isPinned: boolean;
  linkedTopicId?: string;
  linkedTaskId?: string;
  linkedMockId?: string;
  images?: NoteImageItem[];
  createdAt: string;
  updatedAt?: string;
}

export type NoteCategoryType = 'Notes' | 'QA' | 'Quick Ref';

export interface NoteImageItem {
  id: string;
  url: string;
  name: string;
  caption?: string;
  uploadedAt: string;
}

export interface StudyNoteItem {
  id: string;
  title: string;
  content: string;
  section: SectionType;
  noteType: NoteCategoryType;
  topic: string;
  topicId?: string;
  createdAt: string;
  updatedAt: string;
  images: NoteImageItem[];
  isPinned?: boolean;
  googleDocId?: string;
  googleDocsUrl?: string;
  syncedWithGoogleDocs?: boolean;
}

export interface PrepGuideSection {
  id: string;
  sectionKey: string;
  title: string;
  contentMarkdown: string;
  sortOrder: number;
}

export type ActivityCategory = 'topic' | 'task' | 'mock' | 'mistake' | 'note' | 'goal';

export interface StudyActivityItem {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  timestamp: string; // ISO datetime
  category: ActivityCategory;
  title: string;
  details?: string;
  section?: SectionType;
  durationMinutes?: number;
}

export interface DailyGoalItem {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  section: SectionType;
  targetMinutes: number;
  completed: boolean;
  completedAt?: string;
}

export interface AeonHabitState {
  completedDates: string[]; // List of 'yyyy-MM-dd' dates when Aeon essay was read
  streak: number; // Current active streak in days
  bestStreak: number; // All-time best streak
  totalRead: number; // Total number of essays read
  lastReadDate?: string; // Latest completed date
  isYesterdayDone: boolean; // Whether yesterday's essay was read
  isTodayDone: boolean; // Whether today's essay was read
  streakAtRisk: boolean; // True if yesterday is missing but previous streak > 0
  previousStreakLength: number; // The streak length that can be preserved if yesterday is marked done
}

export interface DashboardStats {
  daysRemaining: number;
  currentWeek: number;
  currentPhase: PrepPhase;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  weakTopicsCount: number;
  overallCompletionPct: number;
  totalMocksAttempted: number;
  latestMockScore?: number | null;
  bestMockScore?: number | null;
  averageMockScore?: number | null;
  pendingMistakesCount: number;
  overdueMistakesCount: number;
  currentStreak: number;
  bestStreak: number;
  isYesterdayDone: boolean;
  isTodayDone: boolean;
  streakAtRisk: boolean;
}
