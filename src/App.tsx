import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';

// Navigation Pages
import { HomePage } from './pages/HomePage';
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

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<HomePage />} />
              {/* Canonical Hub Routes */}
              <Route path="plan" element={<WeeklyPlannerPage />} />
              <Route path="practice" element={<MockTrackerPage />} />
              <Route path="insights" element={<AnalyticsPage />} />
              <Route path="notes" element={<NotesPage />} />

              {/* Preserved Sub-routes & Legacy Redirects */}
              <Route path="planner" element={<WeeklyPlannerPage />} />
              <Route path="topics" element={<TopicTrackerPage />} />
              <Route path="mocks" element={<MockTrackerPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="mistakes" element={<MistakeLogPage />} />
              <Route path="sticky-board" element={<StickyBoardPage />} />
              <Route path="resources" element={<FreeResourcesPage />} />
              <Route path="routines" element={<DailyRoutinesPage />} />
              <Route path="guide" element={<PrepGuidePage />} />
              <Route path="ai-coach" element={<AICoachPage />} />
              <Route path="settings" element={<ProfileSettingsPage />} />
              <Route path="admin" element={<AdminPanelPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  );
};

export default App;
