import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Sparkles, Copy, Check, Printer, PenTool, CheckSquare, Dices, Lightbulb, CheckCircle2, XCircle, Brain, BookOpen, ListChecks, ShieldCheck } from 'lucide-react';
import { generateWorksheet } from '../services/aiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AILoadingOverlay from './AILoadingOverlay';
import { useAIStore } from '../store/useAIStore';

const SUGGESTED_TOPICS = [
  { label: 'Unit 1: My New School', level: 'A2', type: 'Vocabulary Fill-in-the-blanks', icon: '🏫' },
  { label: 'Unit 2: My House & Rooms', level: 'A2', type: 'Grammar Multiple Choice', icon: '🏡' },
  { label: 'Unit 3: Friends & Personality', level: 'B1', type: 'Reading Passage & Comprehension Questions', icon: '👥' },
  { label: 'Unit 5: Natural Wonders of Vietnam', level: 'B1', type: 'Reading Passage & Comprehension Questions', icon: '🏞️' },
  { label: 'Environmental Protection & Green Living', level: 'B2', type: 'Reading Passage & Comprehension Questions', icon: '🌱' },
  { label: 'Future AI & Space Exploration', level: 'B2', type: 'Grammar Multiple Choice', icon: '🚀' },
  { label: 'Job Interview & Professional Workplace', level: 'C1', type: 'Reading Passage & Comprehension Questions', icon: '💼' }
];

const RANDOM_PROMPTS = [
  { topic: 'Traditional Vietnamese Food & Tet Holiday', level: 'A2', type: 'Reading Passage & Comprehension Questions' },
  { topic: 'The Impact of Social Media on Teenagers', level: 'B1', type: 'Reading Passage & Comprehension Questions' },
  { topic: 'Present Perfect vs. Past Simple Tense Mastery', level: 'B1', type: 'Grammar Multiple Choice' },
  { topic: 'Urbanization and Smart Cities of 2050', level: 'B2', type: 'Reading Passage & Comprehension Questions' },
  { topic: 'Healthy Daily Habits and Mental Wellness', level: 'A2', type: 'Vocabulary Fill-in-the-blanks' },
  { topic: 'Job Interview & Professional Workplace', level: 'C1', type: 'Reading Passage & Comprehension Questions' }
];

const cleanQuestionPrompt = (rawPrompt) => {
  let prompt = (rawPrompt || "").trim();
  // Clean up messy prefixes like "1. Question 1 [A2]: Fill in the blank: "
  prompt = prompt
    .replace(/^(?:\d+\.\s*)?(?:Question\s*\d+.*?:\s*|Q\d+:\s*)/i, '')
    .replace(/^(?:\[[A-Z0-9]+\]\s*:?\s*)/i, '')
    .replace(/^(?:Fill in the blank[s]?\s*:?\s*)/i, '')
    .replace(/^[-:.]\s*/, '')
    .trim();
  // Remove wrapping quotes if present
  if (prompt.startsWith('"') && prompt.endsWith('"')) {
    prompt = prompt.slice(1, -1);
  }
  return prompt;
};

export default function WorksheetGenerator() {
  const { t } = useLanguage();
  
  // Connect to Zustand store
  const {
    worksheetParams,
    setWorksheetParams,
    worksheetData: worksheet,
    setWorksheetData: setWorksheet,
    worksheetAnswers: userAnswers,
    setWorksheetAnswer,
    resetWorksheetAnswers
  } = useAIStore();

  const { topic, cefrLevel, type, questionCount } = worksheetParams;
  
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const WORKSHEET_STEPS = [
    { icon: Brain,       labelKey: 'aiStepReadTopic' },
    { icon: BookOpen,    labelKey: 'aiStepDraftPassage' },
    { icon: ListChecks,  labelKey: 'aiStepGenQuestions' },
    { icon: ShieldCheck, labelKey: 'aiStepVerifyAnswers' },
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    resetWorksheetAnswers();
    try {
      const res = await generateWorksheet({ topic, cefrLevel, type, questionCount });
      setWorksheet(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTopic = (item) => {
    setWorksheetParams({
      topic: item.label || item.topic,
      cefrLevel: item.level,
      type: item.type
    });
  };

  const handleRandomize = () => {
    const randomItem = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setWorksheetParams({
      topic: randomItem.topic,
      cefrLevel: randomItem.level,
      type: randomItem.type
    });
  };

  const handleSelectOption = (questionIdx, opt) => {
    setWorksheetAnswer(questionIdx, opt);
  };

  const handleCopy = () => {
    if (!worksheet) return;
    let text = `WORKSHEET: ${worksheet.title}\n\n`;
    if (worksheet.readingPassage) text += `PASSAGE:\n${worksheet.readingPassage}\n\n`;
    text += `QUESTIONS:\n${worksheet.questions.map((q, i) => `${i+1}. ${cleanQuestionPrompt(q.question || q.questionText)}\n${q.options.map(o => `   - ${o}`).join('\n')}`).join('\n\n')}\n\n`;
    text += `ANSWER KEY:\n${worksheet.questions.map((q, i) => `${i+1}. ${q.answer || q.correctAnswer}`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <AILoadingOverlay
        isVisible={loading}
        steps={WORKSHEET_STEPS}
        title={t('aiLoadingTitle')}
        subtitle={t('aiLoadingSubtitle')}
        estimatedSeconds={16}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2 text-foreground flex-wrap">
          <FileText className="text-emerald-500 shrink-0" size={32} /> 
          <span>{t('wsTitle')}</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
          {t('wsSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <Card className="xl:col-span-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-emerald-100 dark:border-emerald-900/50 shadow-sm h-fit">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-500" /> {t('wsParams')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomize}
                type="button"
                className="h-8 rounded-full text-xs font-bold border-emerald-200 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 gap-1.5"
              >
                <Dices size={14} /> {t('wsRandomTopic')}
              </Button>
            </div>
            <CardDescription>{t('wsParamsDesc')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Quick AI Suggestion Chips */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5 mb-2.5">
                <Lightbulb size={14} className="text-amber-500" /> {t('wsAiSuggestTitle')}
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {SUGGESTED_TOPICS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTopic(item)}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 font-medium",
                      topic === item.label
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white dark:bg-zinc-900 border-border/60 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-foreground"
                    )}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate max-w-[170px]">{item.label}</span>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 ml-auto shrink-0">
                      {item.level}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="ws-topic" className="text-foreground/80 font-semibold">{t('wsTopicLabel')}</Label>
                <Input
                  id="ws-topic"
                  value={topic}
                  onChange={(e) => setWorksheetParams({ topic: e.target.value })}
                  placeholder={t('wsTopicPlaceholder')}
                  required
                  className="bg-white dark:bg-background border-emerald-200 focus-visible:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-semibold">{t('wsCefrLabel')}</Label>
                  <Select value={cefrLevel} onValueChange={(val) => setWorksheetParams({ cefrLevel: val })}>
                    <SelectTrigger className="bg-white dark:bg-background border-emerald-200">
                      <SelectValue placeholder={t('wsCefrPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                        <SelectItem key={lvl} value={lvl}>{lvl} Level</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/80 font-semibold">{t('wsQuestionCount')}</Label>
                  <Select value={String(questionCount)} onValueChange={(val) => setWorksheetParams({ questionCount: Number(val) })}>
                    <SelectTrigger className="bg-white dark:bg-background border-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="8">8 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">{t('wsFormatLabel')}</Label>
                <Select value={type} onValueChange={(val) => setWorksheetParams({ type: val })}>
                  <SelectTrigger className="bg-white dark:bg-background border-emerald-200">
                    <SelectValue placeholder={t('wsFormatPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reading Passage & Comprehension Questions">{t('wsFormatReading')}</SelectItem>
                    <SelectItem value="Vocabulary Fill-in-the-blanks">{t('wsFormatVocabFill')}</SelectItem>
                    <SelectItem value="Grammar Multiple Choice">{t('wsFormatGrammarMC')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 text-base gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">{t('wsGenerating')}</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles size={18} /> {t('wsSubmitBtn')}</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output Area */}
        <div className="xl:col-span-7">
          {worksheet ? (
            <div className="space-y-6">
              {/* Student Worksheet */}
              <Card className="printable-document bg-white dark:bg-secondary/20 shadow-md border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
                <div className="no-print bg-emerald-50/50 dark:bg-emerald-950/20 px-6 py-4 flex flex-wrap justify-between items-center border-b border-emerald-100 dark:border-emerald-900/30 gap-4">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 font-semibold">
                    {t('wsStudentVersion')}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                      {copied ? <><Check size={14} className="mr-2" /> {t('btnCopied')}</> : <><Copy size={14} className="mr-2" /> {t('wsCopyAll')}</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                      <Printer size={14} className="mr-2" /> {t('wsPrint')}
                    </Button>
                  </div>
                </div>

                <CardContent className="p-8 md:p-10">
                  <div className="text-center mb-8 pb-6 border-b border-border/50">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{worksheet.title}</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Badge variant="outline" className="px-3 py-1 border-emerald-200 text-emerald-700 bg-emerald-50">{t('wsLevelBadge')} {cefrLevel}</Badge>
                      <Badge variant="outline" className="px-3 py-1 border-indigo-200 text-indigo-700 bg-indigo-50">{t('wsNameBadge')}</Badge>
                    </div>
                  </div>

                  {worksheet.readingPassage && (
                    <div className="mb-8 bg-secondary/30 p-6 rounded-2xl border border-border/50 leading-relaxed text-foreground/90">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-2">{t('wsReadingText')}</h4>
                      <p className="whitespace-pre-line text-base sm:text-lg">{worksheet.readingPassage}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-600">
                      <PenTool size={20} /> {t('wsExercises')}
                    </h4>
                    <div className="space-y-6">
                      {worksheet.questions.map((q, idx) => {
                        const questionPrompt = cleanQuestionPrompt(q.question || q.questionText);
                        const correctAnswer = q.answer || q.correctAnswer;
                        const selectedOpt = userAnswers[idx];

                        return (
                          <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-white dark:bg-secondary/40 shadow-sm">
                            <p className="font-semibold text-foreground mb-4 text-base sm:text-lg">
                              <span className="text-emerald-500 font-bold mr-2">{idx + 1}.</span> {questionPrompt}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-4">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = selectedOpt === opt;
                                const isCorrect = opt === correctAnswer || opt.startsWith(correctAnswer);

                                return (
                                  <div 
                                    key={oIdx} 
                                    onClick={() => handleSelectOption(idx, opt)}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none text-sm font-medium",
                                      isSelected
                                        ? isCorrect
                                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                                          : "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 font-bold"
                                        : "border-border/50 hover:bg-secondary/40 hover:border-emerald-300 text-foreground"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                                      isSelected 
                                        ? isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-red-500 bg-red-500 text-white"
                                        : "border-muted-foreground"
                                    )}>
                                      {isSelected && (isCorrect ? <Check size={12} /> : <XCircle size={12} />)}
                                    </div>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answer Key */}
              <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <CheckSquare size={20} /> {t('wsTeacherKey')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {worksheet.questions.map((q, idx) => (
                      <div key={idx} className="bg-white dark:bg-background p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-2.5 text-sm">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">{idx + 1}.</span>
                        <span className="font-semibold text-foreground">{q.answer || q.correctAnswer}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center p-12 sm:p-16 h-full min-h-[460px] bg-white/40 dark:bg-black/10 border-dashed border-2 border-border/60 rounded-3xl">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                <FileText size={42} className="text-emerald-400 dark:text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{t('wsNoWsTitle')}</h3>
              <p className="text-muted-foreground max-w-sm leading-relaxed text-base">
                {t('wsNoWsDesc')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
