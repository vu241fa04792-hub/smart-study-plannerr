import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickTaskModal } from './components/common/QuickTaskModal';
import { AchievementUnlockedModal } from './components/common/AchievementUnlockedModal';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { CalendarPage } from './pages/CalendarPage';
import { FocusTimerPage } from './pages/FocusTimerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { NotesPage } from './pages/NotesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { RecentlyDeletedPage } from './pages/RecentlyDeletedPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard Workspace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="focus" element={<FocusTimerPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="planner" element={<StudyPlannerPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="trash" element={<RecentlyDeletedPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>

        {/* Global Floating Modals & Providers */}
        <ToastContainer />
        <GlobalSearchModal />
        <QuickTaskModal />
        <AchievementUnlockedModal />
      </BrowserRouter>
    </AppProvider>
  );
}
