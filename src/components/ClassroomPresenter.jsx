import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, Minimize2, ChevronLeft, ChevronRight, Volume2, 
  RotateCw, Sparkles, X, Sun, Timer, Eye, EyeOff, Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassroomTimer from './ClassroomTimer';
import { soundFX } from '../services/soundEffects';
import { cn } from '@/lib/utils';

export default function ClassroomPresenter({ lessonData, onExit }) {
  const { t } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [showTimer, setShowTimer] = useState(false);
  const containerRef = useRef(null);

  // Build slide list from lessonData:
  // 1. Title Slide
  // 2. Vocabulary Slides (1 word per slide)
  // 3. Grammar Slides (1 section per slide)
  const slides = [];

  // Title Slide
  slides.push({
    type: 'title',
    title: lessonData.title,
    subtitle: 'Interactive Classroom Lesson & Presentation',
    vocabCount: lessonData.vocabulary?.length || 0,
    grammarCount: lessonData.grammar?.length || 0,
  });

  // Vocabulary Slides
  (lessonData.vocabulary || []).forEach((v, idx) => {
    slides.push({
      type: 'vocab',
      data: v,
      index: idx + 1,
      total: lessonData.vocabulary.length,
    });
  });

  // Grammar Slides
  (lessonData.grammar || []).forEach((g, gIdx) => {
    (g.sections || []).forEach((sec, sIdx) => {
      slides.push({
        type: 'grammar',
        groupTitle: g.title,
        sectionTitle: sec.subtitle,
        points: sec.points || [],
        formulas: sec.formulas || [],
        tags: sec.tags || [],
      });
    });
  });

  const currentSlide = slides[slideIndex] || slides[0];

  // Reset flip on slide change
  useEffect(() => {
    setIsFlipped(false);
  }, [slideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goPrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space / Enter flips card if on vocab slide, otherwise goes next
        if (currentSlide.type === 'vocab') {
          setIsFlipped(f => !f);
          soundFX.playFlip();
        } else {
          goNext();
        }
      } else if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'l' || e.key === 'L') {
        setLaserActive(prev => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        setShowTimer(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideIndex, currentSlide]);

  const goNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(i => i + 1);
      soundFX.playFlip();
    }
  };

  const goPrev = () => {
    if (slideIndex > 0) {
      setSlideIndex(i => i - 1);
      soundFX.playFlip();
    }
  };

  const handleMouseMove = (e) => {
    if (laserActive) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const speakCurrentWord = (e) => {
    e?.stopPropagation();
    if (currentSlide.type === 'vocab' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentSlide.data.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between select-none overflow-hidden"
      style={{ cursor: laserActive ? 'none' : 'default' }}
    >
      {/* Laser Pointer Dot */}
      {laserActive && (
        <div 
          className="fixed pointer-events-none z-[100] w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_20px_6px_rgba(239,68,68,0.8)] border border-white animate-pulse"
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      )}

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center gap-4">
          <Badge className="bg-indigo-600/80 text-white border-0 text-sm px-3.5 py-1">
            {t('cpTitleBadge')}
          </Badge>
          <span className="text-slate-400 font-medium text-sm hidden md:inline">
            {lessonData.title}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLaserActive(!laserActive)}
            className={cn(
              "rounded-xl border-slate-700 font-semibold gap-1.5 transition-all text-xs h-9 px-3",
              laserActive 
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/30" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            )}
            title="Laser [L]"
          >
            <Radio size={14} /> {t('cpLaserBtn')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimer(!showTimer)}
            className={cn(
              "rounded-xl border-slate-700 font-semibold gap-1.5 transition-all text-xs h-9 px-3",
              showTimer ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            )}
            title="Timer [T]"
          >
            <Timer size={14} /> {t('cpTimerBtn')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="rounded-full w-9 h-9 p-0 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300"
            title={t('cpExitBtn')}
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Floating Timer Widget if open */}
      {showTimer && (
        <ClassroomTimer isFloating={true} onClose={() => setShowTimer(false)} />
      )}

      {/* Main Slide Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        {/* 1. TITLE SLIDE */}
        {currentSlide.type === 'title' && (
          <div className="text-center max-w-4xl animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Sparkles size={16} /> Ready for Interactive Classroom Presentation
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 mb-6 tracking-tight leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light">
              {currentSlide.subtitle}
            </p>
            <div className="flex justify-center gap-6">
              <div className="bg-slate-900/80 border border-slate-800 px-8 py-5 rounded-2xl">
                <div className="text-3xl font-black text-indigo-400">{currentSlide.vocabCount}</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Từ Vựng</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 px-8 py-5 rounded-2xl">
                <div className="text-3xl font-black text-purple-400">{currentSlide.grammarCount}</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Chủ Điểm Ngữ Pháp</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-10">
              Nhấn phím <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300">Space</kbd> hoặc <kbd className="bg-slate-800 px-2 py-1 rounded text-slate-300">→</kbd> để bắt đầu bài giảng
            </p>
          </div>
        )}

        {/* 2. VOCABULARY SLIDE */}
        {currentSlide.type === 'vocab' && (
          <div 
            onClick={() => { setIsFlipped(!isFlipped); soundFX.playFlip(); }}
            className="w-full max-w-4xl h-[420px] sm:h-[480px] [perspective:1200px] cursor-pointer"
          >
            <div 
              className="relative w-full h-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] shadow-2xl"
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
            >
              {/* FRONT (English) */}
              <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center shadow-2xl text-center">
                <div className="absolute top-6 left-8 flex items-center gap-3">
                  <Badge className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-sm px-3 py-1 font-mono">
                    Vocab #{currentSlide.index}
                  </Badge>
                  <Badge variant="outline" className="text-slate-400 border-slate-700 text-sm">
                    {currentSlide.data.type}
                  </Badge>
                </div>

                <div className="absolute top-6 right-8 text-xs text-slate-400 flex items-center gap-1.5">
                  {t('cpFlipHint')} <RotateCw size={13} />
                </div>

                {/* Big Word */}
                <h2 className="text-6xl sm:text-8xl font-black tracking-tight text-white mb-4 drop-shadow-md">
                  {currentSlide.data.word}
                </h2>

                {/* Phonetics */}
                <p className="text-2xl sm:text-3xl text-indigo-400 font-serif italic mb-8">
                  {currentSlide.data.transcription}
                </p>

                {/* Pronounce Button */}
                <Button
                  onClick={speakCurrentWord}
                  size="lg"
                  className="rounded-full px-8 h-14 text-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all"
                >
                  <Volume2 size={22} className="mr-2" /> {t('cpListenAudio')}
                </Button>

                <p className="absolute bottom-6 text-xs text-slate-500">
                  Space / Enter: {t('cpFlipHint')} · Arrows: {t('cpNextSlide')}
                </p>
              </div>

              {/* BACK (Vietnamese Meaning) */}
              <div 
                className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center shadow-2xl text-center [transform:rotateY(180deg)] border-2 border-white/20"
              >
                <div className="text-5xl mb-4">🇻🇳</div>
                <span className="text-xs uppercase tracking-[0.25em] text-white/80 font-bold mb-4">
                  {t('cpVietnameseMeaning')}
                </span>
                <h3 className="text-4xl sm:text-6xl font-black text-white mb-6 drop-shadow-lg leading-tight">
                  {currentSlide.data.meaning}
                </h3>
                <div className="bg-black/20 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/15">
                  <span className="font-mono text-lg text-white/90 font-bold">{currentSlide.data.word}</span>
                  <span className="text-white/70 text-base ml-2">({currentSlide.data.type})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GRAMMAR SLIDE */}
        {currentSlide.type === 'grammar' && (
          <div className="w-full max-w-5xl bg-slate-900/90 border-2 border-purple-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-500/30 text-purple-300 border border-purple-500/40 text-sm px-3 py-1">
                {t('ilGrammarTitle')}
              </Badge>
              <span className="text-sm font-semibold text-slate-400">{currentSlide.groupTitle}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-8 border-b border-slate-800 pb-4">
              {currentSlide.sectionTitle}
            </h2>

            {/* Bullet points */}
            {currentSlide.points.length > 0 && (
              <ul className="space-y-4 text-lg sm:text-2xl text-slate-200 mb-8 list-disc pl-6 leading-relaxed">
                {currentSlide.points.map((pt, pIdx) => (
                  <li key={pIdx}>{pt}</li>
                ))}
              </ul>
            )}

            {/* Formulas */}
            {currentSlide.formulas.length > 0 && (
              <div className="space-y-3 mb-6">
                {currentSlide.formulas.map((f, fIdx) => (
                  <div key={fIdx} className="bg-purple-950/40 border-l-4 border-purple-400 p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-bold text-purple-300 min-w-[160px] text-lg">{f.type}:</span>
                    <code className="font-mono text-xl text-amber-300 font-black">{f.text}</code>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {currentSlide.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                {currentSlide.tags.map((tag, tIdx) => (
                  <Badge key={tIdx} variant="secondary" className="bg-slate-800 text-purple-300 text-sm px-3 py-1 font-mono">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={slideIndex === 0}
            className="rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold gap-1.5 h-11 px-5"
          >
            <ChevronLeft size={18} /> {t('cpPrevSlide')}
          </Button>
        </div>

        {/* Progress Bar & Slide Index */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-bold text-slate-300">
            {t('cpSlideLabel')} <span className="text-indigo-400 font-mono text-base">{slideIndex + 1}</span> / {slides.length}
          </div>
          <div className="w-48 sm:w-80 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${((slideIndex + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={goNext}
            disabled={slideIndex === slides.length - 1}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-1.5 h-11 px-6 shadow-lg shadow-indigo-600/30"
          >
            {t('cpNextSlide')} <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
