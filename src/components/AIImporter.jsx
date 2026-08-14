import React, { useState, useRef } from 'react';
import { 
  UploadCloud, CheckCircle, Sparkles, Loader2, ArrowRight, 
  PlayCircle, Tv, FileText, Download, RotateCcw, BookOpen, 
  Layers, Check, Copy, FileUp, X, FileCode, Brain, SpellCheck, PenTool, FolderPlus
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLessonFromText } from '../services/aiService';
import InteractiveLesson from './InteractiveLesson';
import ClassroomPresenter from './ClassroomPresenter';
import AILoadingOverlay from './AILoadingOverlay';
import { useAIStore } from '../store/useAIStore';
import { exportToAnkiCsv, exportLessonToWordDoc } from '../utils/exportUtils';
import { parseUploadedFile } from '../utils/fileParser';
import { soundFX } from '../services/soundEffects';
import { cn } from '@/lib/utils';

const SAMPLE_PRESETS_VI = [
  {
    key: 'community',
    labelKey: 'impSample1',
    content: `Unit 6: COMMUNITY SERVICE & VOLUNTEERING
VOCABULARY
volunteer (n, v): người tình nguyện, làm tình nguyện
donate (v): quyên góp, ủng hộ
community service (n): dịch vụ công ích cộng đồng
orphanage (n): trại trẻ mồ côi
elderly people (n): người cao tuổi
recycle (v): tái chế rác thải
encourage (v): khuyến khích, động viên

GRAMMAR: The Past Simple Tense (Thì Quá Khứ Đơn)
- Cách dùng: Diễn tả hành động đã xảy ra và kết thúc trong quá khứ.
- Khẳng định (+): S + V2/ed (E.g., We collected warm clothes yesterday)
- Phủ định (-): S + did not + V (base) (E.g., They didn't go to the shelter)
- Nghi vấn (?): Did + S + V (base)? (E.g., Did you donate books?)

PHONETICS: Sounds /t/, /d/, and /ɪd/ for past verb endings (-ed)
- /t/ after voiceless sounds: helped, cooked
- /d/ after voiced sounds: cleaned, volunteered
- /ɪd/ after /t/ and /d/: donated, needed`
  },
  {
    key: 'aiTech',
    labelKey: 'impSample2',
    content: `Special Unit: ARTIFICIAL INTELLIGENCE & FUTURE TECH
VOCABULARY
artificial intelligence (n): trí tuệ nhân tạo (AI)
automation (n): sự tự động hóa quy trình
algorithm (n): thuật toán xử lý dữ liệu
breakthrough (n): bước đột phá công nghệ
innovative (adj): mang tính đổi mới sáng tạo
transform (v): chuyển đổi, biến đổi mạnh mẽ
virtual reality (n): thực tế ảo (VR)
efficient (adj): đạt năng suất và hiệu quả cao

GRAMMAR: Future Possibility with MODAL VERBS (May / Might / Could)
- Usage: Expressing future predictions and possibilities with different degrees of certainty.
- Affirmative (+): Subject + may/might/could + Verb (base form)
- Example: AI might replace repetitive manual tasks in the next decade.`
  },
  {
    key: 'business',
    labelKey: 'impSample3',
    content: `Mastery Unit: BUSINESS ENGLISH & JOB INTERVIEWS
VOCABULARY
candidate (n): ứng viên ứng tuyển
qualification (n): bằng cấp, chứng chỉ chuyên môn
interpersonal skills (n): kỹ năng giao tiếp ứng xử
negotiate (v): đàm phán thương lượng
responsibility (n): trách nhiệm công việc
collaborate (v): phối hợp làm việc cùng nhau
achieve (v): hoàn thành mục tiêu đặt ra
professional (adj): có tác phong chuyên nghiệp

GRAMMAR: First Conditional with Modal Verbs in Business
- Formula: If + S + Present Simple, S + can/should/must + V (base)
- Example: If you demonstrate strong interpersonal skills, you can convince the hiring manager.`
  }
];

const SAMPLE_PRESETS_EN = [
  {
    key: 'community',
    labelKey: 'impSample1',
    content: `Unit 6: COMMUNITY SERVICE & VOLUNTEERING
VOCABULARY
volunteer (n, v): person working willingly without payment
donate (v): give money or goods to help others
community service (n): unpaid work intended to help people in the area
orphanage (n): residential institution for the care of orphans
elderly people (n): old people considered as a group
recycle (v): convert waste into reusable material
encourage (v): give support, confidence, or hope

GRAMMAR: The Past Simple Tense
- Usage: Expresses completed actions at a specific time in the past.
- Affirmative (+): S + V2/ed (E.g., We collected warm clothes yesterday)
- Negative (-): S + did not + V (base) (E.g., They didn't go to the shelter)
- Interrogative (?): Did + S + V (base)? (E.g., Did you donate books?)

PHONETICS: Pronunciation of -ed endings (/t/, /d/, /ɪd/)
- /t/ after voiceless consonants: helped, cooked
- /d/ after voiced consonants: cleaned, volunteered
- /ɪd/ after /t/ and /d/: donated, needed`
  },
  {
    key: 'aiTech',
    labelKey: 'impSample2',
    content: `Special Unit: ARTIFICIAL INTELLIGENCE & FUTURE TECH
VOCABULARY
artificial intelligence (n): computer systems able to perform human tasks
automation (n): use of automatic equipment in manufacturing/processes
algorithm (n): process or set of rules followed in calculations
breakthrough (n): sudden, dramatic, and important discovery
innovative (adj): featuring new methods; advanced and original
transform (v): make a thorough or dramatic change
virtual reality (n): computer-generated simulation of a 3D image/environment
efficient (adj): achieving maximum productivity with minimum wasted effort

GRAMMAR: Modal Verbs for Future Possibility (May / Might / Could)
- Usage: Expressing hypothetical future scenarios and predictions.
- Structure: Subject + may/might/could + Verb (base form)
- Example: AI systems might revolutionize medical diagnosis in the coming decade.`
  },
  {
    key: 'business',
    labelKey: 'impSample3',
    content: `Mastery Unit: BUSINESS ENGLISH & JOB INTERVIEWS
VOCABULARY
candidate (n): person who applies for a job or vacancy
qualification (n): official pass in an exam or course of study
interpersonal skills (n): skills used to interact and communicate with others
negotiate (v): obtain or bring about by discussion
responsibility (n): state of having a duty to deal with something
collaborate (v): work jointly on an activity or project
achieve (v): successfully bring about or reach a goal
professional (adj): competent or skilled in a field of work

GRAMMAR: First Conditional with Business Modal Verbs
- Formula: If + Subject + Present Simple, Subject + can/should/must + V (base)
- Example: If you showcase practical achievements, you can impress the interviewer.`
  }
];

export default function AIImporter({ setActiveTab }) {
  const { t, lang } = useLanguage();
  const samplePresets = lang === 'en' ? SAMPLE_PRESETS_EN : SAMPLE_PRESETS_VI;

  // Connect to Zustand store
  const {
    importerParams,
    setImporterParams,
    importerData: generatedLesson,
    setImporterData: setGeneratedLesson,
    savedLessons,
    saveLesson
  } = useAIStore();

  const { text } = importerParams;

  const isSaved = generatedLesson && savedLessons.some(l => l.id === generatedLesson.id);

  const [inputMode, setInputMode] = useState('paste');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPresenter, setShowPresenter] = useState(false);
  const [error, setError] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const IMPORTER_STEPS = [
    { icon: FileText,   labelKey: 'aiStepParseText' },
    { icon: BookOpen,   labelKey: 'aiStepExtractVocab' },
    { icon: Layers,     labelKey: 'aiStepBuildGrammar' },
    { icon: PenTool,    labelKey: 'aiStepGenPractice' },
  ];


  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const lessonData = await generateLessonFromText(text);
      setGeneratedLesson(lessonData);
      setIsSuccess(true);
      soundFX.playSuccess();
    } catch (err) {
      setError(err.message || 'Failed to process lesson');
      soundFX.playError();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (presetContent) => {
    setImporterParams({ text: presetContent });
    setInputMode('paste');
    setError('');
    soundFX.playFlip();
  };

  const readFileContent = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setError('');
    setIsReadingFile(true);

    try {
      const cleanContent = await parseUploadedFile(file);
      if (cleanContent) {
        setImporterParams({ text: cleanContent });
        setInputMode('paste');
      }
      soundFX.playFlip();
    } catch (err) {
      setError(err.message || 'Failed to read document file');
      soundFX.playError();
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      readFileContent(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setImporterParams({ text: '' });
    setUploadedFile(null);
    setIsSuccess(false);
    setGeneratedLesson(null);
    setShowPreview(false);
    setShowPresenter(false);
    setError('');
  };

  if (showPresenter && generatedLesson) {
    return <ClassroomPresenter lessonData={generatedLesson} onExit={() => setShowPresenter(false)} />;
  }

  if (showPreview && generatedLesson) {
    return <InteractiveLesson lessonData={generatedLesson} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto px-1 sm:px-4">
      <AILoadingOverlay
        isVisible={isProcessing}
        steps={IMPORTER_STEPS}
        title={t('aiLoadingTitle')}
        subtitle={t('aiLoadingSubtitle')}
        estimatedSeconds={12}
      />
      {/* Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-3 text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-2.5">
          <Sparkles size={32} className="text-emerald-500 animate-pulse shrink-0" /> {t('impTitle')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('impSub')}
        </p>
      </div>

      {!isSuccess ? (
        <Card className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-border/70 shadow-xl overflow-hidden rounded-2xl">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Quick Sample Presets */}
            <div className="mb-6 bg-emerald-50/70 dark:bg-emerald-950/25 p-3.5 sm:p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 block mb-2 flex items-center gap-1.5">
                <Sparkles size={15} /> {t('impSamplesTitle')}
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePresets.map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadSample(preset.content)}
                    className="rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 transition-all border-emerald-200 dark:border-emerald-800/60 h-8 px-2.5"
                  >
                    + {t(preset.labelKey)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Mode Selector Tabs */}
            <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-xl w-fit mb-5 border border-border/50">
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5",
                  inputMode === 'paste' 
                    ? "bg-white dark:bg-slate-800 text-foreground shadow-xs font-bold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileCode size={15} /> {t('impPasteTab')}
              </button>
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5",
                  inputMode === 'upload' 
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileUp size={15} /> {t('impUploadTab')}
              </button>
            </div>

            {/* Mode 1: Paste Text */}
            {inputMode === 'paste' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm sm:text-base font-bold text-foreground">
                    {t('impPasteLabel')}
                  </Label>
                  {text && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setImporterParams({ text: '' })} 
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 -mr-2"
                    >
                      <RotateCcw size={12} className="mr-1" /> {t('impClearBtn')}
                    </Button>
                  )}
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setImporterParams({ text: e.target.value })}
                  placeholder={t('impPlaceholder')}
                  disabled={isProcessing}
                  className="w-full min-h-[260px] sm:min-h-[320px] p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed resize-y bg-secondary/30 focus-visible:bg-background border-2 border-dashed border-border/80 focus-visible:border-emerald-500 rounded-xl transition-all duration-300"
                />
              </div>
            )}

            {/* Mode 2: Drag & Drop File Upload */}
            {inputMode === 'upload' && (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full min-h-[220px] sm:min-h-[260px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200",
                    isDragging 
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 scale-[0.99]" 
                      : "border-border/80 hover:border-emerald-500 hover:bg-secondary/30 bg-secondary/15"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.docx,.pdf,.csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                    {isReadingFile ? (
                      <Loader2 size={30} className="animate-spin" />
                    ) : (
                      <UploadCloud size={30} />
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
                    {isReadingFile ? t('impExtractingFile') : t('impDropzoneText')}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mb-4">
                    {t('impDropzoneSub')}
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl font-semibold border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 pointer-events-none"
                  >
                    <FileUp size={15} className="mr-1.5" /> {t('impUploadBtn')}
                  </Button>
                </div>

                {/* Uploaded File Chip & Text Preview */}
                {uploadedFile && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={18} className="text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                            {uploadedFile.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB · {t('impFileLoaded')}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive shrink-0"
                        title={t('impRemoveFile')}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    {text && (
                      <div className="p-3 bg-secondary/20 rounded-xl border border-border/50 max-h-36 overflow-y-auto font-mono text-xs text-muted-foreground leading-relaxed">
                        {text.slice(0, 350)}...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-500 mb-4 text-xs sm:text-sm font-medium">{error}</p>}

            {/* Submit Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground flex items-center gap-2 text-center sm:text-left">
                <UploadCloud size={16} className="text-emerald-500 shrink-0 hidden sm:inline" /> {t('impSupportText')}
              </span>
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-5 h-auto text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition-all hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    {t('impProcessing')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={18} /> {t('impGenerateBtn')} <ArrowRight size={16} />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Result Dashboard */
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <Card className="bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/40 shadow-2xl overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <CardContent className="p-4 sm:p-8 md:p-10">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 mb-6 border-b border-border/50 gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <CheckCircle size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge className="bg-emerald-600 text-white font-bold mb-1 text-xs">
                      ✓ {t('impSuccessTitle')}
                    </Badge>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight break-words">
                      {generatedLesson?.title}
                    </h2>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row justify-end gap-2 shrink-0">
                  <Button
                    variant={isSaved ? "secondary" : "default"}
                    size="sm"
                    onClick={() => saveLesson(generatedLesson)}
                    disabled={isSaved}
                    className={`w-full sm:w-auto rounded-xl font-semibold h-9 ${
                      isSaved ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isSaved ? <CheckCircle size={15} className="mr-1.5" /> : <FolderPlus size={15} className="mr-1.5" />} 
                    {isSaved ? t('impSaved') : t('impSaveToCourse')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReset} 
                    className="w-full sm:w-auto rounded-xl font-semibold border-border/80 hover:bg-secondary h-9"
                  >
                    <RotateCcw size={15} className="mr-1.5" /> {t('impAnotherBtn')}
                  </Button>
                </div>
              </div>

              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 sm:p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center min-w-0 overflow-hidden">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 block mb-0.5">
                    {generatedLesson?.vocabulary?.length || 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight block break-words">
                    {t('impVocabExtracted')}
                  </span>
                </div>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 sm:p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center min-w-0 overflow-hidden">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    {generatedLesson?.grammar?.length || 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight block break-words">
                    {t('impGrammarExtracted')}
                  </span>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 sm:p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 text-center min-w-0 overflow-hidden">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-purple-600 dark:text-purple-400 block mb-0.5">
                    {generatedLesson?.phonetics?.length || 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight block break-words">
                    {t('impPhoneticsExtracted')}
                  </span>
                </div>
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 sm:p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center min-w-0 overflow-hidden">
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 block mb-0.5">
                    {generatedLesson?.practice?.length || 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight block break-words">
                    {t('impPracticeExtracted')}
                  </span>
                </div>
              </div>

              {/* Quick Vocabulary Preview Chips */}
              <div className="mb-6 bg-secondary/30 p-4 sm:p-5 rounded-2xl border border-border/60">
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-500" /> {t('impVocabExtracted')} ({generatedLesson?.vocabulary?.length || 0}):
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {(generatedLesson?.vocabulary || []).map((v, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-border/80 shadow-xs inline-flex flex-wrap items-center gap-1 max-w-full"
                    >
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{v.word}</strong>
                      <span className="text-muted-foreground text-[11px] italic">{v.type}</span>
                      <span className="text-foreground/80 break-words">: {v.meaning}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Responsive Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <Button 
                  onClick={() => setShowPreview(true)} 
                  className="w-full py-4 px-3 h-auto min-h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 text-center whitespace-normal leading-snug"
                >
                  <PlayCircle size={18} className="shrink-0" /> 
                  <span className="break-words">{t('impPreviewBtn')}</span>
                </Button>

                <Button 
                  onClick={() => setShowPresenter(true)} 
                  variant="outline"
                  className="w-full py-4 px-3 h-auto min-h-[50px] rounded-xl font-bold border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 text-center whitespace-normal leading-snug"
                >
                  <Tv size={18} className="shrink-0" /> 
                  <span className="break-words">{t('impPresenterBtn')}</span>
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => exportLessonToWordDoc(generatedLesson)}
                  className="w-full py-4 px-3 h-auto min-h-[50px] rounded-xl font-semibold border-border/80 hover:bg-secondary hover:-translate-y-0.5 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 text-center whitespace-normal leading-snug"
                >
                  <FileText size={17} className="text-blue-500 shrink-0" /> 
                  <span className="break-words">{t('impExportWord')}</span>
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => exportToAnkiCsv(generatedLesson.vocabulary, generatedLesson.title)}
                  className="w-full py-4 px-3 h-auto min-h-[50px] rounded-xl font-semibold border-border/80 hover:bg-secondary hover:-translate-y-0.5 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 text-center whitespace-normal leading-snug"
                >
                  <Download size={17} className="text-purple-500 shrink-0" /> 
                  <span className="break-words">{t('impExportAnki')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
