import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserProfile,
  AuthSession,
  WeeklyPlanItem,
  StudyTask,
  TopicItem,
  TopicProgress,
  MockTestItem,
  MistakeItem,
  ResourceItem,
  DailyRoutineTemplate,
  StickyNoteItem,
  StudyNoteItem,
  PrepGuideSection,
  DashboardStats,
  TaskStatus,
  ConfidenceScore,
  StudyActivityItem,
  DailyGoalItem,
  AeonHabitState,
  SectionType
} from '../types';
import { initialPhases } from '../data/phases';
import { initialTopics } from '../data/topics';
import { initialWeeklyPlans } from '../data/weeklyPlans';
import { initialResources } from '../data/resources';
import { initialRoutines } from '../data/routines';
import { initialGuideSections } from '../data/guideSections';
import { initialStudyNotes } from '../data/initialNotes';
import { initialMockTests, initialMistakes } from '../data/initialMockAndMistake';
import { initialActivities, initialDailyGoals, initialAeonCompletedDates } from '../data/initialActivities';
import { addDays, subDays, differenceInCalendarDays, parseISO, format, startOfWeek, differenceInCalendarWeeks } from 'date-fns';
import { calculateStreak } from '../utils/streakCalculator';
import { toast } from 'sonner';

export const SANGAMESH_PROFILE: UserProfile = {
  id: 'user-sangamesh-vu',
  email: 'sangamesh.vu@gmail.com',
  password: 'Sangamesh.vu@',
  displayName: 'Sangamesh V U',
  avatarUrl: '',
  catTargetYear: 2027,
  prepStartDate: '2026-11-16',
  targetExamDate: '2027-11-28',
  preferredDailyHours: 3.0,
  preferredRoutine: 'working_professional_weekday',
  themePreference: 'dark',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  isAdmin: true,
  lastLoginAt: '2026-11-22T15:00:00.000Z'
};

export const GUEST_PROFILE: UserProfile = {
  id: 'user-guest',
  displayName: 'CAT Aspirant',
  email: '',
  password: '',
  avatarUrl: '',
  catTargetYear: 2027,
  prepStartDate: '2026-11-16',
  targetExamDate: '2027-11-28',
  preferredDailyHours: 3.0,
  preferredRoutine: 'working_professional_weekday',
  themePreference: 'dark',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  isAdmin: false
};

const DEFAULT_PROFILE: UserProfile = GUEST_PROFILE;

interface AppDataContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  registeredProfiles: UserProfile[];
  authSession: AuthSession;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (displayName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  syncDataToCloudVault: () => string;
  importDataFromCloudVault: (jsonStr: string) => boolean;
  phases: typeof initialPhases;
  weeklyPlans: WeeklyPlanItem[];
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlanItem>) => void;
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  topics: TopicItem[];
  updateTopic: (id: string, updates: Partial<TopicItem>) => void;
  addTopic: (topic: Omit<TopicItem, 'id'>) => void;
  deleteTopic: (id: string) => void;
  resetTopics: () => void;
  topicProgress: Record<string, TopicProgress>;
  updateTopicProgress: (topicId: string, updates: Partial<TopicProgress>) => void;
  mockTests: MockTestItem[];
  addMockTest: (mock: Omit<MockTestItem, 'id' | 'mockNumber' | 'totalAttempts' | 'totalScore'>) => void;
  updateMockTest: (id: string, updates: Partial<MockTestItem>) => void;
  deleteMockTest: (id: string) => void;
  convertSampleMock: () => void;
  deleteSampleMock: () => void;
  mistakes: MistakeItem[];
  addMistake: (mistake: Omit<MistakeItem, 'id' | 'revisitDate' | 'isSample'>) => void;
  updateMistake: (id: string, updates: Partial<MistakeItem>) => void;
  deleteMistake: (id: string) => void;
  convertSampleMistake: () => void;
  deleteSampleMistake: () => void;
  resources: ResourceItem[];
  updateResource: (id: string, updates: Partial<ResourceItem>) => void;
  addResource: (resource: Omit<ResourceItem, 'id'>) => void;
  deleteResource: (id: string) => void;
  reorderResources: (newResources: ResourceItem[]) => void;
  resetResources: () => void;
  routines: DailyRoutineTemplate[];
  updateRoutine: (id: string, updates: Partial<DailyRoutineTemplate>) => void;
  stickyNotes: StickyNoteItem[];
  addStickyNote: (note: Omit<StickyNoteItem, 'id' | 'createdAt'>) => void;
  updateStickyNote: (id: string, updates: Partial<StickyNoteItem>) => void;
  deleteStickyNote: (id: string) => void;
  studyNotes: StudyNoteItem[];
  addStudyNote: (note: Omit<StudyNoteItem, 'id' | 'updatedAt'> & { id?: string }) => void;
  updateStudyNote: (id: string, updates: Partial<StudyNoteItem>) => void;
  deleteStudyNote: (id: string) => void;
  guideSections: PrepGuideSection[];
  updateGuideSection: (id: string, updates: Partial<PrepGuideSection>) => void;
  activities: StudyActivityItem[];
  addActivity: (act: Omit<StudyActivityItem, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  deleteActivity: (id: string) => void;
  dailyGoals: DailyGoalItem[];
  todayGoals: DailyGoalItem[];
  addDailyGoal: (goal: Omit<DailyGoalItem, 'id'>) => void;
  addMultipleDailyGoals: (
    goals: Array<Omit<DailyGoalItem, 'id' | 'date' | 'completed'> & { date?: string; completed?: boolean }>
  ) => void;
  toggleDailyGoal: (id: string) => void;
  deleteDailyGoal: (id: string) => void;
  aeonHabit: AeonHabitState;
  toggleAeonDate: (dateStr: string, title?: string) => void;
  markYesterdayAeonDone: (title?: string) => void;
  markTodayAeonDone: (title?: string) => void;
  stats: DashboardStats;
  resetAllData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const STORAGE_PREFIX = 'cat2027_';

function getInitialState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error loading ${key} from storage`, e);
  }
  return fallback;
}

export const DEFAULT_DAILY_GOALS_LIST: Array<{
  title: string;
  section: SectionType;
  targetMinutes: number;
}> = [
  {
    title: 'VARC: AONSA',
    section: 'VARC',
    targetMinutes: 35
  },
  {
    title: 'VARC: 5 root words',
    section: 'VARC',
    targetMinutes: 15
  }
];

export function ensureUniqueTaskIds(items: StudyTask[]): StudyTask[] {
  const seen = new Set<string>();
  return items.map((task, idx) => {
    if (!task.id || seen.has(task.id)) {
      const uniqueId = `task-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
      seen.add(uniqueId);
      return { ...task, id: uniqueId };
    }
    seen.add(task.id);
    return task;
  });
}

export function ensureDefaultGoalsForDate(goals: DailyGoalItem[], dateStr: string): DailyGoalItem[] {
  const existing = goals.filter((g) => g.date === dateStr);
  const toAdd: DailyGoalItem[] = [];

  DEFAULT_DAILY_GOALS_LIST.forEach((tmpl, i) => {
    const alreadyExists = existing.some(
      (g) => g.title.trim().toLowerCase() === tmpl.title.trim().toLowerCase()
    );
    if (!alreadyExists) {
      toAdd.push({
        id: `goal-default-${dateStr}-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: dateStr,
        title: tmpl.title,
        section: tmpl.section,
        targetMinutes: tmpl.targetMinutes,
        completed: false
      });
    }
  });

  if (toAdd.length === 0) return goals;
  return [...goals, ...toAdd];
}

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Profiles Registry: stores all registered user profiles (seeded with Sangamesh's profile)
  const [registeredProfiles, setRegisteredProfiles] = useState<UserProfile[]>(() => {
    const saved = getInitialState<UserProfile[]>('registered_profiles', [SANGAMESH_PROFILE]);
    if (!saved.some((p) => p.email?.toLowerCase() === 'sangamesh.vu@gmail.com')) {
      return [...saved, SANGAMESH_PROFILE];
    }
    return saved;
  });

  // Active Session: defaults to unauthenticated guest so Sangamesh is NOT the default profile!
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    const saved = getInitialState<AuthSession | null>('auth_session', null);
    if (saved && saved.isAuthenticated && saved.user && saved.user.email) {
      return saved;
    }
    return {
      user: GUEST_PROFILE,
      token: '',
      isAuthenticated: false,
      loginTime: ''
    };
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedSession = getInitialState<AuthSession | null>('auth_session', null);
    if (savedSession && savedSession.isAuthenticated && savedSession.user && savedSession.user.email) {
      return savedSession.user;
    }
    return GUEST_PROFILE;
  });

  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlanItem[]>(() => {
    const saved = getInitialState('weeklyPlans', initialWeeklyPlans);
    const baseDate = parseISO('2026-11-16');
    const baseMonday = startOfWeek(baseDate, { weekStartsOn: 1 });
    return saved.map((week) => {
      const wStart = addDays(baseMonday, (week.weekNumber - 1) * 7);
      const wEnd = addDays(wStart, 6);
      return {
        ...week,
        startDate: format(wStart, 'yyyy-MM-dd'),
        endDate: format(wEnd, 'yyyy-MM-dd'),
        monthLabel: format(wStart, 'MMM yy')
      };
    });
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const raw = getInitialState<StudyTask[]>('tasks', [
      {
        id: 'task-1',
        title: 'Diagnostic Week: Fractions & Shortcuts',
        description: 'Practice fraction to % conversions (1/2 to 1/20) and multiplication tables',
        section: 'Quant',
        status: 'In Progress',
        priority: 'High',
        estimatedMinutes: 60,
        actualMinutes: 45,
        isTodayFocus: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Daily Reading: 1 Aeon Essay + Main Idea note',
        section: 'VARC',
        status: 'Not Started',
        priority: 'Medium',
        estimatedMinutes: 35,
        actualMinutes: 0,
        isTodayFocus: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-3',
        title: 'DILR: 2 Table Sets (Untimed)',
        section: 'DILR',
        status: 'Not Started',
        priority: 'Medium',
        estimatedMinutes: 40,
        actualMinutes: 0,
        isTodayFocus: true,
        createdAt: new Date().toISOString()
      }
    ]);
    return ensureUniqueTaskIds(raw);
  });

  const [topics, setTopics] = useState<TopicItem[]>(() =>
    getInitialState('topics', initialTopics)
  );

  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>(() => {
    const saved = getInitialState<Record<string, TopicProgress> | null>('topicProgress', null);
    if (saved) return saved;
    const initial: Record<string, TopicProgress> = {};
    initialTopics.forEach((t) => {
      initial[t.id] = {
        topicId: t.id,
        conceptDone: false,
        practiceDone: false,
        pyqsDone: false,
        confidence: 1,
        revision1Done: false,
        revision2Done: false,
        updatedAt: new Date().toISOString()
      };
    });
    return initial;
  });

  const [mockTests, setMockTests] = useState<MockTestItem[]>(() =>
    getInitialState('mockTests', initialMockTests)
  );

  const [mistakes, setMistakes] = useState<MistakeItem[]>(() =>
    getInitialState('mistakes', initialMistakes)
  );

  const [resources, setResources] = useState<ResourceItem[]>(() =>
    getInitialState('resources', initialResources)
  );

  const [routines, setRoutines] = useState<DailyRoutineTemplate[]>(() =>
    getInitialState('routines', initialRoutines)
  );

  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>(() =>
    getInitialState('stickyNotes', [
      {
        id: 'note-1',
        content: 'Remember: 90% in CAT requires accuracy > attempts. Never guess in DILR.',
        color: 'lavender',
        positionX: 30,
        positionY: 20,
        isPinned: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'note-2',
        content: 'Formula check: Euler totient theorem applicable when base & divisor are co-prime.',
        color: 'emerald',
        positionX: 280,
        positionY: 40,
        isPinned: false,
        createdAt: new Date().toISOString()
      }
    ])
  );

  const [studyNotes, setStudyNotes] = useState<StudyNoteItem[]>(() =>
    getInitialState('studyNotes', initialStudyNotes)
  );

  const [guideSections, setGuideSections] = useState<PrepGuideSection[]>(() =>
    getInitialState('guideSections', initialGuideSections)
  );

  const [activities, setActivities] = useState<StudyActivityItem[]>(() => {
    const saved = getInitialState<StudyActivityItem[]>('activities', initialActivities);
    // User requirement: Only log regarding today's goals when completing the daily target
    return saved.filter((a) => a.category === 'goal' && a.title.toLowerCase().includes('completed'));
  });

  const [dailyGoals, setDailyGoals] = useState<DailyGoalItem[]>(() => {
    const saved = getInitialState<DailyGoalItem[]>('dailyGoals', initialDailyGoals);
    const today = format(new Date(), 'yyyy-MM-dd');
    const base = !saved || saved.length === 0 ? initialDailyGoals : saved;
    return ensureDefaultGoalsForDate(base, today);
  });

  // Aeon Daily Reading Habit State with retroactive completion & streak protection
  const [aeonCompletedDates, setAeonCompletedDates] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('cat2027_aeon_reading');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.completedDates) && parsed.completedDates.length > 0) {
          return parsed.completedDates;
        }
        // Backward-compatibility: reconstruct dates if old format had lastReadDate + streak
        if (parsed.lastReadDate && parsed.streak > 0) {
          const dates: string[] = [];
          const anchor = parseISO(parsed.lastReadDate);
          for (let i = 0; i < parsed.streak; i++) {
            dates.push(format(subDays(anchor, i), 'yyyy-MM-dd'));
          }
          return dates;
        }
      }
    } catch (e) {
      console.error('Error loading cat2027_aeon_reading from storage', e);
    }
    return initialAeonCompletedDates;
  });

  const streakData = useMemo(() => {
    return calculateStreak(aeonCompletedDates);
  }, [aeonCompletedDates]);

  const aeonHabit: AeonHabitState = useMemo(() => {
    return {
      completedDates: aeonCompletedDates,
      streak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      totalRead: aeonCompletedDates.length,
      lastReadDate: streakData.lastActiveDate,
      isYesterdayDone: streakData.isYesterdayDone,
      isTodayDone: streakData.isTodayDone,
      streakAtRisk: streakData.streakAtRisk,
      previousStreakLength: streakData.previousStreakLength
    };
  }, [aeonCompletedDates, streakData]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'cat2027_aeon_reading',
        JSON.stringify({
          completedDates: aeonCompletedDates,
          streak: aeonHabit.streak,
          bestStreak: aeonHabit.bestStreak,
          totalRead: aeonHabit.totalRead,
          lastReadDate: aeonHabit.lastReadDate
        })
      );
    } catch (e) {
      console.error('Error saving aeon reading habit to storage', e);
    }
  }, [aeonCompletedDates, aeonHabit]);

  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  const todayGoals = useMemo(() => {
    return dailyGoals.filter((g) => g.date === todayDateStr);
  }, [dailyGoals, todayDateStr]);

  // Migrate and repair any duplicate task IDs in storage immediately
  useEffect(() => {
    setTasks((prev) => {
      const seen = new Set<string>();
      let hasDuplicates = false;
      for (const t of prev) {
        if (!t.id || seen.has(t.id)) {
          hasDuplicates = true;
          break;
        }
        seen.add(t.id);
      }
      if (!hasDuplicates) return prev;
      return ensureUniqueTaskIds(prev);
    });
  }, []);

  // Ensure default daily goals ('VARC: AONSA' and 'VARC: 5 root words') exist for today every day
  useEffect(() => {
    setDailyGoals((prev) => ensureDefaultGoalsForDate(prev, todayDateStr));
  }, [todayDateStr]);

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'registered_profiles', JSON.stringify(registeredProfiles));
  }, [registeredProfiles]);

  useEffect(() => {
    if (authSession.isAuthenticated && authSession.user.id !== 'user-guest') {
      localStorage.setItem(STORAGE_PREFIX + 'auth_session', JSON.stringify(authSession));
    } else {
      localStorage.removeItem(STORAGE_PREFIX + 'auth_session');
    }
  }, [authSession]);

  // Seed Sangamesh's Master Data Vault so the data is never lost, but only accessible when authenticated!
  useEffect(() => {
    const vaultKey = 'cat2027_vault_user-sangamesh-vu';
    if (!localStorage.getItem(vaultKey)) {
      try {
        const initialVault = {
          profile: SANGAMESH_PROFILE,
          weeklyPlans: initialWeeklyPlans,
          tasks,
          topicProgress,
          mockTests: initialMockTests,
          mistakes: initialMistakes,
          resources: initialResources,
          routines: initialRoutines,
          stickyNotes,
          studyNotes: initialStudyNotes,
          guideSections: initialGuideSections,
          activities: initialActivities,
          dailyGoals: initialDailyGoals,
          aeonHabit: {
            completedDates: initialAeonCompletedDates,
            streak: calculateStreak(initialAeonCompletedDates).currentStreak,
            bestStreak: calculateStreak(initialAeonCompletedDates).bestStreak,
            totalRead: initialAeonCompletedDates.length
          }
        };
        localStorage.setItem(vaultKey, JSON.stringify(initialVault));
      } catch (e) {
        console.error('Error seeding Sangamesh data vault:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'weeklyPlans', JSON.stringify(weeklyPlans));
  }, [weeklyPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'topicProgress', JSON.stringify(topicProgress));
  }, [topicProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'mockTests', JSON.stringify(mockTests));
  }, [mockTests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'mistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'stickyNotes', JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'studyNotes', JSON.stringify(studyNotes));
  }, [studyNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'guideSections', JSON.stringify(guideSections));
  }, [guideSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'dailyGoals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  // Recalculate 52-week dates when prepStartDate changes (always normalized to Monday -> Sunday)
  useEffect(() => {
    try {
      const parsedStart = parseISO(profile.prepStartDate || '2026-11-16');
      const baseStart = startOfWeek(parsedStart, { weekStartsOn: 1 });
      setWeeklyPlans((prev) =>
        prev.map((week) => {
          const wStart = addDays(baseStart, (week.weekNumber - 1) * 7);
          const wEnd = addDays(wStart, 6);
          return {
            ...week,
            startDate: format(wStart, 'yyyy-MM-dd'),
            endDate: format(wEnd, 'yyyy-MM-dd'),
            monthLabel: format(wStart, 'MMM yy')
          };
        })
      );
    } catch (e) {
      console.error('Error recalculating weekly plan dates:', e);
    }
  }, [profile.prepStartDate]);

  // Actions
  const addActivity = (act: Omit<StudyActivityItem, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const newAct: StudyActivityItem = {
      ...act,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: act.timestamp || new Date().toISOString()
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const addDailyGoal = (goal: Omit<DailyGoalItem, 'id'>) => {
    const goalDate = goal.date || format(new Date(), 'yyyy-MM-dd');
    const newGoal: DailyGoalItem = {
      ...goal,
      date: goalDate,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setDailyGoals((prev) => [newGoal, ...prev]);
  };

  const addMultipleDailyGoals = (
    goals: Array<Omit<DailyGoalItem, 'id' | 'date' | 'completed'> & { date?: string; completed?: boolean }>
  ) => {
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const newItems: DailyGoalItem[] = goals.map((g, idx) => ({
      ...g,
      completed: g.completed ?? false,
      date: g.date || todayDate,
      id: `goal-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`
    }));
    setDailyGoals((prev) => [...newItems, ...prev]);
  };

  const toggleDailyGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nowCompleted = !g.completed;
        if (nowCompleted) {
          addActivity({
            date: g.date || format(new Date(), 'yyyy-MM-dd'),
            category: 'goal',
            title: `Completed Goal: ${g.title}`,
            details: `Daily target achieved: ${g.targetMinutes}m (${g.section}).`,
            section: g.section,
            durationMinutes: g.targetMinutes
          });
        }
        return {
          ...g,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : undefined
        };
      })
    );
  };

  const deleteDailyGoal = (id: string) => {
    setDailyGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleAeonDate = (dateStr: string, title?: string) => {
    const isAlreadyDone = aeonCompletedDates.includes(dateStr);
    const updatedDates = isAlreadyDone
      ? aeonCompletedDates.filter((d) => d !== dateStr)
      : [...aeonCompletedDates, dateStr];

    setAeonCompletedDates(updatedDates);

    if (!isAlreadyDone) {
      addActivity({
        date: dateStr,
        category: 'goal',
        title: title || 'Completed Goal: Aeon Essay (Daily Reading)',
        details: 'Daily target achieved: 35m in VARC (Long-form Reading Stamina).',
        section: 'VARC',
        durationMinutes: 35
      });

      // Synchronize with dailyGoals for that date
      setDailyGoals((prev) => {
        const hasGoal = prev.some(
          (g) => g.date === dateStr && g.section === 'VARC' && g.title.toLowerCase().includes('aeon')
        );
        if (!hasGoal) {
          const newGoal: DailyGoalItem = {
            id: `goal-aeon-${dateStr}-${Date.now()}`,
            date: dateStr,
            title: 'Aeon Essay: Daily Long-form Reading',
            section: 'VARC',
            targetMinutes: 35,
            completed: true,
            completedAt: new Date().toISOString()
          };
          return [newGoal, ...prev];
        }
        return prev.map((g) => {
          if (g.date === dateStr && g.section === 'VARC' && g.title.toLowerCase().includes('aeon')) {
            return { ...g, completed: true, completedAt: new Date().toISOString() };
          }
          return g;
        });
      });
    }
  };

  const markYesterdayAeonDone = (title?: string) => {
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    if (aeonCompletedDates.includes(yesterdayStr)) {
      toast.info("Yesterday's Aeon essay is already marked as done!");
      return;
    }
    toggleAeonDate(
      yesterdayStr,
      title || "Completed Goal: Yesterday's Aeon Essay (Streak Protected)"
    );
    const simulatedDates = [...aeonCompletedDates, yesterdayStr];
    const newStreak = calculateStreak(simulatedDates).currentStreak;
    toast.success(`🔥 Streak Protected! Yesterday's Aeon essay marked done. Streak is unbroken at ${newStreak} days!`);
  };

  const markTodayAeonDone = (title?: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (aeonCompletedDates.includes(todayStr)) {
      toast.info("Today's Aeon essay is already marked as done!");
      return;
    }
    toggleAeonDate(
      todayStr,
      title || "Completed Goal: Today's Aeon Essay"
    );
    const simulatedDates = [...aeonCompletedDates, todayStr];
    const newStreak = calculateStreak(simulatedDates).currentStreak;
    toast.success(`🎉 Great job! Today's Aeon essay completed! Current streak: ${newStreak} days.`);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const login = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const found = registeredProfiles.find((p) => p.email?.trim().toLowerCase() === cleanEmail);

    if (found && found.password === passwordInput) {
      const updatedProfile: UserProfile = {
        ...found,
        lastLoginAt: new Date().toISOString()
      };

      setRegisteredProfiles((prev) =>
        prev.map((p) => (p.id === found.id ? updatedProfile : p))
      );

      // If logging into Sangamesh profile or user with vault data, restore their complete dataset
      const vaultKey = `cat2027_vault_${found.id}`;
      const savedVault = localStorage.getItem(vaultKey);
      if (savedVault) {
        try {
          const data = JSON.parse(savedVault);
          if (data.weeklyPlans) setWeeklyPlans(data.weeklyPlans);
          if (data.tasks) setTasks(data.tasks);
          if (data.topicProgress) setTopicProgress(data.topicProgress);
          if (data.mockTests) setMockTests(data.mockTests);
          if (data.mistakes) setMistakes(data.mistakes);
          if (data.resources) setResources(data.resources);
          if (data.routines) setRoutines(data.routines);
          if (data.stickyNotes) setStickyNotes(data.stickyNotes);
          if (data.studyNotes) setStudyNotes(data.studyNotes);
          if (data.guideSections) setGuideSections(data.guideSections);
          if (data.activities) setActivities(data.activities);
          if (data.dailyGoals) setDailyGoals(data.dailyGoals);
          if (data.aeonHabit && data.aeonHabit.completedDates) {
            setAeonCompletedDates(data.aeonHabit.completedDates);
          }
        } catch (err) {
          console.error('Error loading vault for profile:', err);
        }
      }

      setProfile(updatedProfile);
      const newSession: AuthSession = {
        user: updatedProfile,
        token: `sess_${found.id}_${Date.now()}`,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };
      setAuthSession(newSession);
      localStorage.setItem(STORAGE_PREFIX + 'auth_session', JSON.stringify(newSession));
      toast.success(`🎉 Welcome back, ${updatedProfile.displayName}! Logged into your CAT 2027 profile.`);
      return { success: true };
    } else {
      toast.error('Invalid email or password. Please verify your credentials.');
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const signup = async (
    displayName: string,
    emailInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!displayName.trim()) {
      toast.error('Please enter a display name');
      return { success: false, error: 'Display name required' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return { success: false, error: 'Valid email required' };
    }
    if (!passwordInput || passwordInput.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return { success: false, error: 'Password too short' };
    }

    const exists = registeredProfiles.some((p) => p.email?.toLowerCase() === cleanEmail);
    if (exists) {
      toast.error('An account with this email already exists. Please sign in instead.');
      return { success: false, error: 'Account already exists' };
    }

    const newProfile: UserProfile = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      displayName: displayName.trim(),
      email: cleanEmail,
      password: passwordInput,
      avatarUrl: '',
      catTargetYear: 2027,
      prepStartDate: '2026-11-16',
      targetExamDate: '2027-11-28',
      preferredDailyHours: 3.0,
      preferredRoutine: 'working_professional_weekday',
      themePreference: 'dark',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      isAdmin: false,
      lastLoginAt: new Date().toISOString()
    };

    setRegisteredProfiles((prev) => [...prev, newProfile]);
    setProfile(newProfile);
    const session: AuthSession = {
      user: newProfile,
      token: `sess_${newProfile.id}_${Date.now()}`,
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };
    setAuthSession(session);
    localStorage.setItem(STORAGE_PREFIX + 'auth_session', JSON.stringify(session));
    toast.success(`🎉 Profile created! Welcome, ${newProfile.displayName}!`);
    return { success: true };
  };

  const logout = () => {
    if (profile.id && profile.id !== 'user-guest') {
      try {
        const currentVault = {
          profile,
          weeklyPlans,
          tasks,
          topicProgress,
          mockTests,
          mistakes,
          resources,
          routines,
          stickyNotes,
          studyNotes,
          guideSections,
          activities,
          dailyGoals,
          aeonHabit: {
            completedDates: aeonCompletedDates,
            streak: aeonHabit.streak,
            bestStreak: aeonHabit.bestStreak,
            totalRead: aeonCompletedDates.length,
            lastReadDate: aeonHabit.lastReadDate
          }
        };
        localStorage.setItem(`cat2027_vault_${profile.id}`, JSON.stringify(currentVault));
      } catch (e) {
        console.error('Error saving profile vault on logout', e);
      }
    }

    localStorage.removeItem(STORAGE_PREFIX + 'auth_session');
    setProfile(GUEST_PROFILE);
    setAuthSession({
      user: GUEST_PROFILE,
      token: '',
      isAuthenticated: false,
      loginTime: ''
    });
    toast.info('Signed out. Please sign in to access your profile.');
  };

  const syncDataToCloudVault = () => {
    const vault = {
      vaultVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      owner: {
        id: profile.id,
        email: profile.email,
        displayName: profile.displayName
      },
      profile,
      weeklyPlans,
      tasks,
      topicProgress,
      mockTests,
      mistakes,
      resources,
      routines,
      stickyNotes,
      studyNotes,
      guideSections,
      activities,
      dailyGoals,
      aeonHabit
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vault, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sangamesh_CAT_2027_DataVault_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Complete CAT 2027 Data Vault exported for cross-device access.');
    return JSON.stringify(vault);
  };

  const importDataFromCloudVault = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (data.weeklyPlans) setWeeklyPlans(data.weeklyPlans);
      if (data.tasks) setTasks(data.tasks);
      if (data.topicProgress) setTopicProgress(data.topicProgress);
      if (data.mockTests) setMockTests(data.mockTests);
      if (data.mistakes) setMistakes(data.mistakes);
      if (data.resources) setResources(data.resources);
      if (data.routines) setRoutines(data.routines);
      if (data.stickyNotes) setStickyNotes(data.stickyNotes);
      if (data.studyNotes) setStudyNotes(data.studyNotes);
      if (data.guideSections) setGuideSections(data.guideSections);
      if (data.activities) setActivities(data.activities);
      if (data.dailyGoals) setDailyGoals(data.dailyGoals);
      if (data.aeonHabit && data.aeonHabit.completedDates) {
        setAeonCompletedDates(data.aeonHabit.completedDates);
      }

      Object.keys(data).forEach((k) => {
        if (k !== 'vaultVersion' && k !== 'exportedAt' && k !== 'owner') {
          localStorage.setItem(STORAGE_PREFIX + k, JSON.stringify(data[k]));
        }
      });

      toast.success('🎉 Successfully imported and restored all data under Sangamesh profile!');
      return true;
    } catch (e) {
      console.error('Failed to parse and import data vault:', e);
      toast.error('Invalid vault file format. Import failed.');
      return false;
    }
  };

  const updateWeeklyPlan = (id: string, updates: Partial<WeeklyPlanItem>) => {
    setWeeklyPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))
    );
  };

  const addTask = (task: Omit<StudyTask, 'id' | 'createdAt'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setTasks((prev) => {
      const targetIndex = prev.findIndex((t) => t.id === id);
      if (targetIndex === -1) return prev;
      return prev.map((t, idx) => (idx === targetIndex ? { ...t, ...updates } : t));
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const targetIndex = prev.findIndex((t) => t.id === id);
      if (targetIndex === -1) return prev;
      return prev.filter((_, idx) => idx !== targetIndex);
    });
  };

  const updateTopic = (id: string, updates: Partial<TopicItem>) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const addTopic = (topic: Omit<TopicItem, 'id'>) => {
    const newTopic: TopicItem = {
      ...topic,
      id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sortOrder: topic.sortOrder ?? (topics.length + 1)
    };
    setTopics((prev) => [...prev, newTopic]);
    setTopicProgress((prev) => ({
      ...prev,
      [newTopic.id]: {
        topicId: newTopic.id,
        conceptDone: false,
        practiceDone: false,
        pyqsDone: false,
        confidence: 1,
        revision1Done: false,
        revision2Done: false,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setTopicProgress((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const resetTopics = () => {
    setTopics(initialTopics);
  };

  const updateTopicProgress = (topicId: string, updates: Partial<TopicProgress>) => {
    setTopicProgress((prev) => {
      const current = prev[topicId] || {
        topicId,
        conceptDone: false,
        practiceDone: false,
        pyqsDone: false,
        confidence: 1,
        revision1Done: false,
        revision2Done: false,
        updatedAt: new Date().toISOString()
      };
      return {
        ...prev,
        [topicId]: {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      };
    });
  };

  const addMockTest = (mock: Omit<MockTestItem, 'id' | 'mockNumber' | 'totalAttempts' | 'totalScore'>) => {
    const realMocks = mockTests.filter((m) => !m.isSample && m.totalScore !== undefined);
    const nextNumber = realMocks.length + 1;
    const totalAttempts =
      (mock.varcAttempts || 0) + (mock.dilrAttempts || 0) + (mock.qaAttempts || 0);
    const totalScore =
      (mock.varcScore || 0) + (mock.dilrScore || 0) + (mock.qaScore || 0);

    const newMock: MockTestItem = {
      ...mock,
      id: `mock-${Date.now()}`,
      mockNumber: nextNumber,
      totalAttempts,
      totalScore,
      isSample: false
    };

    setMockTests((prev) => {
      // Find slot for this mock number or prepend
      const slotIndex = prev.findIndex((m) => m.mockNumber === nextNumber);
      if (slotIndex !== -1) {
        const copy = [...prev];
        copy[slotIndex] = newMock;
        return copy;
      }
      return [newMock, ...prev];
    });
  };

  const updateMockTest = (id: string, updates: Partial<MockTestItem>) => {
    setMockTests((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const merged = { ...m, ...updates };
        merged.totalAttempts =
          (merged.varcAttempts || 0) + (merged.dilrAttempts || 0) + (merged.qaAttempts || 0);
        merged.totalScore =
          (merged.varcScore || 0) + (merged.dilrScore || 0) + (merged.qaScore || 0);
        return merged;
      })
    );
  };

  const deleteMockTest = (id: string) => {
    setMockTests((prev) => prev.filter((m) => m.id !== id));
  };

  const convertSampleMock = () => {
    setMockTests((prev) =>
      prev.map((m) => (m.isSample ? { ...m, isSample: false } : m))
    );
  };

  const deleteSampleMock = () => {
    setMockTests((prev) => prev.filter((m) => !m.isSample));
  };

  const addMistake = (mistake: Omit<MistakeItem, 'id' | 'revisitDate' | 'isSample'>) => {
    const entryDate = parseISO(mistake.date);
    const revisit = addDays(entryDate, 7);
    const newMistake: MistakeItem = {
      ...mistake,
      id: `mistake-${Date.now()}`,
      revisitDate: format(revisit, 'yyyy-MM-dd'),
      isSample: false
    };
    setMistakes((prev) => [newMistake, ...prev]);
  };

  const updateMistake = (id: string, updates: Partial<MistakeItem>) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  const convertSampleMistake = () => {
    setMistakes((prev) =>
      prev.map((m) => (m.isSample ? { ...m, isSample: false } : m))
    );
  };

  const deleteSampleMistake = () => {
    setMistakes((prev) => prev.filter((m) => !m.isSample));
  };

  const updateResource = (id: string, updates: Partial<ResourceItem>) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const addResource = (resource: Omit<ResourceItem, 'id'>) => {
    const newRes: ResourceItem = {
      ...resource,
      id: `res-${Date.now()}`
    };
    setResources((prev) => [...prev, newRes]);
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const reorderResources = (newResources: ResourceItem[]) => {
    setResources(newResources);
  };

  const resetResources = () => {
    setResources(initialResources);
  };

  const updateRoutine = (id: string, updates: Partial<DailyRoutineTemplate>) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const addStickyNote = (note: Omit<StickyNoteItem, 'id' | 'createdAt'>) => {
    const newNote: StickyNoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setStickyNotes((prev) => [...prev, newNote]);
  };

  const updateStickyNote = (id: string, updates: Partial<StickyNoteItem>) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const deleteStickyNote = (id: string) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addStudyNote = (note: Omit<StudyNoteItem, 'id' | 'updatedAt'> & { id?: string }) => {
    const newNote: StudyNoteItem = {
      ...note,
      id: note.id || `study-note-${Date.now()}`,
      createdAt: note.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };
    setStudyNotes((prev) => [newNote, ...prev]);
  };

  const updateStudyNote = (id: string, updates: Partial<StudyNoteItem>) => {
    setStudyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteStudyNote = (id: string) => {
    setStudyNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateGuideSection = (id: string, updates: Partial<PrepGuideSection>) => {
    setGuideSections((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const resetAllData = () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setWeeklyPlans(initialWeeklyPlans);
    setTasks([]);
    setTopicProgress(() => {
      const initial: Record<string, TopicProgress> = {};
      initialTopics.forEach((t) => {
        initial[t.id] = {
          topicId: t.id,
          conceptDone: false,
          practiceDone: false,
          pyqsDone: false,
          confidence: 1,
          revision1Done: false,
          revision2Done: false,
          updatedAt: new Date().toISOString()
        };
      });
      return initial;
    });
    setMockTests(initialMockTests);
    setMistakes(initialMistakes);
    setResources(initialResources);
    setRoutines(initialRoutines);
    setStickyNotes([]);
    setStudyNotes(initialStudyNotes);
    setGuideSections(initialGuideSections);
    setActivities(initialActivities);
    setDailyGoals(initialDailyGoals);
    setTopics(initialTopics);
  };

  // Computed dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const today = new Date();
    const examDate = parseISO(profile.targetExamDate);
    const startDate = parseISO(profile.prepStartDate || '2026-11-16');
    const daysRemaining = Math.max(0, differenceInCalendarDays(examDate, today));

    // The week strictly starts from Monday and goes till Sunday; next Monday starts next week.
    const normalizedStartMonday = startOfWeek(startDate, { weekStartsOn: 1 });
    const todayMonday = startOfWeek(today, { weekStartsOn: 1 });
    const diffWeeks = differenceInCalendarWeeks(todayMonday, normalizedStartMonday, { weekStartsOn: 1 });
    const rawWeek = diffWeeks + 1;
    const currentWeek = Math.min(52, Math.max(1, rawWeek));

    // Phase determination
    let currentPhase = initialPhases[0];
    for (const ph of initialPhases) {
      if (currentWeek >= ph.startWeek && currentWeek <= ph.endWeek) {
        currentPhase = ph;
        break;
      }
    }

    // Topics progress rollup
    let completedTopics = 0;
    let inProgressTopics = 0;
    let weakTopicsCount = 0;
    let totalScorePoints = 0;

    Object.values(topicProgress).forEach((tp) => {
      const isComplete = tp.conceptDone && tp.practiceDone && tp.pyqsDone;
      if (isComplete) completedTopics++;
      else if (tp.conceptDone) inProgressTopics++;

      if (tp.confidence <= 2) weakTopicsCount++;

      // Weighted completion contribution (Concept 25%, Practice 25%, PYQ 25%, Rev1 12.5%, Rev2 12.5%)
      let p = 0;
      if (tp.conceptDone) p += 25;
      if (tp.practiceDone) p += 25;
      if (tp.pyqsDone) p += 25;
      if (tp.revision1Done) p += 12.5;
      if (tp.revision2Done) p += 12.5;
      totalScorePoints += p;
    });

    const totalTopics = topics.length;
    const overallCompletionPct = totalTopics > 0 ? totalScorePoints / totalTopics : 0;

    // Real mocks only (exclude sample data)
    const validMocks = mockTests.filter(
      (m) => !m.isSample && m.totalScore !== undefined && m.totalScore !== null
    );
    const totalMocksAttempted = validMocks.length;
    let latestMockScore: number | null = null;
    let bestMockScore: number | null = null;
    let averageMockScore: number | null = null;

    if (totalMocksAttempted > 0) {
      latestMockScore = validMocks[validMocks.length - 1].totalScore || 0;
      const scores = validMocks.map((m) => m.totalScore || 0);
      bestMockScore = Math.max(...scores);
      const sum = scores.reduce((acc, s) => acc + s, 0);
      averageMockScore = Math.round((sum / totalMocksAttempted) * 10) / 10;
    }

    // Mistakes
    const validMistakes = mistakes.filter((m) => !m.isSample);
    const pendingMistakesCount = validMistakes.filter((m) => !m.reSolved).length;
    const todayStr = format(today, 'yyyy-MM-dd');
    const overdueMistakesCount = validMistakes.filter(
      (m) => !m.reSolved && m.revisitDate < todayStr
    ).length;

    return {
      daysRemaining,
      currentWeek,
      currentPhase,
      totalTopics,
      completedTopics,
      inProgressTopics,
      weakTopicsCount,
      overallCompletionPct: Math.round(overallCompletionPct * 10) / 10,
      totalMocksAttempted,
      latestMockScore,
      bestMockScore,
      averageMockScore,
      pendingMistakesCount,
      overdueMistakesCount,
      currentStreak: aeonHabit.streak,
      bestStreak: aeonHabit.bestStreak,
      isYesterdayDone: aeonHabit.isYesterdayDone,
      isTodayDone: aeonHabit.isTodayDone,
      streakAtRisk: aeonHabit.streakAtRisk
    };
  }, [profile, topicProgress, mockTests, mistakes, aeonHabit]);

  return (
    <AppDataContext.Provider
      value={{
        profile,
        updateProfile,
        registeredProfiles,
        authSession,
        isAuthenticated: authSession.isAuthenticated,
        login,
        signup,
        logout,
        syncDataToCloudVault,
        importDataFromCloudVault,
        phases: initialPhases,
        weeklyPlans,
        updateWeeklyPlan,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        topics,
        updateTopic,
        addTopic,
        deleteTopic,
        resetTopics,
        topicProgress,
        updateTopicProgress,
        mockTests,
        addMockTest,
        updateMockTest,
        deleteMockTest,
        convertSampleMock,
        deleteSampleMock,
        mistakes,
        addMistake,
        updateMistake,
        deleteMistake,
        convertSampleMistake,
        deleteSampleMistake,
        resources,
        updateResource,
        addResource,
        deleteResource,
        reorderResources,
        resetResources,
        routines,
        updateRoutine,
        stickyNotes,
        addStickyNote,
        updateStickyNote,
        deleteStickyNote,
        studyNotes,
        addStudyNote,
        updateStudyNote,
        deleteStudyNote,
        guideSections,
        updateGuideSection,
        activities,
        addActivity,
        deleteActivity,
        dailyGoals,
        todayGoals,
        addDailyGoal,
        addMultipleDailyGoals,
        toggleDailyGoal,
        deleteDailyGoal,
        aeonHabit,
        toggleAeonDate,
        markYesterdayAeonDone,
        markTodayAeonDone,
        stats,
        resetAllData
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
