import React, { useState } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CourseEditor({ initialData, onSave, onCancel }) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title || '');
  const [courseId, setCourseId] = useState(initialData?.id || '');
  const [grammar, setGrammar] = useState(initialData?.grammar || []);
  const [phonetics, setPhonetics] = useState(initialData?.phonetics || []);
  
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
      alert("Vui lòng nhập đầy đủ Tên và ID Khóa học!");
      return;
    }

    const courseData = {
      id: courseId.trim(),
      title: title.trim(),
      vocabulary: vocabulary.filter(v => v.word.trim() !== ''),
      grammar,
      phonetics
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
              {isEditing ? 'Chỉnh Sửa Bài Học' : 'Thêm Bài Học Mới'}
            </h1>
            <p className="text-muted-foreground">Điền thông tin chi tiết cho bài học</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="rounded-xl h-12 px-6">Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <Save size={18} /> Lưu Bài Học
          </Button>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-bold">1. Thông tin chung</h2>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Mã bài học (ID) <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="VD: unit-6-community" 
                  value={courseId} 
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={isEditing}
                  className="h-12 bg-slate-50 dark:bg-zinc-950"
                  required
                />
                <p className="text-xs text-muted-foreground ml-1">Dùng làm ID lưu trên hệ thống, không chứa khoảng trắng.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Tên bài học (Title) <span className="text-red-500">*</span></label>
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
            <h2 className="text-lg font-bold">2. Danh sách Từ Vựng</h2>
            <Button type="button" onClick={handleAddVocab} size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1">
              <Plus size={16} /> Thêm từ mới
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
                    <label className="text-xs font-semibold text-muted-foreground">Từ tiếng Anh</label>
                    <Input 
                      placeholder="activity" 
                      value={vocab.word} 
                      onChange={(e) => handleVocabChange(index, 'word', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Loại từ</label>
                    <Input 
                      placeholder="(n), (v), (adj)..." 
                      value={vocab.type} 
                      onChange={(e) => handleVocabChange(index, 'type', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Phiên âm</label>
                    <Input 
                      placeholder="/ækˈtɪv.ɪ.ti/" 
                      value={vocab.transcription} 
                      onChange={(e) => handleVocabChange(index, 'transcription', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Nghĩa tiếng Việt</label>
                    <Input 
                      placeholder="hoạt động" 
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
      </form>
    </div>
  );
}
