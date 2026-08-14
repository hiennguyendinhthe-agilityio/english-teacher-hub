import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, RotateCcw, Trophy, Zap, Sparkles, Volume2, Flame, Play, Clock, Medal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { soundFX } from '../services/soundEffects';
import { cn } from '@/lib/utils';

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function VocabularyMatchingGame({ vocabulary = [], unitTitle = '' }) {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [incorrectPair, setIncorrectPair] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      const stored = localStorage.getItem(`match_best_${unitTitle}`);
      return stored ? parseFloat(stored) : null;
    } catch {
      return null;
    }
  });

  const timerRef = useRef(null);

  // Initialize a round (select up to 6 words)
  const setupGame = () => {
    if (!vocabulary || vocabulary.length === 0) return;

    // Pick 6 random vocab items
    const shuffledVocab = shuffleArray(vocabulary).slice(0, 6);

    const tilePairs = [];
    shuffledVocab.forEach((item, idx) => {
      // English tile
      tilePairs.push({
        id: `en-${idx}`,
        pairId: idx,
        text: item.word,
        type: 'en',
        ipa: item.transcription,
        pos: item.type,
      });
      // Vietnamese tile
      tilePairs.push({
        id: `vi-${idx}`,
        pairId: idx,
        text: item.meaning,
        type: 'vi',
      });
    });

    setCards(shuffleArray(tilePairs));
    setSelectedCards([]);
    setMatchedIds(new Set());
    setIncorrectPair([]);
    setElapsedTime(0);
    setCombo(0);
    setMaxCombo(0);
    setGameCompleted(false);
    setGameStarted(true);
    soundFX.playSuccess();
  };

  // Reset to Start Screen if vocabulary changes
  useEffect(() => {
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedCards([]);
    setMatchedIds(new Set());
    setElapsedTime(0);
    return () => clearInterval(timerRef.current);
  }, [vocabulary]);

  // Timer effect (Only ticks when gameStarted is TRUE and not completed)
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const startTime = Date.now() - elapsedTime * 1000;
      timerRef.current = setInterval(() => {
        setElapsedTime(parseFloat(((Date.now() - startTime) / 1000).toFixed(1)));
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameCompleted]);

  const handleCardClick = (card) => {
    if (gameCompleted || matchedIds.has(card.id) || selectedCards.some(c => c.id === card.id)) {
      return;
    }

    soundFX.playFlip();

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;

      // Must be 1 EN and 1 VI and have same pairId
      if (first.pairId === second.pairId && first.type !== second.type) {
        // MATCH!
        soundFX.playSuccess();
        const nextMatched = new Set(matchedIds);
        nextMatched.add(first.id);
        nextMatched.add(second.id);
        setMatchedIds(nextMatched);
        setSelectedCards([]);

        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        // Check if all matched
        if (nextMatched.size === cards.length) {
          setGameCompleted(true);
          soundFX.playVictory();

          // Save high score if better
          const finalTime = parseFloat(elapsedTime.toFixed(1));
          if (!bestScore || finalTime < bestScore) {
            setBestScore(finalTime);
            try {
              localStorage.setItem(`match_best_${unitTitle}`, String(finalTime));
            } catch (e) {
              console.warn(e);
            }
          }
        }
      } else {
        // WRONG MATCH!
        soundFX.playError();
        setIncorrectPair([first.id, second.id]);
        setCombo(0);
        setTimeout(() => {
          setSelectedCards([]);
          setIncorrectPair([]);
        }, 600);
      }
    }
  };

  const speakWord = (word, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* ── 1. PRE-GAME / START SCREEN (Prevents unwanted immediate timer start) ── */}
      {!gameStarted && !gameCompleted && (
        <Card className="bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/80 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-2 border-indigo-200/60 dark:border-indigo-800/40 rounded-3xl p-8 sm:p-14 text-center shadow-xl">
          <div className="max-w-xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/30">
              <Gamepad2 size={40} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              {t('mgReadyTitle')}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
              {t('mgReadyDesc')}
            </p>

            {/* Best Score Badge */}
            {bestScore && (
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-4 py-2 rounded-2xl text-sm font-bold mb-8">
                <Medal size={18} /> {t('mgBestScore')} {bestScore}s ⚡
              </div>
            )}

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={setupGame}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-lg px-10 h-14 rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-105 hover:-translate-y-0.5 transition-all gap-2"
              >
                <Play size={22} className="fill-white" /> {t('mgStartBtn')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── 2. ACTIVE GAME SCREEN ── */}
      {gameStarted && !gameCompleted && (
        <>
          {/* Header & Scoreboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/60 dark:bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2.5 text-foreground">
                <Gamepad2 className="text-indigo-600 dark:text-indigo-400" size={28} />
                {t('mgTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('mgSub')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer Display */}
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 px-4 py-2 rounded-xl">
                <Zap size={18} className="text-amber-500 fill-amber-500" />
                <span className="font-mono text-xl font-black text-indigo-700 dark:text-indigo-300">
                  {elapsedTime.toFixed(1)}s
                </span>
              </div>

              {/* Combo Multiplier */}
              {combo > 1 && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-3.5 py-2 rounded-xl text-sm shadow-md animate-bounce">
                  <Flame size={16} /> Combo x{combo}
                </div>
              )}

              <Button
                variant="outline"
                onClick={setupGame}
                className="rounded-xl border-border/60 hover:bg-secondary gap-2"
              >
                <RotateCcw size={16} /> {t('mgReplay')}
              </Button>
            </div>
          </div>

          {/* Main Game Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in zoom-in-95 duration-300">
            {cards.map((card) => {
              const isMatched = matchedIds.has(card.id);
              const isSelected = selectedCards.some((c) => c.id === card.id);
              const isIncorrect = incorrectPair.includes(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={cn(
                    "h-32 sm:h-36 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none relative border-2 shadow-sm",
                    isMatched
                      ? "opacity-0 pointer-events-none scale-75"
                      : isIncorrect
                      ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 animate-shake shadow-red-200"
                      : isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/30 scale-105"
                      : card.type === 'en'
                      ? "bg-white dark:bg-zinc-900 border-indigo-100 dark:border-indigo-900/60 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5"
                      : "bg-purple-50/40 dark:bg-zinc-900/60 border-purple-100 dark:border-purple-900/60 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  {/* Badge Tag */}
                  <div className="absolute top-2.5 left-3">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        isSelected ? "bg-white/20 text-white" : ""
                      )}
                    >
                      {card.type === 'en' ? 'EN' : 'VN'}
                    </Badge>
                  </div>

                  {/* Speak button for English cards */}
                  {card.type === 'en' && !isSelected && (
                    <button
                      onClick={(e) => speakWord(card.text, e)}
                      className="absolute top-2.5 right-3 text-muted-foreground hover:text-indigo-600 p-1 rounded-full hover:bg-secondary"
                      title={t('fcPronounce')}
                    >
                      <Volume2 size={14} />
                    </button>
                  )}

                  {/* Text */}
                  <span className={cn(
                    "font-bold leading-snug px-2",
                    card.type === 'en' ? "text-lg sm:text-xl" : "text-base sm:text-lg",
                    isSelected ? "text-white" : "text-foreground"
                  )}>
                    {card.text}
                  </span>

                  {/* IPA subtitle for English */}
                  {card.type === 'en' && card.ipa && (
                    <span className={cn(
                      "text-xs italic mt-1 font-serif",
                      isSelected ? "text-indigo-100" : "text-muted-foreground"
                    )}>
                      {card.ipa}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── 3. VICTORY SCREEN ── */}
      {gameCompleted && (
        <Card className="animate-in zoom-in-95 duration-500 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl overflow-hidden relative border-none">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
              <Trophy size={42} className="text-amber-300" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight drop-shadow-md">
              {t('mgVictoryTitle')}
            </h3>
            <p className="text-white/80 text-base mb-8">
              {t('mgVictorySub')} {unitTitle}.
            </p>

            {/* Stats Badge */}
            <div className="grid grid-cols-2 gap-4 bg-black/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
              <div>
                <div className="text-3xl font-black font-mono text-amber-300">{elapsedTime.toFixed(1)}s</div>
                <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mt-1">{t('mgTimeLabel')}</div>
              </div>
              <div>
                <div className="text-3xl font-black font-mono text-emerald-300">x{maxCombo || 1}</div>
                <div className="text-xs uppercase tracking-wider text-white/70 font-semibold mt-1">{t('mgComboLabel')}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={setupGame}
                size="lg"
                className="bg-white text-indigo-700 hover:bg-slate-100 font-bold rounded-xl px-8 h-12 shadow-xl hover:scale-105 transition-all"
              >
                <Sparkles size={18} className="mr-2" /> {t('mgNextRound')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
