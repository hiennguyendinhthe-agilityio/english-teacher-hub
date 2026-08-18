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
  const [practice, setPractice] = useState(initialData?.practice || []);
  
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

  // Practice State Handlers
  const handleAddPractice = () => {
    setPractice([...practice, { id: practice.length + 1, question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
  };
  const handleRemovePractice = (index) => {
    setPractice(practice.filter((_, idx) => idx !== index));
  };
  const handlePracticeChange = (index, field, value) => {
    const newPractice = [...practice];
    newPractice[index][field] = value;
    setPractice(newPractice);
  };
  const handleOptionChange = (qIndex, optIndex, value) => {
    const newPractice = [...practice];
    newPractice[qIndex].options[optIndex] = value;
    setPractice(newPractice);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !courseId.trim()) {
      alert("Vui lòng nhập đầy đủ Tên và ID Khóa học!");
      return;
    }

    let parsedGrammar = [];
    let parsedPhonetics = [];
    try {
      parsedGrammar = JSON.parse(grammarStr);
      parsedPhonetics = JSON.parse(phoneticsStr);
    } catch (err) {
      alert("Lỗi cú pháp JSON ở phần Ngữ Pháp hoặc Phát Âm! Vui lòng kiểm tra lại.");
      return;
    }

    const courseData = {
      id: courseId.trim(),
      title: title.trim(),
      vocabulary: vocabulary.filter(v => v.word.trim() !== ''),
      grammar: parsedGrammar,
      phonetics: parsedPhonetics,
      practice: practice.filter(p => p.question.trim() !== '')
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
        
        {/* AI Banner */}
        {!isEditing && onSwitchToAI && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                <Sparkles size={24} className="text-yellow-300" /> Tạo tự động bằng Trí Tuệ Nhân Tạo?
              </h2>
              <p className="text-emerald-50 text-sm">Chỉ cần tải lên 1 bức ảnh sách giáo khoa hoặc gõ 1 câu lệnh, AI sẽ tự động điền toàn bộ Form này cho bạn!</p>
            </div>
            <Button type="button" onClick={onSwitchToAI} className="bg-white text-emerald-600 hover:bg-slate-50 font-bold whitespace-nowrap px-6">
              Chuyển sang AI ngay
            </Button>
          </div>
        )}

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

        {/* Practice Editor */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50 flex justify-between items-center">
            <h2 className="text-lg font-bold">3. Danh sách Bài Tập (Practice)</h2>
            <Button type="button" onClick={handleAddPractice} size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1">
              <Plus size={16} /> Thêm câu hỏi
            </Button>
          </div>
          <CardContent className="p-6 space-y-4">
            {practice.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">Chưa có bài tập nào. Hãy nhấn "Thêm câu hỏi" hoặc dùng AI để tạo tự động.</p>
            )}
            {practice.map((q, qIndex) => (
              <div key={qIndex} className="p-4 rounded-xl border border-border/50 bg-slate-50 dark:bg-zinc-950/30 relative group">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemovePractice(qIndex)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </Button>
                <div className="space-y-4 pr-8">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Câu hỏi {qIndex + 1}</label>
                    <Input 
                      placeholder="Nhập nội dung câu hỏi..." 
                      value={q.question} 
                      onChange={(e) => handlePracticeChange(qIndex, 'question', e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <span className="text-sm font-bold w-6">{String.fromCharCode(65 + optIndex)}.</span>
                        <Input 
                          placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`} 
                          value={opt} 
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} 
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">Đáp án đúng</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={q.correctAnswer}
                        onChange={(e) => handlePracticeChange(qIndex, 'correctAnswer', parseInt(e.target.value))}
                      >
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">Giải thích (tùy chọn)</label>
                      <Input 
                        placeholder="Vì sao chọn đáp án này?" 
                        value={q.explanation || ''} 
                        onChange={(e) => handlePracticeChange(qIndex, 'explanation', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Grammar & Phonetics (Advanced JSON) */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-950/50 px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-bold">4. Ngữ Pháp & Phát Âm (Nâng cao)</h2>
            <p className="text-xs text-muted-foreground mt-1">Cấu trúc dữ liệu JSON thô. Khuyến cáo nên dùng AI để sinh tự động phần này.</p>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Cấu trúc Ngữ Pháp (JSON Array)</label>
              <Textarea 
                value={grammarStr}
                onChange={(e) => setGrammarStr(e.target.value)}
                className="font-mono text-xs min-h-[200px] bg-slate-900 text-green-400 p-4 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Cấu trúc Phát Âm (JSON Array)</label>
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
