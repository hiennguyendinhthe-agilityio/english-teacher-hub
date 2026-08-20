import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, GraduationCap, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '@/lib/utils';

export default function SplashScreen({ onFinish = () => {} }) {
  const { t, isEn } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if splash has already played in this browser session
    const hasShown = sessionStorage.getItem('msvan_splash_shown');
    if (hasShown) {
      setIsVisible(false);
      onFinish();
      return;
    }

    // Progress bar animation simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate near end
        const increment = prev < 70 ? 12 : 20;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    // Fade out after 1.8 seconds
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('msvan_splash_shown', 'true');
        onFinish();
      }, 500);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('msvan_splash_shown', 'true');
      onFinish();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      className={cn(
        "fixed inset-0 z-[500] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-zinc-950 text-white select-none cursor-pointer overflow-hidden transition-all duration-500",
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      )}
    >
      {/* Dynamic Background Ambient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

      {/* Main Animated Logo Card */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-sm w-full animate-in zoom-in-90 fade-in duration-700">
        {/* Glowing Logo Icon Container */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-2xl flex items-center justify-center border border-white/20">
            <div className="w-full h-full rounded-[22px] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
              <BookOpen size={48} className="text-white drop-shadow-md animate-bounce-subtle" />
            </div>
            
            {/* Corner Floating Star Badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg animate-spin-slow">
              <Sparkles size={16} />
            </div>
          </div>
        </div>

        {/* Brand Titles */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-pink-200 mb-2 drop-shadow-sm">
          {t('brandName')}
        </h1>
        
        <p className="text-xs sm:text-sm text-indigo-200/80 font-medium tracking-wide mb-8 max-w-xs flex items-center justify-center gap-1.5">
          <GraduationCap size={16} className="text-pink-400 shrink-0" />
          <span>{t('splashSubtitle')}</span>
        </p>

        {/* Sleek Progress Loading Bar */}
        <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 p-0.5 backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 rounded-full transition-all duration-150 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Small Tap to Skip Hint */}
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
          {t('splashSkip')}
        </span>
      </div>
    </div>
  );
}
