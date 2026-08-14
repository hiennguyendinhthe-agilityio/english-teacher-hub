import React, { useState } from 'react';
import { UploadCloud, CheckCircle, Sparkles, Loader2, ArrowRight, PlayCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateLessonFromText } from '../services/aiService';
import InteractiveLesson from './InteractiveLesson';

export default function AIImporter({ setActiveTab }) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const lessonData = await generateLessonFromText(text);
      setGeneratedLesson(lessonData);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to process lesson');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setText('');
    setIsSuccess(false);
    setGeneratedLesson(null);
    setShowPreview(false);
    setError('');
  };

  if (showPreview && generatedLesson) {
    return <InteractiveLesson lessonData={generatedLesson} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-3">
          <Sparkles size={40} className="text-emerald-500" /> {t('impTitle')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('impSub')}
        </p>
      </div>

      {!isSuccess ? (
        <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="mb-8">
              <Label className="block mb-3 text-lg font-bold text-foreground">
                {t('impPasteLabel')}
              </Label>
              <div className="relative">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Unit 1: MY NEW SCHOOL\nVOCABULARY\nactivity (n): hoạt động..."
                  disabled={isProcessing}
                  className="w-full min-h-[350px] p-6 font-mono text-sm leading-relaxed resize-y bg-secondary/30 focus-visible:bg-background border-2 border-dashed border-border/80 focus-visible:border-emerald-500 rounded-xl transition-all duration-300"
                />
              </div>
              {error && <p className="text-red-500 mt-2 text-sm font-medium">{error}</p>}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UploadCloud size={18} /> Supports plain text, Markdown, or raw copied Word documents.
              </span>
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 h-auto text-lg rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition-all hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin" /> {t('impProcessing')}
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    {t('impGenerateBtn')} <ArrowRight size={20} />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-in zoom-in-95 duration-500 bg-white dark:bg-black/40 border-emerald-100 dark:border-emerald-900/30 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle size={56} />
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-foreground tracking-tight">{t('impSuccessTitle')}</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
              {t('impSuccessDesc')} <strong className="text-foreground">{generatedLesson?.vocabulary?.length || 0}</strong> {t('impVocabCount')}, <strong className="text-foreground">{generatedLesson?.grammar?.length || 0}</strong> {t('impGrammarCount')}, and <strong className="text-foreground">{generatedLesson?.practice?.length || 0}</strong> {t('impPracticeCount')}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={reset} 
                className="px-8 py-6 h-auto text-lg rounded-xl font-semibold border-border/80 hover:bg-secondary/80"
              >
                {t('impAnotherBtn')}
              </Button>
              <Button 
                onClick={() => setShowPreview(true)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 h-auto text-lg rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
              >
                <PlayCircle size={20} className="mr-2" /> {t('impPreviewBtn')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

