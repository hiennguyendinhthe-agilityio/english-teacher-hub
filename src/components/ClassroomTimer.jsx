import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, X, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { soundFX } from '../services/soundEffects';

export default function ClassroomTimer({ onClose, isFloating = false }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('timer'); // 'timer' | 'stopwatch'
  const [initialSeconds, setInitialSeconds] = useState(300); // 5 mins
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);

  const presets = [
    { label: '1m', sec: 60 },
    { label: '2m', sec: 120 },
    { label: '3m', sec: 180 },
    { label: '5m', sec: 300 },
    { label: '10m', sec: 600 },
    { label: '15m', sec: 900 },
  ];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === 'timer') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              if (!isMuted) soundFX.playTimerAlarm();
              return 0;
            }
            return prev - 1;
          });
        } else {
          // Stopwatch counts up
          setSecondsLeft((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, isMuted]);

  const handleSelectPreset = (sec) => {
    setIsRunning(false);
    setInitialSeconds(sec);
    setSecondsLeft(sec);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'timer') {
      setSecondsLeft(initialSeconds);
    } else {
      setSecondsLeft(0);
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = mode === 'timer' && initialSeconds > 0
    ? ((initialSeconds - secondsLeft) / initialSeconds) * 100
    : 0;

  const isFinished = mode === 'timer' && secondsLeft === 0;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 cursor-pointer animate-in zoom-in-95 hover:scale-105 transition-all border-2 border-indigo-300/40"
      >
        <Timer size={20} className={isRunning ? "animate-spin" : ""} />
        <span className="font-mono font-bold text-lg">{formatTime(secondsLeft)}</span>
        <Maximize2 size={16} className="opacity-80" />
      </div>
    );
  }

  return (
    <div className={`bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-2xl p-5 ${
      isFloating ? 'fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-6' : 'w-full'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-400">
          <Timer size={20} />
          <span>{t('ctTitle')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMuted(!isMuted)} 
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          {isFloating && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Minimize2 size={16} />
              </Button>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-secondary/50 rounded-xl mb-4 text-xs font-semibold">
        <button
          onClick={() => { setMode('timer'); handleReset(); }}
          className={`py-1.5 rounded-lg transition-all ${
            mode === 'timer' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('ctCountdown')}
        </button>
        <button
          onClick={() => { setMode('stopwatch'); setSecondsLeft(0); setIsRunning(false); }}
          className={`py-1.5 rounded-lg transition-all ${
            mode === 'stopwatch' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('ctStopwatch')}
        </button>
      </div>

      {/* Main Display */}
      <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl mb-4 transition-all duration-500 border ${
        isFinished 
          ? 'bg-red-50 dark:bg-red-950/30 border-red-300 animate-pulse'
          : isRunning 
          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40' 
          : 'bg-secondary/30 border-border/40'
      }`}>
        <div className={`font-mono text-5xl sm:text-6xl font-black tracking-tight ${
          isFinished ? 'text-red-600 dark:text-red-400' : 'text-foreground'
        }`}>
          {formatTime(secondsLeft)}
        </div>
        {isFinished && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mt-2">
            <Bell size={14} className="animate-bounce" /> {t('ctTimeUp')}
          </div>
        )}
      </div>

      {/* Presets (Only in Timer mode) */}
      {mode === 'timer' && (
        <div className="flex items-center justify-between gap-1 mb-4 overflow-x-auto pb-1">
          {presets.map((p) => (
            <Button
              key={p.sec}
              variant={initialSeconds === p.sec ? "default" : "outline"}
              size="sm"
              onClick={() => handleSelectPreset(p.sec)}
              className={`text-xs px-2.5 h-7 rounded-lg font-semibold ${
                initialSeconds === p.sec ? 'bg-indigo-600 text-white' : 'border-border/60 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 h-11 rounded-xl font-bold gap-2 text-white shadow-lg ${
            isRunning 
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
          }`}
        >
          {isRunning ? <><Pause size={18} /> {t('ctPause')}</> : <><Play size={18} /> {t('ctStart')}</>}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-11 w-11 p-0 rounded-xl border-border/60 hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
          title="Reset"
        >
          <RotateCcw size={18} />
        </Button>
      </div>
    </div>
  );
}
