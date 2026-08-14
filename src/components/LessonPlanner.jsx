import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, Printer, Clock, Target } from 'lucide-react';
import { generateLessonPlan } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LessonPlanner() {
  const { t } = useLanguage();
  const [topic, setTopic] = useState('Job Interview Preparation');
  const [cefrLevel, setCefrLevel] = useState('B2');
  const [ageGroup, setAgeGroup] = useState('Adults');
  const [duration, setDuration] = useState('45');
  const [method, setMethod] = useState('PPP Framework');
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const res = await generateLessonPlan({ topic, cefrLevel, ageGroup, duration: Number(duration), method });
      setPlan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!plan) return;
    const text = `LESSON PLAN: ${plan.title}\nCEFR Level: ${plan.level} | Duration: ${plan.duration}\n\nOBJECTIVES:\n${plan.objectives.map(o => '- ' + o).join('\n')}\n\nSTAGES:\n${plan.stages.map(s => `[${s.stageName} - ${s.duration}]\nTeacher: ${s.teacherActivity}\nStudents: ${s.studentActivity}\n`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2 text-foreground">
          <BookOpen className="text-indigo-500" size={32} /> 
          {t('plannerTitle')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t('plannerSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <Card className="xl:col-span-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-indigo-100 dark:border-indigo-900/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400">{t('plannerParams')}</CardTitle>
            <CardDescription>Cấu hình các tham số để AI tạo giáo án phù hợp nhất.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="topic-input" className="text-foreground/80 font-semibold">{t('plannerTopicLabel')}</Label>
                <Input
                  id="topic-input"
                  placeholder={t('plannerTopicPlaceholder')}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="bg-white dark:bg-background border-indigo-200 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-semibold">{t('plannerCefrLabel')}</Label>
                  <Select value={cefrLevel} onValueChange={setCefrLevel}>
                    <SelectTrigger className="bg-white dark:bg-background border-indigo-200">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                        <SelectItem key={lvl} value={lvl}>{lvl} Level</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/80 font-semibold">{t('plannerDurationLabel')}</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-white dark:bg-background border-indigo-200">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Mins</SelectItem>
                      <SelectItem value="45">45 Mins</SelectItem>
                      <SelectItem value="60">60 Mins</SelectItem>
                      <SelectItem value="90">90 Mins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">{t('plannerGroupLabel')}</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className="bg-white dark:bg-background border-indigo-200">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Young Learners (6-10)">Kids (6-10)</SelectItem>
                    <SelectItem value="Teens (11-17)">Teens (11-17)</SelectItem>
                    <SelectItem value="Adults">Adults</SelectItem>
                    <SelectItem value="Business Professionals">Business Professionals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">{t('plannerMethodLabel')}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="bg-white dark:bg-background border-indigo-200">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PPP Framework">PPP Framework</SelectItem>
                    <SelectItem value="Task-based Learning">Task-Based Learning</SelectItem>
                    <SelectItem value="Test-Teach-Test">Test-Teach-Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> {t('plannerBuilding')}</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles size={18} /> {t('plannerSubmitBtn')}</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Lesson Plan Output */}
        <div className="xl:col-span-8">
          {loading ? (
            <Card className="p-10 flex flex-col items-center justify-center min-h-[400px] border-indigo-100 bg-white/50 backdrop-blur-sm animate-pulse">
              <div className="w-16 h-16 rounded-full bg-indigo-100 mb-6 flex items-center justify-center">
                <BookOpen size={32} className="text-indigo-400" />
              </div>
              <div className="h-6 w-3/4 bg-indigo-100/50 rounded-md mb-4" />
              <div className="h-4 w-1/2 bg-indigo-100/50 rounded-md mb-8" />
              <div className="space-y-3 w-full max-w-lg">
                <div className="h-20 w-full bg-secondary/60 rounded-lg" />
                <div className="h-20 w-full bg-secondary/60 rounded-lg" />
                <div className="h-20 w-full bg-secondary/60 rounded-lg" />
              </div>
              <p className="mt-8 text-indigo-400 font-medium animate-pulse">{t('plannerBuilding')}</p>
            </Card>
          ) : plan ? (
            <Card className="printable-document bg-white dark:bg-secondary/20 shadow-md border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
              {/* Output Actions Bar */}
              <div className="no-print bg-indigo-50/50 dark:bg-indigo-950/20 px-6 py-4 flex flex-wrap justify-between items-center border-b border-indigo-100 dark:border-indigo-900/30 gap-4">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1">
                  <Check size={14} className="mr-1" /> {t('plannerReadyBadge')}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                    {copied ? <><Check size={14} className="mr-2" /> {t('btnCopied')}</> : <><Copy size={14} className="mr-2" /> {t('btnCopy')}</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
                    <Printer size={14} className="mr-2" /> {t('btnPrint')}
                  </Button>
                </div>
              </div>

              <CardContent className="p-8 md:p-10">
                {/* Plan Header */}
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-extrabold text-foreground mb-4">{plan.title}</h2>
                  <div className="flex justify-center gap-6 text-sm font-medium">
                    <Badge variant="outline" className="px-4 py-1.5 border-indigo-200 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      <Target size={16} className="mr-2" /> Level: {plan.level}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-1.5 border-amber-200 bg-amber-50 text-amber-700 rounded-full text-sm">
                      <Clock size={16} className="mr-2" /> Time: {plan.duration}
                    </Badge>
                  </div>
                </div>

                {/* Objectives */}
                <div className="mb-10 bg-secondary/30 p-6 rounded-2xl border border-border/50">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Target size={18} className="text-indigo-500" /> {t('plannerObjectives')}
                  </h4>
                  <ul className="space-y-2">
                    {plan.objectives?.map((obj, i) => (
                      <li key={i} className="flex items-start text-foreground/90">
                        <span className="text-indigo-500 mr-3 mt-1">•</span>
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Language & Materials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4">
                      {t('plannerTargetVocab')}
                    </h4>
                    <ul className="space-y-2">
                      {plan.targetLanguage?.vocabulary?.map((v, i) => (
                        <li key={i} className="flex items-start text-foreground/80 text-sm">
                          <Check size={16} className="text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
                      {t('plannerGrammarFocus')}
                    </h4>
                    <p className="text-foreground/80 text-sm leading-relaxed border-l-4 border-emerald-400 pl-4 py-1">
                      {plan.targetLanguage?.grammar}
                    </p>
                  </div>
                </div>

                {/* Procedure Stages Table */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-500" /> {t('plannerProcedure')}
                  </h4>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-200 before:to-transparent">
                    {plan.stages?.map((stage, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-background bg-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-border/60 bg-white dark:bg-secondary/40 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-bold text-indigo-700 dark:text-indigo-400">{stage.stageName}</h5>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground shrink-0">{stage.duration}</Badge>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30">
                              <p className="font-semibold text-foreground mb-1">{t('plannerTeacherAct')}</p>
                              <p className="text-muted-foreground leading-relaxed">{stage.teacherActivity}</p>
                            </div>
                            <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                              <p className="font-semibold text-foreground mb-1">{t('plannerStudentAct')}</p>
                              <p className="text-muted-foreground leading-relaxed">{stage.studentActivity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center p-16 h-full min-h-[500px] bg-white/40 dark:bg-black/10 border-dashed border-2 border-border/60">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={48} className="text-indigo-300 dark:text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{t('plannerNoPlanYet')}</h3>
              <p className="text-muted-foreground max-w-sm leading-relaxed text-lg">
                {t('plannerNoPlanDesc')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
