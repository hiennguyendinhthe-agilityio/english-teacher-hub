import React, { useState } from 'react';
import { 
  Book, Volume2, PenTool, CheckCircle2, XCircle, ArrowLeft, 
  BookOpen, Tv, Gamepad2, Download, FileText, Timer as TimerIcon, 
  Sparkles, RotateCcw, Share2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassroomPresenter from './ClassroomPresenter';
import VocabularyMatchingGame from './VocabularyMatchingGame';
import ClassroomTimer from './ClassroomTimer';
import FlashcardBuilder from './FlashcardBuilder';
import { exportToAnkiCsv, exportLessonToWordDoc } from '../utils/exportUtils';
import { soundFX } from '../services/soundEffects';
import { getLocalizedLesson } from '../utils/lessonTranslator';
import { cn } from '@/lib/utils';

const cleanQuestionPrompt = (rawPrompt) => {
  let prompt = (rawPrompt || "").trim();
  prompt = prompt
    .replace(/^(?:(?:\d+\.)+\s*|Question\s*\d+.*?:\s*|Q\d+:\s*)+/i, '')
    .replace(/^(?:\[[A-Z0-9]+\]\s*:?\s*)/i, '')
    .replace(/^(?:Fill in the blank[s]?\s*:?\s*)/i, '')
    .replace(/^[-:.]\s*/, '')
    .trim();
  if (prompt.startsWith('"') && prompt.endsWith('"')) {
    prompt = prompt.slice(1, -1);
  }
  return prompt;
};

export default function InteractiveLesson({ lessonData: rawLessonData, onBack }) {
  const { t, lang } = useLanguage();
  const lessonData = getLocalizedLesson(rawLessonData, lang);
  const [flippedCards, setFlippedCards] = useState({});
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [activeTab, setActiveTab] = useState('vocabulary');

  if (!lessonData) return <div>No data available</div>;

  const toggleFlip = (idx) => {
    soundFX.playFlip();
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
    
    // Read the word using Web Speech API
    if (!flippedCards[idx]) {
      const word = lessonData.vocabulary[idx].word;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Normalize practice data (legacy vs sections)
  let practiceSections = [];
  let totalScoreable = 0;
  if (lessonData.practice && lessonData.practice.length > 0) {
    if (lessonData.practice[0].sectionName) {
      practiceSections = lessonData.practice;
    } else {
      practiceSections = [{
        sectionName: "PRACTICE",
        type: "multiple_choice",
        questions: lessonData.practice
      }];
    }
  }

  practiceSections.forEach((section, sIdx) => {
    (section.questions || []).forEach((q, qIdx) => {
      q._tempId = q.id || `q-${sIdx}-${qIdx}`;
      if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
        totalScoreable++;
      }
    });
  });

  const handleSelectAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    const score = calculateScore();
    if (totalScoreable > 0 && score >= Math.ceil(totalScoreable * 0.7)) {
      soundFX.playVictory();
    } else if (totalScoreable > 0) {
      soundFX.playError();
    }
  };

  const calculateScore = () => {
    let score = 0;
    practiceSections.forEach(section => {
      (section.questions || []).forEach(q => {
        if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
          if (answers[q._tempId] === q.correctAnswer) score++;
        }
      });
    });
    return score;
  };

  // If Presenter Mode is active, render the fullscreen component
  if (isPresenterMode) {
    return (
      <ClassroomPresenter 
        lessonData={lessonData} 
        onExit={() => setIsPresenterMode(false)} 
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="rounded-full w-11 h-11 p-0 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 shrink-0"
            title={t('ilBackToCourses')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200">
                Interactive Lesson
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {lessonData.vocabulary?.length || 0} {t('cmVocabs')}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {lessonData.title}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Presenter Button */}
          <Button
            onClick={() => setIsPresenterMode(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-5 h-11 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Tv size={18} /> {t('ilPresenterBtn')}
          </Button>

          {/* Timer Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowTimer(!showTimer)}
            className={cn(
              "font-semibold h-11 px-4 rounded-xl gap-2 border-border/70",
              showTimer ? "bg-indigo-50 text-indigo-600 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400" : ""
            )}
            title="Timer"
          >
            <TimerIcon size={18} /> {t('ilTimerBtn')}
          </Button>

          {/* Export Dropdown / Buttons */}
          <Button
            variant="outline"
            onClick={() => exportLessonToWordDoc(lessonData)}
            className="font-semibold h-11 px-4 rounded-xl gap-2 border-border/70 hover:bg-secondary"
            title="Word"
          >
            <FileText size={18} className="text-blue-600" /> {t('ilExportWord')}
          </Button>

          <Button
            variant="outline"
            onClick={() => exportToAnkiCsv(lessonData.vocabulary, lessonData.title)}
            className="font-semibold h-11 px-4 rounded-xl gap-2 border-border/70 hover:bg-secondary"
            title="Anki"
          >
            <Download size={18} className="text-emerald-600" /> {t('ilExportAnki')}
          </Button>
        </div>
      </div>

      {/* Floating Timer Widget */}
      {showTimer && (
        <ClassroomTimer isFloating={true} onClose={() => setShowTimer(false)} />
      )}

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8 bg-indigo-50/70 dark:bg-zinc-900 p-1.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 h-auto">
          <TabsTrigger 
            value="vocabulary" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={16} /> {t('ilTabVocab')}
          </TabsTrigger>
          <TabsTrigger 
            value="grammar" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2"
          >
            <Book size={16} /> {t('ilTabGrammar')}
          </TabsTrigger>
          <TabsTrigger 
            value="game" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2"
          >
            <Gamepad2 size={16} /> {t('ilTabGame')}
          </TabsTrigger>
          <TabsTrigger 
            value="practice" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2"
          >
            <PenTool size={16} /> {t('ilTabPractice')}
          </TabsTrigger>
        </TabsList>

        {/* ── 1. VOCABULARY TAB ── */}
        <TabsContent value="vocabulary" className="min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center text-foreground">
                <BookOpen size={24} className="text-indigo-500 mr-2.5" /> {t('ilVocabTitle')}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {t('ilVocabSub')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPresenterMode(true)}
              className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold gap-1.5 hidden sm:flex"
            >
              <Tv size={16} /> {t('ilPresenterBtn')}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(lessonData.vocabulary || []).map((vocab, idx) => (
              <div 
                key={idx}
                onClick={() => toggleFlip(idx)}
                className="group h-[190px] [perspective:1000px] cursor-pointer"
              >
                <div className={cn(
                  "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] shadow-md hover:shadow-xl rounded-2xl",
                  flippedCards[idx] ? "[transform:rotateY(180deg)]" : ""
                )}>
                  {/* Front */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl flex flex-col items-center justify-center border border-indigo-400/20 p-5 text-center">
                    <div className="absolute top-3 right-3 text-xs opacity-75 flex items-center gap-1 font-mono">
                      #{idx + 1}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{vocab.word}</h3>
                    <span className="opacity-80 text-xs mt-1.5 font-semibold bg-white/15 px-2.5 py-0.5 rounded-full">{vocab.type}</span>
                    <p className="opacity-90 italic mt-2.5 text-indigo-100 font-serif text-sm">{vocab.transcription}</p>
                  </div>
                  {/* Back */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-zinc-900 text-foreground border-2 border-indigo-500 rounded-2xl flex flex-col items-center justify-center [transform:rotateY(180deg)] p-5 text-center shadow-indigo-500/10">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider mb-1">{t('fcMeaningDef')}</span>
                    <p className="text-xl font-bold text-foreground leading-snug">{vocab.meaning}</p>
                    <span className="text-xs text-muted-foreground mt-2 font-mono">{vocab.word}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── 2. GRAMMAR & PRONUNCIATION TAB ── */}
        <TabsContent value="grammar" className="min-h-[500px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Grammar Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-indigo-600 flex items-center gap-2">
                <Book size={24} /> {t('ilGrammarTitle')}
              </h2>
              {(lessonData.grammar || []).map((g, i) => (
                <div key={i} className="mb-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 border-b-2 border-indigo-100 dark:border-indigo-900/60 pb-2 text-foreground">{g.title}</h3>
                  
                  {(g.sections || []).map((sec, sIdx) => (
                    <div key={sIdx} className="mb-6 last:mb-0">
                      <h4 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-400">{sec.subtitle}</h4>
                      
                      {sec.points && (
                        <ul className="list-disc pl-5 mb-4 text-muted-foreground space-y-2">
                          {sec.points.map((pt, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">{pt}</li>
                          ))}
                        </ul>
                      )}

                      {sec.formulas && (
                        <div className="flex flex-col gap-2 mb-4">
                          {sec.formulas.map((f, fIdx) => (
                            <div key={fIdx} className="flex flex-col sm:flex-row sm:items-center bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-xl border-l-4 border-indigo-500">
                              <span className="font-bold min-w-[140px] text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-0 text-sm">{f.type}</span>
                              <code className="font-mono text-sm sm:text-base text-foreground font-semibold bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">{f.text}</code>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.tags && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {sec.tags.map((tag, tIdx) => (
                            <Badge key={tIdx} variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Phonetics Section */}
            {lessonData.phonetics && lessonData.phonetics.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-purple-600 flex items-center gap-2">
                  <Volume2 size={24} /> {t('ilPhoneticsTitle')}
                </h2>
                {lessonData.phonetics.map((p, i) => (
                  <Card key={i} className="mb-6 border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/10 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Volume2 size={24} /> {p.title}
                      </h3>
                      <p className="text-muted-foreground mb-5 leading-relaxed">{p.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(p.examples || []).map((ex, exIdx) => (
                          <div key={exIdx} className="bg-white/70 dark:bg-black/40 px-4 py-3 rounded-xl flex justify-between items-center border border-purple-100/50 dark:border-purple-800/30">
                            <span className="font-bold text-foreground">{ex.word}</span>
                            <span className="text-purple-600 dark:text-purple-400 italic font-medium">{ex.transcription}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── 3. GAME TAB ── */}
        <TabsContent value="game" className="min-h-[500px]">
          <VocabularyMatchingGame 
            vocabulary={lessonData.vocabulary} 
            unitTitle={lessonData.title} 
          />
        </TabsContent>

        {/* ── 4. PRACTICE TAB ── */}
        <TabsContent value="practice" className="min-h-[500px]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center text-indigo-600">
              {t('ilPracticeTitle')}
            </h2>
            
            {practiceSections.map((section, sIdx) => (
              <div key={sIdx} className="mb-10">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 font-bold px-4 py-2 rounded-t-xl border-b-2 border-indigo-200 dark:border-indigo-800">
                  {section.sectionName}
                </div>
                
                {section.passage && (
                  <div className="bg-white dark:bg-zinc-900 p-6 border-x border-indigo-100 dark:border-indigo-900/30 text-foreground leading-relaxed text-lg whitespace-pre-wrap">
                    {section.passage}
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-b-xl border border-t-0 border-indigo-100 dark:border-indigo-900/30 space-y-6">
                  {(section.questions || []).map((q, qIdx) => (
                    <Card key={q._tempId} className="overflow-hidden border-indigo-100 dark:border-indigo-900/40 shadow-sm rounded-2xl">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4 leading-relaxed">
                          <span className="text-indigo-600 font-bold mr-2">{qIdx + 1}.</span> 
                          {cleanQuestionPrompt(q.question)}
                        </h3>
                        
                        {(section.type === 'multiple_choice' || section.type === 'true_false') ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(q.options || []).map((opt, optIdx) => {
                              const isSelected = answers[q._tempId] === optIdx;
                              const isCorrect = optIdx === q.correctAnswer;
                              
                              let btnVariant = "outline";
                              let customClasses = "justify-start h-auto py-3.5 px-4 font-normal text-left whitespace-normal h-full rounded-xl transition-all";

                              if (submitted) {
                                if (isCorrect) {
                                  customClasses = cn(customClasses, "bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 opacity-100 font-semibold");
                                } else if (isSelected && !isCorrect) {
                                  customClasses = cn(customClasses, "bg-red-50 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700 opacity-100");
                                } else {
                                  customClasses = cn(customClasses, "opacity-50");
                                }
                              } else if (isSelected) {
                                customClasses = cn(customClasses, "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm");
                              }

                              return (
                                <Button 
                                  key={optIdx}
                                  variant={btnVariant}
                                  className={customClasses}
                                  onClick={() => handleSelectAnswer(q._tempId, optIdx)}
                                  disabled={submitted && !isCorrect && !isSelected}
                                >
                                  <div className="flex w-full justify-between items-center gap-2">
                                    <span>{opt}</span>
                                    {submitted && isCorrect && <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />}
                                    {submitted && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <div>
                            <textarea 
                              className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                              placeholder="Type your answer here..."
                              value={answers[q._tempId] || ''}
                              onChange={(e) => handleSelectAnswer(q._tempId, e.target.value)}
                              disabled={submitted}
                            />
                            {submitted && q.explanation && (
                              <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-200">
                                <span className="font-bold mr-2">Suggested Answer/Explanation:</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {submitted && (section.type === 'multiple_choice' || section.type === 'true_false') && q.explanation && (
                          <div className="mt-4 p-4 bg-slate-100 dark:bg-zinc-800 rounded-xl text-sm italic border-l-4 border-indigo-400">
                            <span className="font-bold not-italic mr-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {!submitted ? (
              <Button 
                onClick={handleSubmitQuiz}
                size="lg"
                className="w-full mt-4 h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25"
              >
                Submit Answers
              </Button>
            ) : (
              <div className="mt-10 p-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl text-center shadow-xl shadow-indigo-500/20 animate-in zoom-in-95 duration-500">
                <h3 className="text-2xl font-medium mb-3 opacity-90">Your Score</h3>
                <div className="text-6xl font-black mb-8 tracking-tight drop-shadow-md">
                  {calculateScore()} <span className="text-3xl text-white/70">/ {totalScoreable}</span>
                </div>
                <Button 
                  onClick={() => { setSubmitted(false); setAnswers({}); }}
                  size="lg"
                  variant="secondary"
                  className="bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl px-8 h-12 shadow-lg"
                >
                  <RotateCcw size={18} className="mr-2" /> Try Again
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
