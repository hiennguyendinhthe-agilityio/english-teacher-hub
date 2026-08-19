import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sendChatMessage } from '../services/chatService';
import { useLanguage } from '../context/LanguageContext';

export default function AIChatBot() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const initialGreeting = isEn
    ? "Hello! I am Ms Van's AI Assistant. How can I assist with your English studies or teaching toolkit today?"
    : "Xin chào! Mình là Trợ lý AI của Ms Van's English Class. Mình có thể giúp gì cho việc học hoặc giảng dạy tiếng Anh của bạn hôm nay?";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: initialGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickChips = isEn
    ? [
        { label: '🎴 Flashcards Guide', query: 'How do I use Flashcard Builder?' },
        { label: '📑 AI Importer', query: 'How to create lessons with AI Importer?' },
        { label: '✍️ Essay Grader', query: 'How does Essay Grader work?' },
        { label: '📄 PDF Worksheet', query: 'How to export worksheets to PDF?' },
        { label: '🏫 Unit 1 Summary', query: 'Tell me about Unit 1: My New School' },
        { label: '💡 Present Simple', query: 'Explain the Present Simple tense' }
      ]
    : [
        { label: '🎴 Học từ vựng', query: 'Cách học từ vựng bằng Flashcard Builder?' },
        { label: '📑 Tạo bài học AI', query: 'Làm sao để soạn giáo án bằng AI Importer?' },
        { label: '✍️ Chấm bài luận', query: 'Cách sử dụng tính năng Essay Grader?' },
        { label: '📄 In đề thi PDF', query: 'Cách in phiếu bài tập PDF Worksheet?' },
        { label: '🏫 Tóm tắt Unit 1', query: 'Tóm tắt bài học Unit 1: My New School' },
        { label: '💡 Thì hiện tại đơn', query: 'Cách dùng thì hiện tại đơn tiếng Anh' }
      ];

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSendQuery = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const newMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      // Simulate quick natural thinking time
      await new Promise(r => setTimeout(r, 300));
      const reply = await sendChatMessage(messages, textToSend);
      setMessages([...newMessages, { role: 'ai', text: reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', text: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const handleReset = () => {
    setMessages([{ role: 'ai', text: initialGreeting }]);
  };

  // Helper để format Markdown cơ bản (in đậm, ngắt dòng)
  const renderFormattedText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Chat Window */}
      <div 
        className={cn(
          "fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[540px] max-h-[85vh] bg-background/95 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-900/40 rounded-3xl shadow-2xl flex flex-col z-[100] transition-all duration-300 origin-bottom-right overflow-hidden",
          isOpen ? "scale-100 opacity-100 shadow-indigo-500/20" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                Ms Van's AI Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-white/80 font-normal">
                {isEn ? "Smart E-Learning Guide (Instant 0s)" : "Trợ lý ảo học tập & soạn bài (0đ)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleReset}
              title={isEn ? "Reset chat" : "Làm mới đoạn chat"}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Action Chips Bar */}
        <div className="px-3 py-2 bg-indigo-50/60 dark:bg-zinc-900/60 border-b border-indigo-100/50 dark:border-zinc-800 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1">
            <Sparkles size={12} /> {isEn ? "Suggested:" : "Gợi ý:"}
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(chip.query)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-foreground rounded-full border border-indigo-200/60 dark:border-zinc-700 whitespace-nowrap transition-all shadow-xs shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-950/50">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex gap-3 max-w-[88%] animate-in fade-in slide-in-from-bottom-2 duration-200",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white border-indigo-700" 
                  : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-400/30"
              )}>
                {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className={cn(
                "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none font-medium" 
                  : "bg-white dark:bg-zinc-900 text-foreground border border-slate-200/70 dark:border-zinc-800 rounded-tl-none"
              )}>
                {renderFormattedText(msg.text)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <Bot size={15} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-tl-none shadow-xs flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Loader2 size={15} className="animate-spin text-indigo-600" />
                <span>{isEn ? "AI is thinking..." : "Trợ lý đang suy nghĩ..."}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white/90 dark:bg-zinc-900/90 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEn ? "Ask me anything about English or website tools..." : "Hỏi về từ vựng, ngữ pháp, hoặc tính năng web..."}
              className="w-full bg-slate-100/80 dark:bg-zinc-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm resize-none h-[48px] overflow-hidden transition-all"
              rows={1}
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center z-[100] transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
      >
        <MessageSquare size={24} className={cn("transition-transform duration-300", isOpen && "rotate-90 scale-90")} />
      </Button>
    </>
  );
}
