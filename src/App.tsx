import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';
import { StudyTimerProvider } from './context/StudyTimerContext';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { TooltipProvider } from './components/ui/tooltip';

// Hub Pages
import { HomePage } from './pages/HomePage';
import { PlanPage } from './pages/PlanPage';
import { PracticePage } from './pages/PracticePage';
import { InsightsPage } from './pages/InsightsPage';
import { NotesContainerPage } from './pages/NotesContainerPage';
import { VocabularyPage } from './pages/VocabularyPage';

// Sub-Pages & Utilities
import { WeeklyPlannerPage } from './pages/WeeklyPlannerPage';
import { TopicTrackerPage } from './pages/TopicTrackerPage';
import { MockTrackerPage } from './pages/MockTrackerPage';
import { MistakeLogPage } from './pages/MistakeLogPage';
import { FreeResourcesPage } from './pages/FreeResourcesPage';
import { DailyRoutinesPage } from './pages/DailyRoutinesPage';
import { PrepGuidePage } from './pages/PrepGuidePage';
import { AICoachPage } from './pages/AICoachPage';
import { NotesPage } from './pages/NotesPage';
import { StickyBoardPage } from './pages/StickyBoardPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DevGlassPage } from './pages/DevGlassPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <StudyTimerProvider>
          <TooltipProvider delayDuration={150}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppShell />}>
                  <Route index element={<HomePage />} />
                  {/* Canonical Hub Routes */}
                  <Route path="plan" element={<PlanPage />} />
                  <Route path="practice" element={<PracticePage />} />
                  <Route path="vocabulary" element={<VocabularyPage />} />
                  <Route path="vocab" element={<Navigate to="/vocabulary" replace />} />
                  <Route path="insights" element={<InsightsPage />} />
                  <Route path="notes" element={<NotesContainerPage />} />

                  {/* Sub-routes and Legacy Direct Navigation */}
                  <Route path="planner" element={<PlanPage defaultTab="planner" />} />
                  <Route path="topics" element={<PlanPage defaultTab="topics" />} />
                  <Route path="mocks" element={<PracticePage defaultTab="mocks" />} />
                  <Route path="mistakes" element={<PracticePage defaultTab="mistakes" />} />
                  <Route path="analytics" element={<InsightsPage defaultTab="analytics" />} />
                  <Route path="history" element={<InsightsPage defaultTab="history" />} />
                  <Route path="sticky-board" element={<NotesContainerPage defaultTab="sticky-board" />} />
                  <Route path="resources" element={<FreeResourcesPage />} />
                  <Route path="routines" element={<DailyRoutinesPage />} />
                  <Route path="guide" element={<PrepGuidePage />} />
                  <Route path="ai-coach" element={<AICoachPage />} />
                  <Route path="coach" element={<Navigate to="/ai-coach" replace />} />
                  <Route path="settings" element={<ProfileSettingsPage />} />
                  <Route path="admin" element={<AdminPanelPage />} />
                  <Route path="dev/glass" element={<DevGlassPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
              <Toaster position="top-right" richColors />
            </BrowserRouter>
          </TooltipProvider>
        </StudyTimerProvider>
      </AppDataProvider>
    </ThemeProvider>
  );
};

export default App;
