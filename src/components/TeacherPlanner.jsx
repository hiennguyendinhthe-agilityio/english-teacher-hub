import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2, Loader2, Sparkles, Plus, Wifi, WifiOff, LogOut, BookOpen } from 'lucide-react';
import { plannerService } from '../services/plannerService';
import { jwtDecode } from 'jwt-decode';

// Skeleton loader for tasks while fetching
function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 animate-pulse">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function TeacherPlanner() {
  const { t, lang } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  // Login / Register states
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
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (e) {
        console.error('Token decode error', e);
      }
      fetchTasks();
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, [token]);

  // WebSocket — fix: use onrender fallback instead of localhost
  useEffect(() => {
    if (!token) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://english-teacher-hub.onrender.com/api/v1';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/tasks?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => setIsWsConnected(true);
    socket.onmessage = (event) => { if (event.data === 'REFRESH_TASKS') fetchTasks(); };
    socket.onclose = () => setIsWsConnected(false);
    socket.onerror = () => setIsWsConnected(false);
    return () => socket.close();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const data = await plannerService.login(loginUsername, loginPassword);
      if (data?.access_token) {
        localStorage.setItem('teacher_token', data.access_token);
        setToken(data.access_token);
      }
    } catch (err) {
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
      setIsRegisterMode(false);
      setLoginPassword('');
      alert(t('successRegister'));
    } catch (err) {
      setErrorMsg(t(err.message) || t('defaultRegErr'));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_token');
    setToken(null);
    setTasks([]);
    setUserRole(null);
  };

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await plannerService.getTasks();
      setTasks(data || []);
    } catch (error) {
      if (error.message.includes('401')) {
        handleLogout();
      } else {
        setErrorMsg(t('errNoConnection'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const createdTask = await plannerService.createTask({ title: newTaskTitle, description: '', completed: false });
      if (createdTask) {
        setTasks(prev => [createdTask, ...prev]);
        setNewlyAddedId(createdTask.id);
        setTimeout(() => setNewlyAddedId(null), 600);
      } else {
        fetchTasks();
      }
      setNewTaskTitle('');
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg(t('errNoConnection'));
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await plannerService.updateTask(task.id, { completed: !task.completed });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !task.completed } : t));
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await plannerService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-pink-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg shrink-0">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('teacherPlannerTitle')}</h1>
              <p className="text-sm text-slate-500">{t('teacherPlannerSubtitle')}</p>
            </div>
          </div>
          {token && (
            <div className="flex items-center gap-3">
              {/* WebSocket Status Badge */}
              <span className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${isWsConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                {isWsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isWsConnected ? t('wsConnected') : t('wsDisconnected')}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{t('logoutBtn')}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── LOGIN / REGISTER FORM ── */}
        {!token ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-pink-500/10 p-8 border border-pink-100 dark:border-pink-900/30 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BookOpen size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {isRegisterMode ? t('registerTitle') : t('loginTitle')}
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                {isRegisterMode ? t('registerSubtitle') : t('loginSubtitle')}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t('loginUsernameLabel')}</label>
                <input
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  required
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t('registerFullNameLabel')}</label>
                  <input
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={t('registerFullNameLabel')}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">{t('loginPasswordLabel')}</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isRegisterMode ? isRegistering : isLoggingIn}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
              >
                {(isLoggingIn || isRegistering) && <Loader2 size={18} className="animate-spin" />}
                {isRegisterMode
                  ? (isRegistering ? t('registerLoading') : t('registerBtn'))
                  : (isLoggingIn ? t('loginLoading') : t('loginBtn'))}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {isRegisterMode ? (
                <p>{t('switchToLogin')} <button onClick={() => { setIsRegisterMode(false); setErrorMsg(null); }} className="text-pink-500 font-medium hover:underline">{t('switchToLoginLink')}</button></p>
              ) : (
                <p>{t('switchToRegister')} <button onClick={() => { setIsRegisterMode(true); setErrorMsg(null); }} className="text-pink-500 font-medium hover:underline">{t('switchToRegisterLink')}</button></p>
              )}
            </div>
          </div>

        ) : (
          /* ── PLANNER MAIN UI ── */
          <>
            {/* Add Task Form */}
            <div className="mb-8 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-pink-500/10 border border-white dark:border-slate-800">
              <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={t('addTaskPlaceholder')}
                  className="flex-1 text-lg h-14 px-5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-pink-100 dark:border-pink-900/40 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/20 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim() || loading}
                  className="h-14 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-2xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all shrink-0 text-lg font-bold gap-2 active:scale-95"
                >
                  <Plus size={24} />
                  {t('addTaskBtn')}
                </button>
              </form>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            {/* Task List */}
            {loading ? (
              <TaskSkeleton />
            ) : tasks.length === 0 && !errorMsg ? (
              <div className="text-center py-16 px-4 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-pink-200 dark:border-pink-900/40">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('emptyPlannerTitle')}</h3>
                <p className="text-slate-500 text-sm">{t('emptyPlannerDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-950 border-pink-100 dark:border-pink-900/40 shadow-md hover:shadow-lg hover:border-pink-300 dark:hover:border-pink-700'
                    } ${newlyAddedId === task.id ? 'ring-2 ring-pink-400 ring-offset-2' : ''}`}
                    style={{ animation: `fadeInDown 0.3s ease-out ${idx * 0.04}s both` }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-pink-400'}`}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                      </button>
                      <span className={`text-base font-medium truncate transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </span>
                    </div>

                    {/* Delete — always visible on mobile, hover on desktop */}
                    
                      <button
                        onClick={() => handleDelete(task.id)}
                        title={t('deleteTaskTooltip')}
                        className="ml-3 shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all sm:opacity-40 sm:hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
