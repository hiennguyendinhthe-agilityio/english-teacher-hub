import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import { LanguageProvider } from './context/LanguageContext';

// Dynamic Code-Splitting / Lazy Loading for Heavy Modules
const CourseManager = lazy(() => import('./components/CourseManager'));
const FlashcardBuilder = lazy(() => import('./components/FlashcardBuilder'));
const WorksheetGenerator = lazy(() => import('./components/WorksheetGenerator'));
const EssayGrader = lazy(() => import('./components/EssayGrader'));
const AIImporter = lazy(() => import('./components/AIImporter'));
const LessonPlanner = lazy(() => import('./components/LessonPlanner'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
import AIChatBot from './components/AIChatBot';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function AppLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'courseManager':
        return (
          <Suspense fallback={<LoadingSkeleton variant="grid" />}>
            <CourseManager setActiveTab={setActiveTab} />
          </Suspense>
        );
      case 'flashcard':
        return (
          <Suspense fallback={<LoadingSkeleton variant="split" />}>
            <FlashcardBuilder />
          </Suspense>
        );
      case 'worksheet':
        return (
          <Suspense fallback={<LoadingSkeleton variant="split" />}>
            <WorksheetGenerator />
          </Suspense>
        );
      case 'essay':
        return (
          <Suspense fallback={<LoadingSkeleton variant="split" />}>
            <EssayGrader />
          </Suspense>
        );
      case 'aiImporter':
        return (
          <Suspense fallback={<LoadingSkeleton variant="split" />}>
            <AIImporter setActiveTab={setActiveTab} />
          </Suspense>
        );
      case 'planner':
        return (
          <Suspense fallback={<LoadingSkeleton variant="split" />}>
            <LessonPlanner />
          </Suspense>
        );
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          openSettings={() => setIsSettingsOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Lazy Loaded Settings Modal */}
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </Suspense>
      )}

      {/* Global AI Chat Assistant */}
      <AIChatBot />

      {/* PWA Mobile App Install Prompt Banner */}
      <PWAInstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
