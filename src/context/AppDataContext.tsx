import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserProfile,
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
  DailyGoalItem
} from '../types';
import { initialPhases } from '../data/phases';
import { initialTopics } from '../data/topics';
import { initialWeeklyPlans } from '../data/weeklyPlans';
import { initialResources } from '../data/resources';
import { initialRoutines } from '../data/routines';
import { initialGuideSections } from '../data/guideSections';
import { initialStudyNotes } from '../data/initialNotes';
import { initialMockTests, initialMistakes } from '../data/initialMockAndMistake';
import { initialActivities, initialDailyGoals } from '../data/initialActivities';
import { addDays, differenceInCalendarDays, parseISO, format } from 'date-fns';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-default',
  displayName: 'CAT 2027 Aspirant',
  catTargetYear: 2027,
  prepStartDate: '2026-11-17',
  targetExamDate: '2027-11-28',
  preferredDailyHours: 3.0,
  preferredRoutine: 'working_professional_weekday',
  themePreference: 'dark',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  isAdmin: true
};

interface AppDataContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  phases: typeof initialPhases;
  weeklyPlans: WeeklyPlanItem[];
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlanItem>) => void;
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  topics: TopicItem[];
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
  addDailyGoal: (goal: Omit<DailyGoalItem, 'id'>) => void;
  toggleDailyGoal: (id: string) => void;
  deleteDailyGoal: (id: string) => void;
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

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() =>
    getInitialState('profile', DEFAULT_PROFILE)
  );

  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlanItem[]>(() =>
    getInitialState('weeklyPlans', initialWeeklyPlans)
  );

  const [tasks, setTasks] = useState<StudyTask[]>(() =>
    getInitialState('tasks', [
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
    ])
  );

  const [topics] = useState<TopicItem[]>(initialTopics);

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

  const [activities, setActivities] = useState<StudyActivityItem[]>(() =>
    getInitialState('activities', initialActivities)
  );

  const [dailyGoals, setDailyGoals] = useState<DailyGoalItem[]>(() =>
    getInitialState('dailyGoals', initialDailyGoals)
  );

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'weeklyPlans', JSON.stringify(weeklyPlans));
  }, [weeklyPlans]);

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

  // Recalculate 52-week dates when prepStartDate changes
  useEffect(() => {
    try {
      const baseStart = parseISO(profile.prepStartDate);
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
    const newGoal: DailyGoalItem = {
      ...goal,
      id: `goal-${Date.now()}`
    };
    setDailyGoals((prev) => [newGoal, ...prev]);
    addActivity({
      date: goal.date,
      category: 'goal',
      title: `Set Goal: ${goal.title}`,
      details: `Target: ${goal.targetMinutes}m in ${goal.section}`,
      section: goal.section
    });
  };

  const toggleDailyGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nowCompleted = !g.completed;
        if (nowCompleted) {
          addActivity({
            date: new Date().toISOString().split('T')[0],
            category: 'goal',
            title: `Completed Goal: ${g.title}`,
            details: `Target of ${g.targetMinutes} minutes achieved.`,
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

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateWeeklyPlan = (id: string, updates: Partial<WeeklyPlanItem>) => {
    setWeeklyPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))
    );
  };

  const addTask = (task: Omit<StudyTask, 'id' | 'createdAt'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    addActivity({
      date: new Date().toISOString().split('T')[0],
      category: 'task',
      title: `Added Task: ${task.title}`,
      details: task.description || `Section: ${task.section}`,
      section: task.section,
      durationMinutes: task.estimatedMinutes
    });
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTopicProgress = (topicId: string, updates: Partial<TopicProgress>) => {
    const topicObj = initialTopics.find((t) => t.id === topicId);
    if (topicObj) {
      if (updates.conceptDone) {
        addActivity({
          date: new Date().toISOString().split('T')[0],
          category: 'topic',
          title: `Studied Concept: ${topicObj.topicName}`,
          details: `Area: ${topicObj.area} (${topicObj.section})`,
          section: topicObj.section
        });
      }
      if (updates.practiceDone) {
        addActivity({
          date: new Date().toISOString().split('T')[0],
          category: 'topic',
          title: `Completed Practice: ${topicObj.topicName}`,
          details: `Area: ${topicObj.area} (${topicObj.section})`,
          section: topicObj.section
        });
      }
      if (updates.pyqsDone) {
        addActivity({
          date: new Date().toISOString().split('T')[0],
          category: 'topic',
          title: `Solved PYQs: ${topicObj.topicName}`,
          details: `Past Year CAT Questions completed.`,
          section: topicObj.section
        });
      }
    }

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

    addActivity({
      date: mock.testDate || new Date().toISOString().split('T')[0],
      category: 'mock',
      title: `Attempted Mock Test #${nextNumber}`,
      details: `Total Score: ${totalScore} (QA: ${mock.qaScore || 0}, DILR: ${mock.dilrScore || 0}, VARC: ${mock.varcScore || 0})`,
      section: 'General',
      durationMinutes: 120
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

    addActivity({
      date: mistake.date,
      category: 'mistake',
      title: `Logged Mistake: ${mistake.topic}`,
      details: `Type: ${mistake.mistakeType} • Rule: ${mistake.ruleForNextTime}`,
      section: mistake.section
    });
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

    addActivity({
      date: newNote.createdAt,
      category: 'note',
      title: `Created Study Note: ${newNote.title}`,
      details: `Type: ${newNote.noteType} • Topic: ${newNote.topic}`,
      section: newNote.section
    });
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
  };

  // Computed dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const today = new Date();
    const examDate = parseISO(profile.targetExamDate);
    const startDate = parseISO(profile.prepStartDate);
    const daysRemaining = Math.max(0, differenceInCalendarDays(examDate, today));

    const daysFromStart = differenceInCalendarDays(today, startDate);
    const rawWeek = Math.floor(daysFromStart / 7) + 1;
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

    const totalTopics = initialTopics.length;
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
      overdueMistakesCount
    };
  }, [profile, topicProgress, mockTests, mistakes]);

  return (
    <AppDataContext.Provider
      value={{
        profile,
        updateProfile,
        phases: initialPhases,
        weeklyPlans,
        updateWeeklyPlan,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        topics,
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
        addDailyGoal,
        toggleDailyGoal,
        deleteDailyGoal,
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
