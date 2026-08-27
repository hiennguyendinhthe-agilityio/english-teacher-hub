import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Trash2, Calendar, Loader2, Sparkles, Plus } from 'lucide-react';
import { plannerService } from '../services/plannerService';

export default function TeacherPlanner() {
  const { t, lang } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  
  // States cho Mini-Login / Register
  const [token, setToken] = useState(localStorage.getItem('teacher_token'));
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [isWsConnected, setIsWsConnected] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  // WebSocket Connection Effect
  useEffect(() => {
    if (!token) return;

    // Lấy Base URL và chuyển HTTP sang WS
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/tasks?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket Connected to Collaborative Planner');
      setIsWsConnected(true);
    };

    socket.onmessage = (event) => {
      if (event.data === 'REFRESH_TASKS') {
        console.log('🔄 Nhận tín hiệu làm mới từ Backend, đang đồng bộ dữ liệu...');
        fetchTasks();
      }
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsWsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const data = await plannerService.login(loginUsername, loginPassword);
      if (data && data.access_token) {
        localStorage.setItem('teacher_token', data.access_token);
        setToken(data.access_token);
      }
    } catch (err) {
      // Use translation if the error message is a known key, otherwise fallback
      setErrorMsg(t(err.message) || t('defaultLoginErr'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setErrorMsg(null);
    try {
      await plannerService.register(loginUsername, regFullName, loginPassword);
      // Đăng ký xong tự động chuyển về Form Đăng Nhập
      setIsRegisterMode(false);
      setLoginPassword(''); // Xóa mật khẩu cho an toàn, bắt nhập lại
      alert(t('successRegister'));
    } catch (err) {
      // Use translation if the error message is a known key, otherwise fallback
      setErrorMsg(t(err.message) || t('defaultRegErr'));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_token');
    setToken(null);
    setTasks([]);
  };

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await plannerService.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Lỗi khi tải tasks:', error);
      if (error.message.includes('401')) {
        handleLogout(); // Token hết hạn
      } else {
        setErrorMsg(
          lang === 'vi' 
          ? "Lỗi Backend: " + error.message
          : "Backend Error: " + error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      // Gửi API tạo mới Task
      const newTask = {
        title: newTaskTitle,
        description: "",
        completed: false
      };
      
      const createdTask = await plannerService.createTask(newTask);
      // Backend (FastAPI) có thể trả về object vừa tạo có kèm ID
      if (createdTask) {
        setTasks([createdTask, ...tasks]);
      } else {
        // Fallback tự fetch lại
        fetchTasks();
      }
      setNewTaskTitle('');
      setErrorMsg(null);
    } catch (error) {
      console.error('Lỗi khi tạo task:', error);
      setErrorMsg(lang === 'vi' ? "Lỗi khi lưu dữ liệu. Backend từ chối kết nối." : "Error saving data. Backend refused connection.");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedData = { completed: !task.completed };
      await plannerService.updateTask(task.id, updatedData);
      
      // Update local state for fast UI
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !task.completed } : t));
    } catch (error) {
      console.error('Lỗi cập nhật task:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await plannerService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Lỗi xóa task:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await plannerService.sendSummaryEmail();
      // Hiển thị ngay lập tức (Không bị block 5 giây)
      alert(lang === 'vi' 
        ? `Thành công! ${response.message || 'Hệ thống đang gửi báo cáo ngầm.'}`
        : `Success! ${response.message || 'System is sending the report in background.'}`
      );
    } catch (error) {
      console.error('Lỗi khi lên lịch gửi Email:', error);
      alert(lang === 'vi' ? 'Lỗi khi yêu cầu gửi email.' : 'Error requesting email sending.');
    }
  };
  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              {lang === 'vi' ? 'Sổ Tay Giáo Viên' : 'Teacher Planner'}
            </h1>
            {token && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${isWsConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isWsConnected ? 'Live' : 'Disconnected'}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {lang === 'vi' 
              ? 'Trình quản lý công việc bảo mật bằng Python FastAPI & JWT' 
              : 'Secure task manager built with Python FastAPI & JWT'}
          </p>
        </div>
        {token && (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl font-medium transition-colors"
            >
              <Sparkles size={18} />
              {lang === 'vi' ? 'Gửi báo cáo ngầm' : 'Background Email'}
            </button>
            <Button variant="outline" onClick={handleLogout} className="border-pink-200 text-pink-600 hover:bg-pink-50">
              {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* NẾU CHƯA CÓ TOKEN -> HIỂN THỊ FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
      {!token ? (
        <div className="max-w-md mx-auto mt-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-xl shadow-pink-500/5 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              {isRegisterMode ? (
                <Sparkles className="w-8 h-8 text-pink-500" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-pink-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {isRegisterMode 
                ? (lang === 'vi' ? 'Đăng Ký Tài Khoản' : 'Register Account')
                : (lang === 'vi' ? 'Đăng Nhập Quản Trị' : 'Admin Login')}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isRegisterMode 
                ? (lang === 'vi' ? 'Tạo tài khoản mới lưu vào SQLite' : 'Create a new account in SQLite')
                : (lang === 'vi' ? 'Sử dụng tài khoản Python SQLite' : 'Use Python SQLite account')}
            </p>
          </div>
          
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <input
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>
            
            {isRegisterMode && (
              <div>
                <input
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={lang === 'vi' ? 'Họ và tên' : 'Full Name'}
                  className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isRegisterMode ? isRegistering : isLoggingIn}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold shadow-lg transition-all"
            >
              {isRegisterMode 
                ? (isRegistering ? 'Đang tạo...' : (lang === 'vi' ? 'Tạo Tài Khoản' : 'Create Account'))
                : (isLoggingIn ? 'Đang xác thực...' : (lang === 'vi' ? 'Lấy Token JWT' : 'Get JWT Token'))}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegisterMode ? (
              <p>
                {lang === 'vi' ? 'Đã có tài khoản? ' : 'Already have an account? '}
                <button onClick={() => { setIsRegisterMode(false); setErrorMsg(null); }} className="text-pink-500 font-medium hover:underline">
                  {lang === 'vi' ? 'Đăng nhập' : 'Login'}
                </button>
              </p>
            ) : (
              <p>
                {lang === 'vi' ? 'Chưa có tài khoản? ' : 'Don\'t have an account? '}
                <button onClick={() => { setIsRegisterMode(true); setErrorMsg(null); }} className="text-pink-500 font-medium hover:underline">
                  {lang === 'vi' ? 'Đăng ký ngay' : 'Register now'}
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* NẾU ĐÃ CÓ TOKEN -> HIỂN THỊ GIAO DIỆN SỔ TAY BÌNH THƯỜNG */
        <>
          {/* Form Add Task */}
          <div className="mb-8 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-xl shadow-pink-500/5">
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={lang === 'vi' ? 'Nhập công việc mới... (VD: Chấm bài lớp 10A1)' : 'Enter new task...'}
                className="flex-1 text-lg h-14 px-4 rounded-xl bg-white dark:bg-slate-950 border border-pink-300 dark:border-pink-800 focus:outline-none focus:border-pink-500"
              />
              <button 
                type="submit" 
                disabled={!newTaskTitle.trim() || loading}
                className="h-14 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 rounded-xl shadow-lg transition-all shrink-0 text-lg font-semibold disabled:opacity-50"
              >
                <Plus size={24} className="mr-2" />
                {lang === 'vi' ? 'Thêm' : 'Add'}
              </button>
            </form>
          </div>

      {/* Task List */}
      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-pink-500">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-lg font-medium">{lang === 'vi' ? 'Đang kết nối FastAPI...' : 'Connecting to FastAPI...'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, idx) => (
            <div 
              key={task.id || idx} 
              className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                task.completed 
                ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60' 
                : 'bg-white dark:bg-slate-950 border-pink-100 dark:border-pink-900/50 shadow-md hover:shadow-lg hover:border-pink-300'
              }`}
              style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => handleToggleComplete(task)}
                  className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-pink-400'}`}
                >
                  {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                <span className={`text-lg font-medium transition-all ${task.completed ? 'line-through text-slate-500' : 'text-foreground'}`}>
                  {task.title}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all h-10 w-10 rounded-full shrink-0 ml-4"
              >
                <Trash2 size={20} />
              </Button>
            </div>
          ))}

          {!loading && tasks.length === 0 && !errorMsg && (
            <div className="text-center py-16 px-4 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                {lang === 'vi' ? 'Sổ tay đang trống!' : 'Planner is empty!'}
              </h3>
              <p className="text-slate-500">
                {lang === 'vi' ? 'Hãy viết API POST /tasks trong Python để bắt đầu thêm công việc nhé.' : 'Implement POST /tasks in Python to start adding tasks.'}
              </p>
            </div>
          )}
        </div>
      )}
      </>
    )}
  </div>
);
}
