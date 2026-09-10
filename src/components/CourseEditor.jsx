import React, { useState } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft, GripVertical, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CourseEditor({ initialData, onSave, onCancel, onSwitchToAI }) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title || '');
  const [courseId, setCourseId] = useState(initialData?.id || '');
  const [grammarStr, setGrammarStr] = useState(JSON.stringify(initialData?.grammar || [], null, 2));
  const [phoneticsStr, setPhoneticsStr] = useState(JSON.stringify(initialData?.phonetics || [], null, 2));
  const [practiceStr, setPracticeStr] = useState(JSON.stringify(initialData?.practice || [], null, 2));
  
  // Vocabulary State
  const [vocabulary, setVocabulary] = useState(initialData?.vocabulary || [
    { word: '', transcription: '', type: '(n)', meaning: '' }
  ]);

  const handleAddVocab = () => {
    setVocabulary([...vocabulary, { word: '', transcription: '', type: '(n)', meaning: '' }]);
  };

  const handleRemoveVocab = (index) => {
    const newVocab = vocabulary.filter((_, idx) => idx !== index);
    setVocabulary(newVocab);
  };

  const handleVocabChange = (index, field, value) => {
    const newVocab = [...vocabulary];
    newVocab[index][field] = value;
    setVocabulary(newVocab);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !courseId.trim()) {
      alert("Please enter both Course Name and ID!");
      return;
    }

    let parsedGrammar = [];
    let parsedPhonetics = [];
    let parsedPractice = [];
    try {
      parsedGrammar = JSON.parse(grammarStr);
      parsedPhonetics = JSON.parse(phoneticsStr);
      parsedPractice = JSON.parse(practiceStr);
    } catch (err) {
      alert("JSON syntax error in Grammar, Pronunciation or Exercises! Please check again.");
      return;
    }

    const courseData = {
      id: courseId.trim(),
      title: title.trim(),
      vocabulary: vocabulary.filter(v => v.word.trim() !== ''),
      grammar: parsedGrammar,
      phonetics: parsedPhonetics,
      practice: parsedPractice
    };

    onSave(courseData);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold mb-1">
              {isEditing ? 'Edit Lesson' : 'Add New Lesson'}
            </h1>
            <p className="text-muted-foreground">Enter lesson details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="rounded-xl h-12 px-6">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <Save size={18} /> Save Lesson
          </Button>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* AI Banner */}
        {!isEditing && onSwitchToAI && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                <Sparkles size={24} className="text-yellow-300" /> Auto-generate with AI?
              </h2>
              <p className="text-emerald-50 text-sm">Just upload a textbook image or type a prompt, and AI will automatically fill this entire form for you!</p>
            </div>
            <Button type="button" onClick={onSwitchToAI} className="bg-white text-emerald-600 hover:bg-slate-50 font-bold whitespace-nowrap px-6">
              Switch to AI now
            </Button>
          </div>
        )}

        {/* Basic Info */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-bold">1. General Information</h2>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Lesson ID <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="VD: unit-6-community" 
                  value={courseId} 
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={isEditing}
                  className="h-12 bg-slate-50 dark:bg-zinc-950"
                  required
                />
                <p className="text-xs text-muted-foreground ml-1">Used as system ID, no spaces allowed.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Lesson Title <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="VD: Unit 6: COMMUNITY SERVICE" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 bg-slate-50 dark:bg-zinc-950"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary Builder */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50 flex justify-between items-center">
            <h2 className="text-lg font-bold">2. Vocabulary List</h2>
            <Button type="button" onClick={handleAddVocab} size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1">
              <Plus size={16} /> Add new word
            </Button>
          </div>
          <CardContent className="p-6 space-y-4">
            {vocabulary.map((vocab, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-slate-50 dark:bg-zinc-950/30 group">
                <div className="mt-3 text-slate-300 dark:text-zinc-700 cursor-move">
                  <GripVertical size={20} />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">English Word</label>
                    <Input 
                      placeholder="activity" 
                      value={vocab.word} 
                      onChange={(e) => handleVocabChange(index, 'word', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Word Type</label>
                    <Input 
                      placeholder="(n), (v), (adj)..." 
                      value={vocab.type} 
                      onChange={(e) => handleVocabChange(index, 'type', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Phonetics</label>
                    <Input 
                      placeholder="/ækˈtɪv.ɪ.ti/" 
                      value={vocab.transcription} 
                      onChange={(e) => handleVocabChange(index, 'transcription', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Meaning</label>
                    <Input 
                      placeholder="activity" 
                      value={vocab.meaning} 
                      onChange={(e) => handleVocabChange(index, 'meaning', e.target.value)} 
                    />
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveVocab(index)}
                  className="mt-6 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Practice (Advanced JSON) */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-bold">3. 4-Skill Exercises (Advanced JSON)</h2>
            <p className="text-xs text-muted-foreground mt-1">Supports Reading, Writing, and Multiple Choice. AI auto-generation recommended.</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <Textarea 
              value={practiceStr}
              onChange={(e) => setPracticeStr(e.target.value)}
              className="font-mono text-xs min-h-[300px] bg-slate-900 text-yellow-400 p-4 rounded-xl"
            />
          </CardContent>
        </Card>

        {/* Grammar & Phonetics (Advanced JSON) */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-bold">4. Grammar & Pronunciation (Advanced)</h2>
            <p className="text-xs text-muted-foreground mt-1">Raw JSON data structure. AI auto-generation recommended for this section.</p>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Grammar Structure (JSON Array)</label>
              <Textarea 
                value={grammarStr}
                onChange={(e) => setGrammarStr(e.target.value)}
                className="font-mono text-xs min-h-[200px] bg-slate-900 text-green-400 p-4 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Pronunciation Structure (JSON Array)</label>
              <Textarea 
                value={phoneticsStr}
                onChange={(e) => setPhoneticsStr(e.target.value)}
                className="font-mono text-xs min-h-[150px] bg-slate-900 text-blue-400 p-4 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
