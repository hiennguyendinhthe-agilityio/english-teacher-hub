import React, { useState } from 'react';
import { 
  UploadCloud, CheckCircle, Sparkles, Loader2, ArrowRight, 
  PlayCircle, Tv, FileText, Download, RotateCcw, BookOpen, 
  Layers, Check, Copy
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { generateLessonFromText } from '../services/aiService';
import InteractiveLesson from './InteractiveLesson';
import ClassroomPresenter from './ClassroomPresenter';
import { exportToAnkiCsv, exportLessonToWordDoc } from '../utils/exportUtils';
import { soundFX } from '../services/soundEffects';

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
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPresenter, setShowPresenter] = useState(false);
  const [error, setError] = useState('');

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

  const handleApplyPreset = (presetContent) => {
    setText(presetContent);
    setError('');
    soundFX.playFlip();
  };

  const reset = () => {
    setText('');
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-3">
          <Sparkles size={36} className="text-emerald-500 animate-pulse" /> {t('impTitle')}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('impSub')}
        </p>
      </div>

      {!isSuccess ? (
        <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-border/60 shadow-xl overflow-hidden rounded-2xl">
          <CardContent className="p-6 sm:p-8 md:p-10">
            {/* Quick Sample Presets */}
            <div className="mb-6 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 block mb-2.5 flex items-center gap-1.5">
                <Sparkles size={16} /> {t('impSamplesTitle')}
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePresets.map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(preset.content)}
                    className="rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-800 transition-all border-emerald-200 dark:border-emerald-800/60"
                  >
                    + {t(preset.labelKey)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Textarea */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-base sm:text-lg font-bold text-foreground">
                  {t('impPasteLabel')}
                </Label>
                {text && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setText('')} 
                    className="text-xs text-muted-foreground hover:text-destructive h-7"
                  >
                    <RotateCcw size={12} className="mr-1" /> {t('impClearBtn')}
                  </Button>
                )}
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('impPlaceholder')}
                disabled={isProcessing}
                className="w-full min-h-[300px] p-5 font-mono text-sm leading-relaxed resize-y bg-secondary/30 focus-visible:bg-background border-2 border-dashed border-border/80 focus-visible:border-emerald-500 rounded-xl transition-all duration-300"
              />
              {error && <p className="text-red-500 mt-2 text-sm font-medium">{error}</p>}
            </div>

            {/* Submit Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-border/50">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UploadCloud size={18} className="text-emerald-500" /> {t('impSupportText')}
              </span>
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 h-auto text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition-all hover:-translate-y-0.5"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <Loader2 size={22} className="animate-spin" /> {t('impProcessing')}
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Sparkles size={20} /> {t('impGenerateBtn')} <ArrowRight size={18} />
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
            <CardContent className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-border/50 gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <Badge className="bg-emerald-600 text-white font-bold mb-1.5">
                      ✓ {t('impSuccessTitle')}
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {generatedLesson?.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={reset} 
                    className="rounded-xl font-semibold border-border/80 hover:bg-secondary"
                  >
                    <RotateCcw size={16} className="mr-1.5" /> {t('impAnotherBtn')}
                  </Button>
                </div>
              </div>

              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block mb-1">
                    {generatedLesson?.vocabulary?.length || 0}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('impVocabExtracted')}
                  </span>
                </div>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 block mb-1">
                    {generatedLesson?.grammar?.length || 0}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('impGrammarExtracted')}
                  </span>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 block mb-1">
                    {generatedLesson?.phonetics?.length || 0}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('impPhoneticsExtracted')}
                  </span>
                </div>
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 block mb-1">
                    {generatedLesson?.practice?.length || 0}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('impPracticeExtracted')}
                  </span>
                </div>
              </div>

              {/* Quick Vocabulary Preview Chips */}
              <div className="mb-8 bg-secondary/30 p-5 rounded-2xl border border-border/60">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-500" /> {t('impVocabExtracted')} ({generatedLesson?.vocabulary?.length || 0}):
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {(generatedLesson?.vocabulary || []).map((v, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary"
                      className="px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-border/80 shadow-xs flex items-center gap-1.5"
                    >
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{v.word}</strong>
                      <span className="text-muted-foreground text-xs italic">{v.type}</span>
                      <span className="text-foreground/80">: {v.meaning}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <Button 
                  onClick={() => setShowPreview(true)} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 h-auto rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <PlayCircle size={20} /> {t('impPreviewBtn')}
                </Button>

                <Button 
                  onClick={() => setShowPresenter(true)} 
                  variant="outline"
                  className="py-6 h-auto rounded-xl font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Tv size={20} /> {t('impPresenterBtn')}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => exportLessonToWordDoc(generatedLesson)}
                  className="py-6 h-auto rounded-xl font-semibold border-border/80 hover:bg-secondary hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <FileText size={18} className="text-blue-500" /> {t('impExportWord')}
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => exportToAnkiCsv(generatedLesson.vocabulary, generatedLesson.title)}
                  className="py-6 h-auto rounded-xl font-semibold border-border/80 hover:bg-secondary hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Download size={18} className="text-purple-500" /> {t('impExportAnki')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
