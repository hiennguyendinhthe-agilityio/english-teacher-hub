import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../services/i18n';
import { useThemeStore } from '../store/useThemeStore';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  LogOut, BookOpen, Trash2, Edit, Plus, LayoutDashboard, Sparkles, 
  Loader2, Eye, X, Users, FileText, Tags, CheckCircle2, Ban, Shield, 
  RefreshCw, Calendar, ArrowLeft, AlertCircle, Sun, Moon, Globe, Menu, ChevronRight 
} from 'lucide-react';
import AIImporter from '../components/AIImporter';
import CourseEditor from '../components/CourseEditor';
import InteractiveLesson from '../components/InteractiveLesson';
import { getAllUsers, toggleUserDisable, changeUserRole, promoteToAdminWithSecret } from '../services/authService';
import { getPublicPosts, getPostDetail, deletePost, getCategories, createCategory } from '../services/postService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { signOut, getToken } = useAuth();
  const { user: currentUser } = useUser();
  const logout = () => signOut();
  const { t, lang, setLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'importer', 'editor', 'students', 'essays', 'categories'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Firebase Courses State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);

  // PostgreSQL Students State & Pagination
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorStudents, setErrorStudents] = useState(null);
  const [studentsPage, setStudentsPage] = useState(1);
  const studentsLimit = 10;
  const [totalStudents, setTotalStudents] = useState(0);
  const [togglingUserId, setTogglingUserId] = useState(null);

  // PostgreSQL Submitted Essays State & Pagination
  const [essays, setEssays] = useState([]);
  const [loadingEssays, setLoadingEssays] = useState(false);
  const [errorEssays, setErrorEssays] = useState(null);
  const [essaysPage, setEssaysPage] = useState(1);
  const essaysLimit = 10;
  const [totalEssays, setTotalEssays] = useState(0);
  const [selectedEssayDetail, setSelectedEssayDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingEssayId, setDeletingEssayId] = useState(null);

  // PostgreSQL Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const [catMsg, setCatMsg] = useState(null);

  // Setup Admin State
  const [adminSecret, setAdminSecret] = useState('');
  const [promoting, setPromoting] = useState(false);
  const isAdmin = currentUser?.publicMetadata?.role?.toLowerCase() === 'admin'
    || localStorage.getItem('db_role')?.toLowerCase() === 'admin';

  // 1. Fetch Firebase Courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = [];
      querySnapshot.forEach((document) => {
        coursesData.push({ id: document.id, ...document.data() });
      });
      coursesData.sort((a, b) => a.title.localeCompare(b.title));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch PostgreSQL Registered Students with Pagination & Error State
  const fetchStudents = async (page = studentsPage) => {
    setLoadingStudents(true);
    setErrorStudents(null);
    try {
      const skip = (page - 1) * studentsLimit;
      const data = await getAllUsers(getToken, { skip, limit: studentsLimit });
      setStudents(data.items || []);
      setTotalStudents(data.total !== undefined ? data.total : (data.items?.length || 0));
    } catch (error) {
      console.error('Error fetching students:', error);
      const isForbidden = error.status === 403 || error.message?.includes('403');
      const isUnauthorized = error.status === 401 || error.message?.includes('401');
      setErrorStudents({
        status: isForbidden ? 403 : isUnauthorized ? 401 : (error.status || 500),
        message: isForbidden
          ? t('adminErrorForbidden')
          : isUnauthorized
          ? t('adminErrorUnauthorized')
          : (error.message || t('adminErrorGeneric'))
      });
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // 3. Fetch PostgreSQL Submitted Essays with Pagination & Error State
  const fetchEssays = async (page = essaysPage) => {
    setLoadingEssays(true);
    setErrorEssays(null);
    try {
      const skip = (page - 1) * essaysLimit;
      const data = await getPublicPosts(getToken, { skip, limit: essaysLimit });
      setEssays(data.items || []);
      setTotalEssays(data.total !== undefined ? data.total : (data.items?.length || 0));
    } catch (error) {
      console.error('Error fetching submitted essays:', error);
      const isForbidden = error.status === 403 || error.message?.includes('403');
      const isUnauthorized = error.status === 401 || error.message?.includes('401');
      setErrorEssays({
        status: isForbidden ? 403 : isUnauthorized ? 401 : (error.status || 500),
        message: isForbidden
          ? t('adminErrorForbidden')
          : isUnauthorized
          ? t('adminErrorUnauthorized')
          : (error.message || t('adminErrorGeneric'))
      });
      setEssays([]);
    } finally {
      setLoadingEssays(false);
    }
  };

  // 4. Fetch PostgreSQL Categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const data = await getCategories(getToken);
      setCategories(data.items || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorCategories({
        status: error.status || 500,
        message: error.message || t('adminErrorGeneric')
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch data on active tab change or page navigation (Pull Model)
  useEffect(() => {
    if (activeTab === 'courses') fetchCourses();
    if (activeTab === 'students') fetchStudents(studentsPage);
    if (activeTab === 'essays') fetchEssays(essaysPage);
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab, studentsPage, essaysPage]);

  // Toggle User Active / Disable
  const handleToggleUser = async (student) => {
    if (!window.confirm(t('adminConfirmToggleUser'))) return;
    setTogglingUserId(student.id);
    try {
      const updated = await toggleUserDisable(getToken, student.id);
      setStudents(students.map(s => s.id === student.id ? { ...s, is_active: updated.is_active } : s));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingUserId(null);
    }
  };

  // Promote User to Admin Role
  const handlePromoteToAdmin = async (student) => {
    const confirmPrompt = t('adminConfirmPromote').replace('{email}', student.email || '');
    if (!window.confirm(confirmPrompt)) return;
    setTogglingUserId(student.id);
    try {
      await changeUserRole(getToken, student.id, 'admin');
      setStudents(students.map(s => s.id === student.id ? { ...s, role: 'admin' } : s));
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleSelfPromote = async () => {
    if (!adminSecret) return;
    setPromoting(true);
    try {
      const updatedUser = await promoteToAdminWithSecret(getToken, adminSecret);
      localStorage.setItem('db_role', updatedUser.role);
      alert(t('adminSuccessPromoted'));
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setPromoting(false);
    }
  };

  // Delete Submitted Essay
  const handleDeleteEssay = async (essayId) => {
    if (!window.confirm(t('adminConfirmDeletePost'))) return;
    setDeletingEssayId(essayId);
    try {
      await deletePost(getToken, essayId);
      setEssays(prev => prev.filter(e => e.id !== essayId));
      setTotalEssays(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingEssayId(null);
    }
  };

  // Open Essay Detail Modal
  const handleOpenEssayDetail = async (essayId) => {
    setLoadingDetail(true);
    try {
      const detail = await getPostDetail(getToken, essayId);
      setSelectedEssayDetail(detail);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    setCreatingCat(true);
    setCatMsg(null);
    try {
      const created = await createCategory(getToken, {
        name: newCatName.trim(),
        slug: newCatSlug.trim().toLowerCase(),
      });
      setCategories([...categories, created]);
      setNewCatName('');
      setNewCatSlug('');
      setCatMsg({ text: t('adminCategoryCreated'), isSuccess: true });
    } catch (err) {
      setCatMsg({ text: err.message, isSuccess: false });
    } finally {
      setCreatingCat(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm(t('adminConfirmDeleteLesson'))) {
      try {
        await deleteDoc(doc(db, "courses", id));
        setCourses(courses.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting course:", error);
        alert(t('adminErrDeleteLesson'));
      }
    }
  };

  const handleSaveLessonFromAI = async (lesson) => {
    const lessonId = lesson.id || `unit-ai-${Date.now()}`;
    const newLesson = { ...lesson, id: lessonId };
    setEditingCourse(newLesson);
    setActiveTab('editor');
  };

  const handleOpenEditor = (course = null) => {
    setEditingCourse(course);
    setActiveTab('editor');
  };

  const handleSaveCourse = async (courseData) => {
    try {
      await setDoc(doc(db, "courses", courseData.id), courseData);
      alert(t('adminSuccessSaveLesson'));
      setActiveTab('courses');
    } catch (error) {
      console.error("Error saving course:", error);
      alert(t('adminErrSaveLesson'));
    }
  };

  // Navigation Items Config
  const navItems = [
    { id: 'courses', label: t('adminTabLessons'), icon: LayoutDashboard, color: 'indigo' },
    { id: 'importer', label: t('adminTabAIImporter'), icon: Sparkles, color: 'purple' },
    { id: 'students', label: t('adminTabStudents'), icon: Users, color: 'blue', count: totalStudents },
    { id: 'essays', label: t('adminTabEssays'), icon: FileText, color: 'amber', count: totalEssays },
    { id: 'categories', label: t('adminTabCategories'), icon: Tags, color: 'emerald', count: categories.length },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const currentTabInfo = navItems.find(item => item.id === activeTab) || { label: t('adminPortalTitle') };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-zinc-950 text-foreground">
      {/* ========================================================================= */}
      {/* 1. MOBILE HEADER BAR (< 768px screens)                                     */}
      {/* ========================================================================= */}
      <header className="md:hidden h-16 px-4 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-border/60 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-xl h-10 w-10 text-foreground hover:bg-secondary cursor-pointer shrink-0"
            aria-label={t('adminMobileMenu')}
          >
            <Menu size={22} />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Shield size={16} />
            </div>
            <h2 className="font-bold text-sm sm:text-base leading-tight truncate">{t('adminPortalTitle')}</h2>
          </div>
        </div>

        {/* Right Mobile Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center bg-secondary/70 px-2 py-1 rounded-full border border-border/70 text-xs">
            <Globe size={13} className="text-primary mr-1 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-foreground font-semibold text-xs outline-none cursor-pointer"
              aria-label="Select Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-foreground bg-background">
                  {l.flag}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            aria-label={isDarkMode ? t('adminThemeLight') : t('adminThemeDark')}
          >
            {isDarkMode ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} className="text-indigo-500" />}
          </Button>

          {/* Back to Home Link */}
          <Button asChild variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer" title={t('adminBackHome')}>
            <a href="/">
              <ArrowLeft size={17} />
            </a>
          </Button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE SLIDE-OVER NAVIGATION DRAWER (< 768px screens)                   */}
      {/* ========================================================================= */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-50 flex transition-all duration-300",
          isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop Overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <aside 
          className={cn(
            "relative z-50 w-[290px] max-w-[85vw] h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-r border-border shadow-2xl flex flex-col pt-5 pb-6 px-4 select-none transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-thin",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header in Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                <Shield size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm leading-tight text-foreground truncate">{t('adminPortalTitle')}</h3>
                <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm cursor-pointer",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                      {item.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin Setup if not admin */}
          {!isAdmin && (
            <div className="mt-4 p-3.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl mb-4">
              <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase mb-1">{t('adminSetupTitle')}</h3>
              <p className="text-[11px] text-muted-foreground mb-2.5 leading-snug">{t('adminSetupDesc')}</p>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={adminSecret} 
                  onChange={e => setAdminSecret(e.target.value)} 
                  placeholder={t('adminSetupSecretPlaceholder')} 
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background"
                />
                <Button size="sm" onClick={handleSelfPromote} disabled={promoting} className="px-3 h-auto text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  {promoting ? <Loader2 size={13} className="animate-spin" /> : t('adminSetupSubmit')}
                </Button>
              </div>
            </div>
          )}

          {/* Drawer Footer Links */}
          <div className="pt-4 border-t border-border/50 space-y-2">
            <Button asChild variant="outline" className="w-full rounded-xl gap-2 text-xs font-semibold justify-start">
              <a href="/">
                <ArrowLeft size={14} /> {t('adminBackHome')}
              </a>
            </Button>

            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium text-xs cursor-pointer"
            >
              <LogOut size={16} /> {t('adminLogout')}
            </button>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. DESKTOP SIDEBAR (>= 768px screens)                                     */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white dark:bg-zinc-900 border-r border-border/60 flex-col p-6 shadow-xs z-20 shrink-0 h-full overflow-y-auto scrollbar-thin select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
            <Shield size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-base leading-tight truncate text-foreground">{t('adminPortalTitle')}</h2>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm cursor-pointer",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">
                    {item.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Setup if not admin */}
        {!isAdmin && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-2xl mb-4">
            <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase mb-1.5">{t('adminSetupTitle')}</h3>
            <p className="text-[11px] text-muted-foreground mb-3 leading-snug">{t('adminSetupDesc')}</p>
            <div className="flex gap-2">
              <input 
                type="password" 
                value={adminSecret} 
                onChange={e => setAdminSecret(e.target.value)} 
                placeholder={t('adminSetupSecretPlaceholder')} 
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
              />
              <Button size="sm" onClick={handleSelfPromote} disabled={promoting} className="px-3 h-auto text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold">
                {promoting ? <Loader2 size={14} className="animate-spin" /> : t('adminSetupSubmit')}
              </Button>
            </div>
          </div>
        )}

        {/* Sidebar Footer Links */}
        <div className="pt-4 border-t border-border/50 space-y-2">
          <Button asChild variant="outline" className="w-full rounded-xl gap-2 text-xs font-semibold justify-start">
            <a href="/">
              <ArrowLeft size={14} /> {t('adminBackHome')}
            </a>
          </Button>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium text-sm cursor-pointer"
          >
            <LogOut size={16} /> {t('adminLogout')}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT CONTAINER WITH DESKTOP TOP BAR & INDEPENDENT SCROLL       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex h-16 px-6 lg:px-8 border-b border-border/60 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md items-center justify-between shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>{t('adminBreadcrumbRoot')}</span>
            <ChevronRight size={14} />
            <span className="text-foreground font-bold">{currentTabInfo.label}</span>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-secondary/60 px-3 py-1.5 rounded-full border border-border/80 hover:border-primary/40 transition-colors">
              <Globe size={14} className="text-primary shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-none text-foreground font-semibold text-xs outline-none cursor-pointer focus:ring-0"
                aria-label="Select Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-foreground bg-background">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Switcher Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary hover:rotate-12 transition-transform cursor-pointer"
              aria-label={isDarkMode ? t('adminThemeLight') : t('adminThemeDark')}
              title={isDarkMode ? t('adminThemeLight') : t('adminThemeDark')}
            >
              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
            </Button>

            {/* Refresh Current Tab Data Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'courses') fetchCourses();
                if (activeTab === 'students') fetchStudents(studentsPage);
                if (activeTab === 'essays') fetchEssays(essaysPage);
                if (activeTab === 'categories') fetchCategories();
              }}
              title={t('adminRefreshData')}
              className="rounded-full h-9 px-3 gap-1.5 text-xs font-semibold"
            >
              <RefreshCw size={13} className={loading || loadingStudents || loadingEssays || loadingCategories ? "animate-spin" : ""} />
              <span className="hidden lg:inline">{t('adminRefreshData')}</span>
            </Button>

            {/* Admin Badge */}
            {isAdmin && (
              <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[11px] px-2.5 py-0.5">
                ADMIN
              </Badge>
            )}
          </div>
        </div>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth scrollbar-thin">
          {previewCourse ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-end mb-4 max-w-5xl mx-auto">
                <Button 
                  onClick={() => setPreviewCourse(null)}
                  variant="destructive"
                  className="rounded-xl gap-2 font-bold cursor-pointer"
                >
                  <X size={18} /> {t('adminClosePreview')}
                </Button>
              </div>
              <InteractiveLesson lessonData={previewCourse} onBack={() => setPreviewCourse(null)} />
            </div>
          ) : activeTab === 'courses' ? (
            /* ── Courses Tab ── */
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{t('adminTabLessons')}</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t('adminLessonsSub')}</p>
                </div>
                <Button 
                  onClick={() => handleOpenEditor(null)}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 gap-2 shrink-0 cursor-pointer"
                >
                  <Plus size={18} /> {t('adminBtnAddNew')}
                </Button>
              </div>

              {loading && courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-medium text-sm">{t('adminLoading')}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-border/50 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">{t('adminColLessonTitle')}</th>
                          <th className="px-6 py-4">{t('adminColLessonId')}</th>
                          <th className="px-6 py-4">{t('adminColLessonStats')}</th>
                          <th className="px-6 py-4 text-right">{t('adminColActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {courses.map((course) => (
                          <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                <BookOpen size={16} className="text-indigo-500 shrink-0" />
                                <span className="truncate max-w-[280px]">{course.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                              {course.id}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{course.vocabulary?.length || 0}</span> {t('adminWordsUnit')}
                            </td>
                            <td className="px-6 py-4 text-right space-x-1 sm:space-x-2">
                              <Button 
                                size="icon"
                                variant="ghost"
                                onClick={() => setPreviewCourse(course)}
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg cursor-pointer" 
                                title={t('adminActionPreview')}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenEditor(course)}
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer" 
                                title={t('adminActionEdit')}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteCourse(course.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer" 
                                title={t('adminActionDelete')}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {courses.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground text-sm">
                              {t('adminNoLessons')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'importer' ? (
            /* ── AI Importer Tab ── */
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{t('adminTabAIImporter')}</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">{t('adminAiImporterSub')}</p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-border/50">
                <AIImporter setActiveTab={() => {}} onSaveLesson={handleSaveLessonFromAI} />
              </div>
            </div>
          ) : activeTab === 'editor' ? (
            /* ── Course Editor Tab ── */
            <CourseEditor 
              initialData={editingCourse} 
              onSave={handleSaveCourse} 
              onCancel={() => setActiveTab('courses')}
              onSwitchToAI={() => setActiveTab('importer')}
            />
          ) : activeTab === 'students' ? (
            /* ── Students Management Tab ── */
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{t('adminTabStudents')}</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {t('adminStudentsSub')} (`GET /api/users`)
                  </p>
                </div>
                <Button onClick={() => fetchStudents(studentsPage)} variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
                  <RefreshCw size={14} className={loadingStudents ? "animate-spin" : ""} />
                  {t('essayRetry')}
                </Button>
              </div>

              {errorStudents && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                    <div>
                      <p className="font-bold text-sm">{t('adminErrorTitle')} {errorStudents.status ? `(${errorStudents.status})` : ''}</p>
                      <p className="text-xs mt-1 text-destructive/90 leading-relaxed">{errorStudents.message}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => fetchStudents(studentsPage)} className="shrink-0 text-xs rounded-xl gap-1">
                    <RefreshCw size={12} /> {t('adminBtnRetry')}
                  </Button>
                </div>
              )}

              {loadingStudents && students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-blue-500">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-medium text-sm">{t('adminLoading')}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-border/50 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">{t('adminUserColEmail')}</th>
                          <th className="px-6 py-4">{t('adminUserColRole')}</th>
                          <th className="px-6 py-4">{t('adminUserColStatus')}</th>
                          <th className="px-6 py-4">{t('adminUserColJoined')}</th>
                          <th className="px-6 py-4 text-right">{t('adminUserColActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {students.map((student) => {
                          const isStudentAdmin = student.role?.toLowerCase() === 'admin';
                          return (
                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-foreground text-sm flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                    {student.email?.[0] || 'U'}
                                  </div>
                                  <span className="truncate max-w-[220px]">{student.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`uppercase text-[11px] font-bold ${
                                  isStudentAdmin 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' 
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200'
                                }`}>
                                  {student.role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                {student.is_active ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 size={14} /> {t('adminUserStatusActive')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                                    <Ban size={14} /> {t('adminUserStatusDisabled')}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                {student.created_at ? new Date(student.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!isStudentAdmin && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={togglingUserId === student.id}
                                      onClick={() => handlePromoteToAdmin(student)}
                                      className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
                                      title="Promote to Admin"
                                    >
                                      <Shield size={13} /> Admin
                                    </Button>
                                  )}
                                  {!isStudentAdmin && (
                                    <Button
                                      size="sm"
                                      variant={student.is_active ? "destructive" : "outline"}
                                      disabled={togglingUserId === student.id}
                                      onClick={() => handleToggleUser(student)}
                                      className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                                    >
                                      {togglingUserId === student.id ? (
                                        <Loader2 size={13} className="animate-spin" />
                                      ) : student.is_active ? (
                                        <Ban size={13} />
                                      ) : (
                                        <CheckCircle2 size={13} />
                                      )}
                                      {student.is_active ? t('adminBtnDisable') : t('adminBtnEnable')}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground text-sm">
                              {t('adminNoUsers')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalStudents > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border/50 bg-slate-50/50 dark:bg-zinc-950/20 text-xs text-muted-foreground">
                      <span>
                        {t('adminPaginationShowing')} {(studentsPage - 1) * studentsLimit + 1} {t('adminPaginationTo')} {Math.min(studentsPage * studentsLimit, totalStudents)} {t('adminPaginationOf')} {totalStudents} {t('adminPaginationEntries')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={studentsPage <= 1 || loadingStudents}
                          onClick={() => {
                            const newPage = studentsPage - 1;
                            setStudentsPage(newPage);
                            fetchStudents(newPage);
                          }}
                          className="h-8 px-3 rounded-lg text-xs"
                        >
                          {t('adminPaginationPrev')}
                        </Button>
                        <span className="font-medium px-1">
                          {t('adminPaginationPage')} {studentsPage} / {Math.max(1, Math.ceil(totalStudents / studentsLimit))}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={studentsPage * studentsLimit >= totalStudents || loadingStudents}
                          onClick={() => {
                            const newPage = studentsPage + 1;
                            setStudentsPage(newPage);
                            fetchStudents(newPage);
                          }}
                          className="h-8 px-3 rounded-lg text-xs"
                        >
                          {t('adminPaginationNext')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'essays' ? (
            /* ── Submitted Essays Tab ── */
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{t('adminEssaysTitle')}</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {t('adminEssaysSub')} (`GET /api/posts`)
                  </p>
                </div>
                <Button onClick={() => fetchEssays(essaysPage)} variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
                  <RefreshCw size={14} className={loadingEssays ? "animate-spin" : ""} />
                  {t('essayRetry')}
                </Button>
              </div>

              {errorEssays && (
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                    <div>
                      <p className="font-bold text-sm">{t('adminErrorTitle')} {errorEssays.status ? `(${errorEssays.status})` : ''}</p>
                      <p className="text-xs mt-1 text-destructive/90 leading-relaxed">{errorEssays.message}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => fetchEssays(essaysPage)} className="shrink-0 text-xs rounded-xl gap-1">
                    <RefreshCw size={12} /> {t('adminBtnRetry')}
                  </Button>
                </div>
              )}

              {loadingEssays && essays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-amber-500">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-medium text-sm">{t('adminLoading')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {essays.map((essay) => (
                    <Card key={essay.id} className="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-border/50 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                        <div>
                          <h3 className="font-bold text-base text-foreground">{essay.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                              👤 {essay.author_email || essay.author_id}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                            <Calendar size={12} />
                            {new Date(essay.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 my-3 leading-relaxed">
                        {essay.content}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap gap-1.5">
                          {essay.categories?.map(c => (
                            <Badge key={c.id} variant="secondary" className="text-[10px] rounded-lg">
                              {c.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEssayDetail(essay.id)}
                            className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} /> {t('essayViewDetail')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingEssayId === essay.id}
                            onClick={() => handleDeleteEssay(essay.id)}
                            className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                          >
                            {deletingEssayId === essay.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            {t('adminBtnDeletePost')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {essays.length === 0 && !errorEssays && (
                    <Card className="p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-dashed border-2 rounded-3xl">
                      <p className="text-muted-foreground text-sm">{t('adminNoEssays')}</p>
                    </Card>
                  )}

                  {/* Essays Pagination Controls */}
                  {totalEssays > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-border/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm text-xs text-muted-foreground">
                      <span>
                        {t('adminPaginationShowing')} {(essaysPage - 1) * essaysLimit + 1} {t('adminPaginationTo')} {Math.min(essaysPage * essaysLimit, totalEssays)} {t('adminPaginationOf')} {totalEssays} {t('adminPaginationEntries')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={essaysPage <= 1 || loadingEssays}
                          onClick={() => {
                            const newPage = essaysPage - 1;
                            setEssaysPage(newPage);
                            fetchEssays(newPage);
                          }}
                          className="h-8 px-3 rounded-lg text-xs"
                        >
                          {t('adminPaginationPrev')}
                        </Button>
                        <span className="font-medium px-1">
                          {t('adminPaginationPage')} {essaysPage} / {Math.max(1, Math.ceil(totalEssays / essaysLimit))}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={essaysPage * essaysLimit >= totalEssays || loadingEssays}
                          onClick={() => {
                            const newPage = essaysPage + 1;
                            setEssaysPage(newPage);
                            fetchEssays(newPage);
                          }}
                          className="h-8 px-3 rounded-lg text-xs"
                        >
                          {t('adminPaginationNext')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'categories' ? (
            /* ── Categories Management Tab ── */
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">{t('adminTabCategories')}</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {t('adminEssaysSub')} (`GET` / `POST /api/categories`)
                </p>
              </div>

              {/* Create Category Form */}
              <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-border/50 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-emerald-500" /> {t('adminAddCategory')}
                </h3>

                {catMsg && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                    catMsg.isSuccess ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    <AlertCircle size={14} />
                    <span>{catMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      {t('adminCategoryName')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IELTS Writing Task 1"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!newCatSlug) {
                          setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      {t('adminCategorySlug')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ielts-task-1"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={creatingCat} className="rounded-xl font-bold gap-2">
                      {creatingCat ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      {t('adminBtnCreateCategory')}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Category List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <Card key={cat.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{cat.name}</h4>
                      <p className="text-xs font-mono text-muted-foreground">slug: {cat.slug}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{t('adminStatusActive')}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 5. ESSAY DETAIL MODAL                                                     */}
      {/* ========================================================================= */}
      {selectedEssayDetail && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-border/60 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b border-border/40 flex items-start justify-between gap-4 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedEssayDetail.title}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-1">{t('adminDetailAuthorId')}: {selectedEssayDetail.author_id}</p>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEssayDetail(null)}
                className="rounded-xl cursor-pointer"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 scrollbar-thin">
              <div className="flex flex-wrap gap-2">
                {selectedEssayDetail.categories?.map(c => (
                  <Badge key={c.id} className="rounded-lg">{c.name}</Badge>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-border/50 whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
                {selectedEssayDetail.content}
              </div>
            </div>

            <div className="p-4 border-t border-border/40 flex justify-end bg-slate-50/50 dark:bg-zinc-950/50 shrink-0">
              <Button onClick={() => setSelectedEssayDetail(null)} variant="outline" className="rounded-xl font-bold">
                {t('essayClose')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
