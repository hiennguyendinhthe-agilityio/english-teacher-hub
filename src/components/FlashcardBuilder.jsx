import React, { useState, useEffect, useRef } from 'react';
import { BookMarked, Volume2, RotateCw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { unit1Data } from '../data/unit1_data';
import { unit2Data } from '../data/unit2_data';
import { unit3Data } from '../data/unit3_data';
import { unit4Data } from '../data/unit4_data';
import { unit5Data } from '../data/unit5_data';

const UNIT_MAP = {
  'Unit 1: MY NEW SCHOOL': unit1Data,
  'Unit 2: MY HOUSE': unit2Data,
  'Unit 3: MY FRIENDS': unit3Data,
  'Unit 4: MY NEIGHBOURHOOD': unit4Data,
  'Unit 5: NATURAL WONDERS OF VIETNAM': unit5Data,
};

function toFlashcards(vocab) {
  return vocab.map((v) => ({
    word: v.word,
    ipa: v.transcription || '',
    partOfSpeech: v.type || '',
    meaning: v.meaning || '',
  }));
}

const SWIPE_THRESHOLD = 70;

// Individual swipeable card
function SwipeCard({ card, isTop, stackIndex, onSwipeLeft, onSwipeRight, t, language }) {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flyOut, setFlyOut] = useState(null); // 'left' | 'right' | null
  const dragStart = useRef(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => { 
    setIsFlipped(false); 
    setFlyOut(null);
    setDragX(0);
    setDragY(0);
    setIsDragging(false);
    hasDraggedRef.current = false;
  }, [card]);

  const tiltDeg = Math.min(Math.max(dragX / 12, -20), 20);

  const onPointerDown = (e) => {
    if (!isTop || flyOut) return;
    if (e.button !== undefined && e.button !== 0) return;
    
    hasDraggedRef.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const onPointerMove = (e) => {
    if (!isDragging || !dragStart.current || flyOut) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasDraggedRef.current = true;
    }
    setDragX(dx);
    setDragY(dy);
  };

  const onPointerUp = (e) => {
    if (!isDragging || !dragStart.current) return;
    setIsDragging(false);

    const dx = dragX;
    const dt = Date.now() - dragStart.current.time;
    const velocity = Math.abs(dx) / (dt || 1); // px per ms

    // Quick swipe flick (velocity > 0.45 and moved > 35px) OR full swipe displacement (> SWIPE_THRESHOLD)
    const isQuickFlick = velocity > 0.45 && Math.abs(dx) > 35;
    const isFullSwipe = Math.abs(dx) >= SWIPE_THRESHOLD;

    if (isFullSwipe || isQuickFlick) {
      if (dx < 0) {
        triggerFlyOut('left');
      } else {
        triggerFlyOut('right');
      }
    } else {
      setDragX(0);
      setDragY(0);
    }

    try {
      if (e?.currentTarget && e?.pointerId !== undefined) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}

    dragStart.current = null;
  };

  const onPointerCancel = (e) => {
    setIsDragging(false);
    setDragX(0);
    setDragY(0);
    dragStart.current = null;
    hasDraggedRef.current = false;
    try {
      if (e?.currentTarget && e?.pointerId !== undefined) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
  };

  const triggerFlyOut = (dir) => {
    setFlyOut(dir);
    setTimeout(() => {
      if (dir === 'left') onSwipeLeft();
      else onSwipeRight();
    }, 350);
  };

  const handleCardClick = () => {
    if (!isTop || hasDraggedRef.current || flyOut) return;
    setIsFlipped(f => !f);
  };

  const handleSpeak = (e) => {
    // Stop BOTH pointer and click propagation so drag/flip doesn't fire
    e.stopPropagation();
    e.preventDefault();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Stack offset for cards behind
  const stackScale = 1 - stackIndex * 0.05;
  const stackTranslateY = stackIndex * -12;

  let cardStyle = {};
  if (isTop) {
    if (flyOut === 'left') {
      cardStyle = {
        transform: `translateX(-140%) rotate(-30deg)`,
        transition: 'transform 0.35s cubic-bezier(0.5, 0, 1, 0.5), opacity 0.35s',
        opacity: 0,
        pointerEvents: 'none',
      };
    } else if (flyOut === 'right') {
      cardStyle = {
        transform: `translateX(140%) rotate(30deg)`,
        transition: 'transform 0.35s cubic-bezier(0.5, 0, 1, 0.5), opacity 0.35s',
        opacity: 0,
        pointerEvents: 'none',
      };
    } else if (isDragging) {
      cardStyle = {
        transform: `translateX(${dragX}px) translateY(${dragY * 0.3}px) rotate(${tiltDeg}deg)`,
        transition: 'none',
        cursor: 'grabbing',
        zIndex: 50,
      };
    } else {
      cardStyle = {
        transform: `translateX(0) rotate(0deg)`,
        transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        cursor: 'grab',
        zIndex: 50,
      };
    }
  } else {
    const progress = isDragging ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0;
    const scale = stackScale + progress * 0.05;
    const ty = stackTranslateY + progress * 12;
    cardStyle = {
      transform: `scale(${scale}) translateY(${ty}px)`,
      transition: isDragging ? 'transform 0.1s' : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      zIndex: 50 - stackIndex * 10,
      pointerEvents: 'none',
    };
  }

  const swipeLeft = isTop && !flyOut && dragX < -35;
  const swipeRight = isTop && !flyOut && dragX > 35;

  return (
    <div
      className={cn(
        "absolute w-full h-full [perspective:1200px] select-none touch-none",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      )}
      style={cardStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={handleCardClick}
    >
      {/* Swipe indicator stamps */}
      {isTop && (
        <>
          <div className={cn(
            "absolute top-6 left-6 z-20 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-2xl font-bold text-lg border-4 border-red-300 shadow-lg rotate-[-10deg] transition-all duration-100 pointer-events-none select-none",
            swipeLeft ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <X size={20} /> {t('fcSkip')}
          </div>
          <div className={cn(
            "absolute top-6 right-6 z-20 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-bold text-lg border-4 border-emerald-300 shadow-lg rotate-[10deg] transition-all duration-100 pointer-events-none select-none",
            swipeRight ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <Check size={20} /> {t('fcGotIt')}
          </div>
        </>
      )}

      {/* 3D flip container */}
      <div
        className="relative w-full h-full [transform-style:preserve-3d]"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* ── FRONT FACE ── */}
        <div className={cn(
          "absolute w-full h-full [backface-visibility:hidden] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8",
          "bg-white dark:bg-zinc-900 border-2",
          isTop ? "border-pink-200/70 dark:border-pink-800/40" : "border-border/30"
        )}>
          <div className="absolute top-5 left-5 right-5 flex justify-between items-center pointer-events-none">
            <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800">
              {card.partOfSpeech}
            </Badge>
            <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
              {t('fcClickFlip')} <RotateCw size={11} />
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl text-foreground font-extrabold tracking-tight mb-3 text-center leading-tight pointer-events-none select-none">
            {card.word}
          </h2>

          <p className="text-xl text-pink-500 dark:text-pink-400 font-serif italic mb-8 pointer-events-none select-none">
            {card.ipa}
          </p>

          {/* Speak button — must stop ALL propagation to avoid triggering drag/flip */}
          <Button
            variant="outline"
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={handleSpeak}
            className="rounded-full px-6 h-11 border-pink-200 text-pink-600 bg-pink-50 hover:bg-pink-100 hover:text-pink-700 shadow-sm dark:bg-pink-950/20 dark:border-pink-800 dark:text-pink-400 z-10 relative"
          >
            <Volume2 size={16} className="mr-2" /> {t('fcPronounce')}
          </Button>

          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-6 text-xs text-muted-foreground/40 pointer-events-none select-none">
            <span>{t('fcSwipeLeft')}</span>
            <span>·</span>
            <span>{t('fcSwipeRight')}</span>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div
          className="absolute w-full h-full [backface-visibility:hidden] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8"
          style={{ transform: 'rotateY(180deg)', background: 'linear-gradient(145deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)' }}
        >
          <div className="absolute top-5 right-5 text-xs text-white/60 flex items-center gap-1 pointer-events-none">
            {t('fcClickFlip')} <RotateCw size={11} />
          </div>

          <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-bold mb-3 select-none">
            {t('fcMeaningDef')}
          </span>

          <div className="text-6xl mb-4 select-none">
            {language === 'vi' ? '🇻🇳' : '🇬🇧'}
          </div>

          <h3 className="text-3xl md:text-4xl text-white font-extrabold text-center mb-3 drop-shadow-lg leading-tight select-none">
            {card.meaning}
          </h3>

          <p className="text-base text-white/80 font-mono mb-6 select-none">
            {card.ipa} · {card.partOfSpeech}
          </p>

          <div className="w-full bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <p className="text-sm text-white/80 text-center italic font-medium select-none">{card.word}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardBuilder() {
  const { t, language } = useLanguage();
  const [topic, setTopic] = useState('Unit 1: MY NEW SCHOOL');
  const [allCards, setAllCards] = useState(() => toFlashcards(unit1Data.vocabulary));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unitData = UNIT_MAP[topic];
    if (unitData) {
      setAllCards(toFlashcards(unitData.vocabulary));
      setCurrentIndex(0);
    }
  }, [topic]);

  const goNext = () => {
    if (currentIndex < allCards.length - 1) setCurrentIndex(i => i + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const VISIBLE = 3;
  const visibleCards = [];
  for (let i = 0; i < VISIBLE; i++) {
    const idx = currentIndex + i;
    if (idx < allCards.length) visibleCards.push({ card: allCards[idx], idx });
  }

  const progressPct = Math.round(((currentIndex + 1) / allCards.length) * 100);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2 text-foreground flex-wrap">
          <BookMarked className="text-pink-500 shrink-0" size={30} /> 
          <span>{t('fcTitle')}</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">{t('fcSub')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* ── Left Panel ── */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-pink-100 dark:border-pink-900/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-pink-700 dark:text-pink-400">{t('fcTopicLabel')}</CardTitle>
              <CardDescription>{t('fcTopicDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">{t('fcTopicLabel')}</Label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex h-12 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none bg-white dark:bg-background border-pink-200"
                >
                  {Object.keys(UNIT_MAP).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-foreground">{currentIndex + 1}</div>
                  <div className="text-xs text-muted-foreground">{t('fcCurrentCard')}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-foreground">{allCards.length}</div>
                  <div className="text-xs text-muted-foreground">{t('fcTotalCards')}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <div className="text-xl font-bold text-foreground">{allCards.length - currentIndex - 1}</div>
                  <div className="text-xs text-muted-foreground">{t('fcRemaining')}</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{t('fcProgress')}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-4 py-2.5 rounded-xl">
                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                    <X size={14} className="text-white" />
                  </div>
                  <span className="text-foreground/80">{t('fcSwipeLeft')}</span>
                </div>
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-4 py-2.5 rounded-xl">
                  <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="text-foreground/80">{t('fcSwipeRight')}</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-4 py-2.5 rounded-xl">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <RotateCw size={14} className="text-white" />
                  </div>
                  <span className="text-foreground/80">{t('fcClickFlip')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Word list */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                {t('fcWordDeck')} <Badge variant="secondary" className="ml-auto">{allCards.length} {t('fcDoneWord')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[300px] overflow-y-auto">
              {allCards.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl flex justify-between items-center transition-all mb-0.5",
                    idx === currentIndex
                      ? "bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50"
                      : idx < currentIndex
                      ? "opacity-40 hover:opacity-70"
                      : "bg-transparent hover:bg-secondary/50"
                  )}
                >
                  <span className={cn("font-medium text-sm", idx === currentIndex ? "text-pink-600 font-bold" : "text-foreground")}>
                    {idx < currentIndex && <span className="mr-1 text-emerald-500">✓</span>}
                    {c.word}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{c.ipa}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Card Stack Area ── */}
        <div className="xl:col-span-8 flex flex-col items-center justify-center min-h-[520px]">
          {currentIndex < allCards.length ? (
            <>
              {/* Card Stack */}
              <div className="relative w-full max-w-[340px] sm:max-w-md h-[390px] sm:h-[420px] select-none touch-none">
                {[...visibleCards].reverse().map(({ card, idx }, revI) => {
                  const stackIndex = visibleCards.length - 1 - revI;
                  const isTop = stackIndex === 0;
                  return (
                    <SwipeCard
                      key={idx}
                      card={card}
                      isTop={isTop}
                      stackIndex={stackIndex}
                      totalVisible={visibleCards.length}
                      onSwipeLeft={goNext}
                      onSwipeRight={goNext}
                      t={t}
                      language={language}
                    />
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="rounded-full w-14 h-14 p-0 border-2 border-border/60 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all shadow-sm"
                  title={t('fcPrevCard')}
                >
                  <ChevronLeft size={22} />
                </Button>

                <div className="flex flex-col items-center gap-1 min-w-[100px]">
                  <span className="text-2xl font-extrabold text-foreground">
                    {currentIndex + 1}
                    <span className="text-muted-foreground text-lg font-normal"> / {allCards.length}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{allCards[currentIndex]?.word}</span>
                </div>

                <Button
                  variant="outline"
                  onClick={goNext}
                  disabled={currentIndex >= allCards.length - 1}
                  className="rounded-full w-14 h-14 p-0 border-2 border-border/60 hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-all shadow-sm"
                  title={t('fcNextCard')}
                >
                  <ChevronRight size={22} />
                </Button>
              </div>

              {/* Tinder-style action buttons */}
              <div className="flex gap-6 mt-6">
                <Button
                  onClick={goNext}
                  className="rounded-full w-16 h-16 p-0 bg-white dark:bg-zinc-900 border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30 hover:-translate-y-1 transition-all"
                  title={t('fcSkip')}
                >
                  <X size={28} />
                </Button>
                <Button
                  onClick={goNext}
                  className="rounded-full w-16 h-16 p-0 bg-white dark:bg-zinc-900 border-2 border-emerald-300 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all"
                  title={t('fcGotIt')}
                >
                  <Check size={28} />
                </Button>
              </div>
            </>
          ) : (
            /* Completion screen */
            <Card className="flex flex-col items-center justify-center text-center p-16 w-full max-w-md min-h-[400px] bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-2 border-pink-200/50 dark:border-pink-800/30 shadow-xl rounded-3xl">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-extrabold text-foreground mb-3">{t('fcDoneTitle')}</h3>
              <p className="text-muted-foreground text-lg mb-8">
                {t('fcDoneDesc')} <strong className="text-foreground">{allCards.length} {t('fcDoneWord')}</strong>.
              </p>
              <Button
                onClick={() => setCurrentIndex(0)}
                className="rounded-full px-8 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
              >
                <RotateCw size={18} className="mr-2" /> {t('fcDoneRestart')}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
