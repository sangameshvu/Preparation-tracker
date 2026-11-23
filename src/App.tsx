import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppDataProvider } from './context/AppDataContext';
import { StudyTimerProvider } from './context/StudyTimerContext';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { TooltipProvider } from './components/ui/tooltip';
import { RouteLoadingFallback } from './components/layout/RouteLoadingFallback';

// Primary Index Page (eagerly loaded for instantaneous initial paint)
import { HomePage } from './pages/HomePage';

// Lazy-loaded Hub & Sub Pages (Code-split for blazing-fast navigation & load times)
const PlanPage = lazy(() => import('./pages/PlanPage').then((m) => ({ default: m.PlanPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then((m) => ({ default: m.PracticePage })));
const VocabularyPage = lazy(() => import('./pages/VocabularyPage').then((m) => ({ default: m.VocabularyPage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const NotesContainerPage = lazy(() => import('./pages/NotesContainerPage').then((m) => ({ default: m.NotesContainerPage })));

const FreeResourcesPage = lazy(() => import('./pages/FreeResourcesPage').then((m) => ({ default: m.FreeResourcesPage })));
const DailyRoutinesPage = lazy(() => import('./pages/DailyRoutinesPage').then((m) => ({ default: m.DailyRoutinesPage })));
const PrepGuidePage = lazy(() => import('./pages/PrepGuidePage').then((m) => ({ default: m.PrepGuidePage })));
const AICoachPage = lazy(() => import('./pages/AICoachPage').then((m) => ({ default: m.AICoachPage })));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage').then((m) => ({ default: m.AdminPanelPage })));
const DevGlassPage = lazy(() => import('./pages/DevGlassPage').then((m) => ({ default: m.DevGlassPage })));

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <StudyTimerProvider>
          <TooltipProvider delayDuration={150}>
            <BrowserRouter>
              <Suspense fallback={<RouteLoadingFallback />}>
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
              </Suspense>
              <Toaster position="top-right" richColors />
            </BrowserRouter>
          </TooltipProvider>
        </StudyTimerProvider>
      </AppDataProvider>
    </ThemeProvider>
  );
};

export default App;
