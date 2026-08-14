import React, { useState } from 'react';
import { BookOpen, Clock, PlusCircle, Folders, Trash2, Sparkles } from 'lucide-react';
import InteractiveLesson from './InteractiveLesson';
import { useLanguage } from '../context/LanguageContext';
import { useAIStore } from '../store/useAIStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { unit1Data } from '../data/unit1_data';
import { unit2Data } from '../data/unit2_data';
import { unit3Data } from '../data/unit3_data';
import { unit4Data } from '../data/unit4_data';
import { unit5Data } from '../data/unit5_data';

export default function CourseManager({ setActiveTab }) {
  const { t } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const { savedLessons, deleteSavedLesson } = useAIStore();

  const units = [
    unit1Data,
    unit2Data,
    unit3Data,
    unit4Data,
    unit5Data
  ];

  if (selectedLesson) {
    return <InteractiveLesson lessonData={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-2 text-foreground">
            <Folders className="text-indigo-500 shrink-0" size={30} /> 
            <span className="truncate">{t('cmTitle')}</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">{t('cmSub')}</p>
        </div>
        <Button 
          onClick={() => setActiveTab('aiImporter')}
          className="w-full sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 px-6 py-6 rounded-xl flex items-center justify-center gap-2 font-semibold hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle size={20} /> {t('cmImportBtn')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit, idx) => (
          <Card 
            key={unit.id}
            onClick={() => !unit.disabled && setSelectedLesson(unit)}
            className={`overflow-hidden relative transition-all duration-300 ${
              unit.disabled 
                ? 'opacity-60 cursor-not-allowed bg-secondary/20 border-border/50' 
                : 'cursor-pointer bg-white dark:bg-background border-border/60 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-800'
            }`}
            style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}
          >
            {!unit.disabled && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  unit.disabled 
                    ? 'bg-secondary text-muted-foreground' 
                    : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground leading-tight">{unit.title}</h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground mb-4">
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/50 rounded-md">
                  <Clock size={14} className="mr-1.5" /> 45 {t('cmMins')}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/50 rounded-md">
                  {unit.vocabulary?.length || 0} {t('cmVocabs')}
                </Badge>
              </div>

              {unit.disabled ? (
                <div className="mt-4 inline-flex">
                  <Badge variant="outline" className="border-dashed border-muted-foreground text-muted-foreground">
                    {t('cmComingSoon')}
                  </Badge>
                </div>
              ) : (
                <div className="mt-4 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {t('cmEnterLesson')} <span className="ml-1">→</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Saved Lessons Section */}
      {savedLessons && savedLessons.length > 0 && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {t('cmSavedLessonsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLessons.map((unit, idx) => (
              <Card 
                key={unit.id}
                onClick={() => setSelectedLesson(unit)}
                className="overflow-hidden relative transition-all duration-300 cursor-pointer bg-white dark:bg-background border-emerald-200 dark:border-emerald-800/60 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700"
                style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground leading-tight break-words">{unit.title}</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedLesson(unit.id);
                      }}
                      title={t('cmDeleteLesson')}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0 h-8 w-8 rounded-full"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground mb-4">
                    <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/50 rounded-md">
                      <Clock size={14} className="mr-1.5" /> 45 {t('cmMins')}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground hover:bg-secondary/50 rounded-md">
                      {unit.vocabulary?.length || 0} {t('cmVocabs')}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {t('cmEnterLesson')} <span className="ml-1">→</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
