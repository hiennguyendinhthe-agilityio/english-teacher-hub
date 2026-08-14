import React, { useState } from 'react';
import { PenTool, Sparkles, CheckCircle2, AlertCircle, AlertTriangle, TrendingUp, RefreshCw, BookOpen, FileText, CheckSquare, Zap, Eye, Target, ListChecks, PenLine, GraduationCap, ArrowRight, Lightbulb, Dices, Award, Check } from 'lucide-react';
import { gradeEssay } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AILoadingOverlay from './AILoadingOverlay';
import { useAIStore } from '../store/useAIStore';
import { cn } from '@/lib/utils';

const SAMPLE_ESSAYS = [
  {
    id: 'a2',
    labelKey: 'essaySampleA2',
    band: '4.5',
    title: 'My Favorite Pet (A2 Level)',
    scale: 'IELTS Writing Band (1.0 - 9.0)',
    text: `My favorite pet is a dog. It name is Max. He is very cute and have four legs. Every morning, Max wake up early and bark loud because he want to eat food. I am loving playing with him in the park near my house. Yesterday, we go to the garden and he catch a big ball. I think dog is the most best animal in the world because they are very friendly with people.`
  },
  {
    id: 'b1',
    labelKey: 'essaySampleB1',
    band: '6.0',
    title: 'Living in a Big City (B1 Level)',
    scale: 'IELTS Writing Band (1.0 - 9.0)',
    text: `Living in a big city has both advantages and disadvantages. On the one hand, cities provide many job opportunities and modern facilities such as hospitals, universities, and shopping malls. Public transport is also convenient, which make it easy for citizens to travel around without a car. On the other hand, city life can be very stressful because of air pollution and traffic jams. In conclusion, although big cities offer exciting lifestyle, people should balance their work and health.`
  },
  {
    id: 'b2',
    labelKey: 'essaySampleB2',
    band: '7.5',
    title: 'AI in Modern Education (B2/C1 Level)',
    scale: 'IELTS Writing Band (1.0 - 9.0)',
    text: `The rapid proliferation of artificial intelligence in contemporary education has sparked contentious debates. Proponents assert that AI-driven learning tools facilitate tailored educational pathways, enabling students to progress at an optimal pace and receive instantaneous feedback. Conversely, skeptics caution that excessive reliance on automated systems could potentially diminish students' critical analytical abilities and weaken interpersonal collaboration. Ultimately, a balanced hybrid pedagogy that harmonizes AI efficiency with empathetic human mentorship represents the most sustainable future for education.`
  }
];

const WRITING_PROMPTS = [
  "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake. Discuss both views and give your opinion.",
  "In many countries, more and more people are choosing to live alone. What are the reasons for this, and does this have more positive or negative effects on society?",
  "Describe a memorable experience or trip you had in Vietnam and explain why it was special to you."
];

export default function EssayGrader() {
  const { t } = useLanguage();
  
  // Connect to Zustand store
  const {
    essayParams,
    setEssayParams,
    essayFeedback: feedback,
    setEssayFeedback: setFeedback
  } = useAIStore();

  const { essayText, gradingScale } = essayParams;

  const [loading, setLoading] = useState(false);

  const ESSAY_STEPS = [
    { icon: FileText,   labelKey: 'aiStepReadEssay' },
    { icon: Target,     labelKey: 'aiStepScoreBands' },
    { icon: ListChecks, labelKey: 'aiStepFindErrors' },
    { icon: PenLine,    labelKey: 'aiStepRewrite' },
  ];

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const sentenceCount = essayText.trim() ? essayText.split(/[.!?]+/).filter(Boolean).length : 0;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!essayText.trim() || wordCount < 10) return;
    
    setLoading(true);
    try {
      const res = await gradeEssay({ essayText, targetScoreSystem: gradingScale });
      setFeedback(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sample) => {
    setEssayParams({ essayText: sample.text, gradingScale: sample.scale });
    setFeedback(null);
  };

  const handleRandomPrompt = () => {
    const prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    setEssayParams({ essayText: `Topic: "${prompt}"\n\n` });
    setFeedback(null);
  };

  const getScoreColor = (score) => {
    const s = parseFloat(score);
    if (isNaN(s)) return 'text-amber-500';
    if (s >= 7.0) return 'text-emerald-500';
    if (s >= 5.5) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <AILoadingOverlay
        isVisible={loading}
        steps={ESSAY_STEPS}
        title={t('aiLoadingTitle')}
        subtitle={t('aiLoadingSubtitle')}
        estimatedSeconds={14}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2 text-foreground flex-wrap">
          <GraduationCap className="text-amber-500 shrink-0" size={32} /> 
          <span>{t('essayTitle')}</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
          {t('essaySub')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <Card className="xl:col-span-5 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-amber-100 dark:border-amber-900/50 shadow-sm h-fit">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" /> {t('essayParams')}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomPrompt}
                type="button"
                className="h-8 rounded-full text-xs font-bold border-amber-200 text-amber-700 dark:text-amber-300 hover:bg-amber-50 gap-1.5"
              >
                <Lightbulb size={13} /> {t('essaySuggestTopic')}
              </Button>
            </div>
            <CardDescription>{t('essayParamsDesc')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* AI Sample Essays Bar */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5 mb-2.5">
                <BookOpen size={14} className="text-indigo-500" /> {t('essaySampleTitle')}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_ESSAYS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleLoadSample(sample)}
                    className={cn(
                      "text-xs p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 font-semibold",
                      essayText.includes(sample.title.slice(0, 10)) || essayText === sample.text
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500 shadow-sm"
                        : "bg-white dark:bg-zinc-900 border-border/60 hover:border-amber-400 hover:bg-amber-50/40 text-foreground"
                    )}
                  >
                    <span className="truncate w-full">{t(sample.labelKey)}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {sample.band}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-border/50">
              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">{t('essaySystemLabel')}</Label>
                <Select value={gradingScale} onValueChange={(val) => setEssayParams({ gradingScale: val })}>
                  <SelectTrigger className="bg-white dark:bg-background border-amber-200">
                    <SelectValue placeholder={t('essayScalePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IELTS Writing Band (1.0 - 9.0)">IELTS Writing Band (1.0 - 9.0)</SelectItem>
                    <SelectItem value="CEFR Level (A1 - C2)">CEFR Level (A1 - C2)</SelectItem>
                    <SelectItem value="TOEFL iBT Writing (0 - 30)">TOEFL iBT Writing (0 - 30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label className="text-foreground/80 font-semibold">{t('essayInputLabel')}</Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span>{t('essayWordCount')} <strong className="text-foreground font-bold">{wordCount}</strong> {t('essayWords')}</span>
                    <span>·</span>
                    <span>{sentenceCount} câu</span>
                  </div>
                </div>
                <Textarea
                  value={essayText}
                  onChange={(e) => setEssayParams({ essayText: e.target.value })}
                  placeholder={t('essayPlaceholder')}
                  required
                  className="min-h-[260px] resize-y bg-white dark:bg-background border-amber-200 focus-visible:ring-amber-500 leading-relaxed text-sm font-sans"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || wordCount < 10} 
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 text-base gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">{t('essayGrading')}</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles size={18} /> {t('essaySubmitBtn')}</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback Output Column */}
        <div className="xl:col-span-7">
          {feedback ? (
            <div className="space-y-6">
              {/* Overall Score & Criteria Overview */}
              <Card className="bg-white dark:bg-secondary/20 shadow-md border-amber-100 dark:border-amber-900/30 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-100 dark:border-amber-900/30 p-6 text-center">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('essayScoreTitle')}</h2>
                  <div className={`text-6xl font-black mb-2 drop-shadow-sm ${getScoreColor(feedback.overallScore || feedback.overallBand)}`}>
                    {feedback.overallScore || feedback.overallBand || '6.5'}
                  </div>
                  <p className="text-base text-foreground/90 max-w-xl mx-auto leading-relaxed font-medium">
                    {feedback.generalComment || (Array.isArray(feedback.strengths) ? feedback.strengths.join(' ') : '')}
                  </p>
                </div>

                {/* 4 Criteria Sub-scores if available */}
                {feedback.scores && (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/20 border-t border-border/40">
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900">
                      <div className="text-xs text-muted-foreground font-semibold">{t('essayTaskResponse')}</div>
                      <div className="text-lg font-black text-foreground">{feedback.scores.taskAchievement || '6.5'}</div>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900">
                      <div className="text-xs text-muted-foreground font-semibold">{t('essayCoherence')}</div>
                      <div className="text-lg font-black text-foreground">{feedback.scores.coherenceCohesion || '6.0'}</div>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900">
                      <div className="text-xs text-muted-foreground font-semibold">{t('essayLexical')}</div>
                      <div className="text-lg font-black text-foreground">{feedback.scores.lexicalResource || '7.0'}</div>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-zinc-900">
                      <div className="text-xs text-muted-foreground font-semibold">{t('essayGrammar')}</div>
                      <div className="text-lg font-black text-foreground">{feedback.scores.grammarAccuracy || '6.5'}</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Grammar & Vocabulary Errors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grammar Issues */}
                <Card className="border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle size={18} /> {t('essayGrammarIssues')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(feedback.grammarErrors || feedback.grammarCorrections || []).map((err, idx) => (
                      <div key={idx} className="bg-white dark:bg-background p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm text-sm">
                        <div className="line-through decoration-red-500 text-muted-foreground mb-1">"{err.mistake || err.original}"</div>
                        <div className="text-emerald-600 font-bold flex items-center gap-1.5 mb-1.5">
                          <ArrowRight size={14} /> "{err.correction || err.corrected}"
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{err.explanation || err.rule}</p>
                      </div>
                    ))}
                    {!(feedback.grammarErrors?.length || feedback.grammarCorrections?.length) && (
                      <div className="p-4 text-center text-xs text-muted-foreground">Không phát hiện lỗi ngữ pháp nghiêm trọng! 🎉</div>
                    )}
                  </CardContent>
                </Card>

                {/* Vocabulary Upgrades */}
                <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <Sparkles size={18} /> {t('essayVocabSuggestions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(feedback.vocabularyImprovements || feedback.vocabularySuggestions || []).map((vocab, idx) => (
                      <div key={idx} className="bg-white dark:bg-background p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm text-sm">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-muted-foreground line-through">"{vocab.original}"</span>
                          <ArrowRight size={14} className="text-indigo-500" />
                          <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold">
                            {vocab.suggestion}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{vocab.reason}</p>
                      </div>
                    ))}
                    {!(feedback.vocabularyImprovements?.length || feedback.vocabularySuggestions?.length) && (
                      <div className="p-4 text-center text-xs text-muted-foreground">Vốn từ vựng sử dụng rất tốt và tự nhiên! ✨</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Model Rewritten Essay */}
              <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/15 dark:bg-emerald-950/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} /> {t('essayModelAnswer')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white dark:bg-background p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-foreground/90 leading-relaxed text-base sm:text-lg">
                    <p className="whitespace-pre-line">{feedback.rewrittenEssay || feedback.improvedParagraph}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center p-12 sm:p-16 h-full min-h-[460px] bg-white/40 dark:bg-black/10 border-dashed border-2 border-border/60 rounded-3xl">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
                <GraduationCap size={42} className="text-amber-400 dark:text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{t('essayNoFeedbackTitle')}</h3>
              <p className="text-muted-foreground max-w-sm leading-relaxed text-base">
                {t('essayNoFeedbackDesc')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
