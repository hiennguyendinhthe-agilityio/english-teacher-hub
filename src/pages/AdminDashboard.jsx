import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LogOut, BookOpen, Trash2, Edit, Plus, LayoutDashboard, Sparkles, Loader2, Eye, X } from 'lucide-react';
import AIImporter from '../components/AIImporter';
import CourseEditor from '../components/CourseEditor';
import InteractiveLesson from '../components/InteractiveLesson';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const { user: currentUser } = useUser();
  const logout = () => signOut();
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'importer', 'editor'
  const [editingCourse, setEditingCourse] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);

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

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        setCourses(courses.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Error deleting lesson!");
      }
    }
  };

  const handleSaveLessonFromAI = async (lesson) => {
    // Phase 4: Route AI generated lesson to the Course Editor (Review before save)
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
      alert("✅ Lesson saved successfully!");
      setActiveTab('courses');
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error saving lesson!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-border/50 flex flex-col p-6 shadow-sm z-10 relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            A
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Admin Portal</h2>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'courses' 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <LayoutDashboard size={20} /> Manage Lessons
          </button>
          <button 
            onClick={() => setActiveTab('importer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'importer' 
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles size={20} /> AI Lesson Creator
          </button>
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {previewCourse ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-end mb-4 max-w-5xl mx-auto">
              <button 
                onClick={() => setPreviewCourse(null)}
                className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-xl font-bold transition-colors"
              >
                <X size={18} /> Close Preview
              </button>
            </div>
            <InteractiveLesson lessonData={previewCourse} onBack={() => setPreviewCourse(null)} />
          </div>
        ) : activeTab === 'courses' ? (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Lesson List</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Manage all data currently on Firebase</p>
              </div>
              <button 
                onClick={() => handleOpenEditor(null)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <Plus size={18} /> Add New
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-medium">{t('adminLoading')}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border/50 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-border/50 text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Lesson Title</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Statistics</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-500" />
                            {course.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                          {course.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <span className="font-semibold">{course.vocabulary?.length || 0}</span> words
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => setPreviewCourse(course)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Preview"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditor(course)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground">
                          No lessons found on Firebase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'importer' ? (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold mb-2">AI Lesson Creator (Direct to Firebase)</h1>
              <p className="text-muted-foreground">Lessons created here will be saved directly to the Cloud for student use.</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-border/50">
              <AIImporter setActiveTab={() => {}} onSaveLesson={handleSaveLessonFromAI} />
            </div>
          </div>
        ) : activeTab === 'editor' ? (
          <CourseEditor 
            initialData={editingCourse} 
            onSave={handleSaveCourse} 
            onCancel={() => setActiveTab('courses')}
            onSwitchToAI={() => setActiveTab('importer')}
          />
        ) : null}
      </div>
    </div>
  );
}
