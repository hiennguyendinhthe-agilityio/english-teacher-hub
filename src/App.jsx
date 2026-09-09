import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
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
const TeacherPlanner = lazy(() => import('./components/TeacherPlanner'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
import AIChatBot from './components/AIChatBot';
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { AlertCircle, X } from "lucide-react";

function NetworkErrorToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-top-5 fade-in duration-300">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-md transition-colors ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}


function AppLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [networkErrorMsg, setNetworkErrorMsg] = useState("");
  const mainScrollRef = useRef(null);

  useEffect(() => {
    const handleNetworkError = (e) => {
      setNetworkErrorMsg(e.detail?.message || "Lỗi kết nối");
      // Tự động tắt sau 5 giây
      setTimeout(() => setNetworkErrorMsg(""), 5000);
    };
    window.addEventListener("network_error", handleNetworkError);
    return () => window.removeEventListener("network_error", handleNetworkError);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Splash screen is now handled at the App root level — removed from AppLayout

  // Auto scroll main container to top whenever active tab changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
      if (typeof mainScrollRef.current.scrollTo === 'function') {
        mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

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
      case 'teacherPlanner':
        return (
          <Suspense fallback={<LoadingSkeleton variant="split" />}>
            <TeacherPlanner />
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
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8">
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

      {/* Network Error Toast */}
      <NetworkErrorToast message={networkErrorMsg} onClose={() => setNetworkErrorMsg("")} />
    </div>
  );
}

export default function App() {
  // Tắt Splash Screen ở root level — áp dụng cho TẤT CẢ routes (/, /login, /admin)
  // Dùng 200ms thay vì 700ms để ép splash tắt sớm hơn
  useEffect(() => {
    const splash = document.getElementById('app-splash');
    if (!splash) return;

    // Add fade-out immediately
    splash.classList.add('splash-fade-out');
    const timer = setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
