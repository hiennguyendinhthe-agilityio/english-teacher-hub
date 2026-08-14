import React from 'react';
import { BookOpen, FileText, GraduationCap, Sparkles, ArrowRight, Lightbulb, CheckCircle2, FolderOpen, UploadCloud } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Dashboard({ setActiveTab }) {
  const { t } = useLanguage();

  const tools = [
    {
      id: 'courseManager',
      title: t('cmTitle'),
      description: t('dashCourseManagerDesc'),
      icon: FolderOpen,
      colorClass: 'text-indigo-500',
      bgClass: 'bg-indigo-500/10',
      borderHover: 'hover:border-indigo-500',
    },
    {
      id: 'flashcard',
      title: t('navFlashcard'),
      description: t('dashFlashcardDesc'),
      icon: Sparkles,
      colorClass: 'text-pink-500',
      bgClass: 'bg-pink-500/10',
      borderHover: 'hover:border-pink-500',
    },
    {
      id: 'worksheet',
      title: t('navWorksheet'),
      description: t('dashWorksheetDesc'),
      icon: FileText,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-500',
    },
    {
      id: 'essay',
      title: t('navEssay'),
      description: t('dashEssayDesc'),
      icon: GraduationCap,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
      borderHover: 'hover:border-amber-500',
    },
    {
      id: 'aiImporter',
      title: t('impTitle'),
      description: t('dashAiImporterDesc'),
      icon: UploadCloud,
      colorClass: 'text-violet-500',
      bgClass: 'bg-violet-500/10',
      borderHover: 'hover:border-violet-500',
    }
  ];

  const cefrLevels = [
    { code: 'A1', label: 'Beginner', desc: 'Basic phrases & everyday expressions' },
    { code: 'A2', label: 'Elementary', desc: 'Simple exchanges & familiar routines' },
    { code: 'B1', label: 'Intermediate', desc: 'Independent travel & work communication' },
    { code: 'B2', label: 'Upper Intermediate', desc: 'Complex texts & spontaneous fluency' },
    { code: 'C1', label: 'Advanced', desc: 'Flexible academic & professional mastery' },
    { code: 'C2', label: 'Proficient', desc: 'Near-native comprehension & expression' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white p-8 md:p-12 rounded-3xl mb-10 shadow-2xl shadow-indigo-500/20 border border-indigo-400/20">
        <div className="absolute -right-10 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <Badge variant="outline" className="bg-white/20 text-white border-white/40 px-3.5 py-1.5 text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md inline-flex items-center gap-2">
              <Sparkles size={14} className="text-amber-300 fill-amber-300" />
              {t('dashBannerBadge')}
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-black leading-tight tracking-tight drop-shadow-sm">
              {t('dashBannerTitle')}
            </h1>

            <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
              {t('dashBannerDesc')}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button 
                onClick={() => setActiveTab('courseManager')}
                size="lg"
                className="bg-white text-indigo-700 hover:bg-slate-50 font-extrabold rounded-2xl px-8 h-14 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-base gap-2"
              >
                {t('dashCreatePlanBtn')} <ArrowRight size={18} />
              </Button>

              <Button
                onClick={() => setActiveTab('flashcard')}
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md rounded-2xl px-6 h-14 font-bold text-base transition-all duration-300 gap-2"
              >
                <Sparkles size={18} className="text-amber-300" /> {t('navFlashcard')}
              </Button>
            </div>
          </div>

          {/* Right Column: Widescreen 3D Glassmorphic Showcase Widget */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl shadow-black/10 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/90">Unit 1 - My New School</span>
                </div>
                <Badge className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 border-0">
                  Ready
                </Badge>
              </div>

              {/* Sample Vocab Mini Card */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-xl font-black text-white">activity</div>
                  <div className="text-xs text-indigo-200 font-mono italic">/ækˈtɪv.ɪ.ti/ · (n)</div>
                  <div className="text-sm font-semibold text-white/90 mt-1">hoạt động</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shadow-inner">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
              </div>

              {/* Interactive Features Pills */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-white/90">
                <div className="bg-black/20 px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                  <span>🃏 3D Flashcards</span>
                </div>
                <div className="bg-black/20 px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                  <span>🎮 Match Game</span>
                </div>
                <div className="bg-black/20 px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                  <span>📺 TV Presenter</span>
                </div>
                <div className="bg-black/20 px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                  <span>📝 CEFR Quiz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tools Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('dashCoreTools')}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm",
                tool.borderHover
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                  tool.bgClass,
                  tool.colorClass
                )}>
                  <Icon size={28} />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-[0.95rem] leading-relaxed mt-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <div className={cn(
                  "flex items-center text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1",
                  tool.colorClass
                )}>
                  {t('dashOpenTool')} <ArrowRight size={16} className="ml-1" />
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* CEFR Reference & Daily Tip Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl gap-2 text-foreground">
              <CheckCircle2 size={24} className="text-indigo-500" /> {t('dashCefrTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cefrLevels.map((lvl) => (
                <div key={lvl.code} className="p-4 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="default" className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20">{lvl.code}</Badge>
                    <strong className="text-sm font-bold">{lvl.label}</strong>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{lvl.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50 backdrop-blur-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-xl gap-2 text-indigo-600 dark:text-indigo-400">
              <Lightbulb size={24} /> {t('dashPedagogyTipTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-full bg-white/60 dark:bg-black/40 p-6 rounded-xl border-l-4 border-indigo-500 text-muted-foreground leading-relaxed text-[1.05rem]">
              <p>{t('dashPedagogyTipText')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
