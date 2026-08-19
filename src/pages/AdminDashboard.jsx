import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LogOut, BookOpen, Trash2, Edit, Plus, LayoutDashboard, Sparkles, Loader2, Eye, X } from 'lucide-react';
import AIImporter from '../components/AIImporter';
import CourseEditor from '../components/CourseEditor';
import InteractiveLesson from '../components/InteractiveLesson';

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
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
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này không?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        setCourses(courses.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Lỗi khi xóa bài học!");
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
      alert("✅ Lưu Khóa học thành công!");
      setActiveTab('courses');
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Lỗi khi lưu Khóa học!");
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
            <LayoutDashboard size={20} /> Quản lý bài học
          </button>
          <button 
            onClick={() => setActiveTab('importer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === 'importer' 
                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles size={20} /> AI Tạo bài học
          </button>
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} /> Đăng xuất
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
                <X size={18} /> Đóng Xem Trước
              </button>
            </div>
            <InteractiveLesson lessonData={previewCourse} onBack={() => setPreviewCourse(null)} />
          </div>
        ) : activeTab === 'courses' ? (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">Danh sách Khóa học</h1>
                <p className="text-muted-foreground">Quản lý toàn bộ dữ liệu đang có trên Firebase</p>
              </div>
              <button 
                onClick={() => handleOpenEditor(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
              >
                <Plus size={18} /> Thêm mới
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-medium">{t('adminLoading')}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-border/50 text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Tên bài học (Title)</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Thống kê</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
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
                          <span className="font-semibold">{course.vocabulary?.length || 0}</span> từ vựng
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => setPreviewCourse(course)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Xem trước"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditor(course)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground">
                          Không có bài học nào trên Firebase.
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
              <h1 className="text-3xl font-extrabold mb-2">AI Tạo Bài Học (Trực Tiếp Lên Firebase)</h1>
              <p className="text-muted-foreground">Các bài học tạo ra tại đây sẽ được lưu thẳng lên Đám mây để học sinh sử dụng.</p>
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
