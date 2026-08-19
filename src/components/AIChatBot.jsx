import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sendChatMessage } from '../services/chatService';
import { getSmartFollowUpSuggestions } from '../services/smartChatEngine';
import { useLanguage } from '../context/LanguageContext';

export default function AIChatBot() {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const initialGreeting = t('chatBotGreeting') || (isEn
    ? "Hello! I am Ms Van's AI Assistant. How can I assist with your English studies or teaching toolkit today?"
    : "Xin chào! Mình là Trợ lý AI của Ms Van's English Class. Mình có thể giúp gì cho việc học hoặc giảng dạy tiếng Anh của bạn hôm nay?");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: initialGreeting,
      suggestions: isEn 
        ? ['🎴 Flashcards Guide', '📑 AI Importer', '🏫 Unit 1: My New School', '💡 Present Simple Tense']
        : ['🎴 Học từ vựng Flashcard', '📑 Tạo bài học AI', '🏫 Tóm tắt Unit 1', '💡 Thì hiện tại đơn']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cập nhật câu chào ban đầu khi người dùng đổi ngôn ngữ (nếu chưa chat)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'ai') {
      setMessages([
        {
          role: 'ai',
          text: initialGreeting,
          suggestions: isEn 
            ? ['🎴 Flashcards Guide', '📑 AI Importer', '🏫 Unit 1: My New School', '💡 Present Simple Tense']
            : ['🎴 Học từ vựng Flashcard', '📑 Tạo bài học AI', '🏫 Tóm tắt Unit 1', '💡 Thì hiện tại đơn']
        }
      ]);
    }
  }, [language, initialGreeting, isEn]);

  const quickChips = [
    { label: t('chatBotChipFlashcards') || '🎴 Học từ vựng', query: isEn ? 'How do I use Flashcard Builder?' : 'Cách học từ vựng bằng Flashcard Builder?' },
    { label: t('chatBotChipAIImporter') || '📑 Tạo bài học AI', query: isEn ? 'How to create lessons with AI Importer?' : 'Làm sao để soạn giáo án bằng AI Importer?' },
    { label: t('chatBotChipEssay') || '✍️ Chấm bài luận', query: isEn ? 'How does Essay Grader work?' : 'Cách sử dụng tính năng Essay Grader?' },
    { label: t('chatBotChipWorksheet') || '📄 In đề thi PDF', query: isEn ? 'How to export worksheets to PDF?' : 'Cách in phiếu bài tập PDF Worksheet?' },
    { label: t('chatBotChipUnit1') || '🏫 Tóm tắt Unit 1', query: isEn ? 'Tell me about Unit 1: My New School' : 'Tóm tắt bài học Unit 1: My New School' },
    { label: t('chatBotChipGrammar') || '💡 Thì hiện tại đơn', query: isEn ? 'Explain the Present Simple tense' : 'Cách dùng thì hiện tại đơn tiếng Anh' }
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
      // Giả lập thời gian suy nghĩ tự nhiên ngắn
      await new Promise(r => setTimeout(r, 250));
      const reply = await sendChatMessage(messages, textToSend, language);
      const followUpSuggestions = getSmartFollowUpSuggestions(textToSend, language);

      setMessages([
        ...newMessages, 
        { 
          role: 'ai', 
          text: reply,
          suggestions: followUpSuggestions
        }
      ]);
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
    setMessages([
      { 
        role: 'ai', 
        text: initialGreeting,
        suggestions: isEn 
          ? ['🎴 Flashcards Guide', '📑 AI Importer', '🏫 Unit 1: My New School', '💡 Present Simple Tense']
          : ['🎴 Học từ vựng Flashcard', '📑 Tạo bài học AI', '🏫 Tóm tắt Unit 1', '💡 Thì hiện tại đơn']
      }
    ]);
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
        id="ai-chatbot-window"
        className={cn(
          "fixed inset-x-3 bottom-18 sm:inset-auto sm:bottom-24 sm:right-6 w-auto sm:w-[420px] h-[66vh] max-h-[510px] sm:h-[540px] sm:max-h-[80vh] bg-background/95 backdrop-blur-xl border border-indigo-200/60 dark:border-indigo-900/50 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col z-[100] transition-all duration-300 origin-bottom-right overflow-hidden",
          isOpen ? "scale-100 opacity-100 shadow-indigo-500/25" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3.5 py-3 sm:p-4 flex justify-between items-center text-white shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                {t('chatBotTitle') || "Ms Van's AI Assistant"}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title={t('chatBotOnlineBadge') || "Online"}></span>
              </div>
              <p className="text-[11px] text-white/80 font-normal">
                {t('chatBotSubtitle') || (isEn ? "Smart E-Learning Guide" : "Trợ lý ảo học tập & soạn bài")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              id="chatbot-reset-btn"
              onClick={handleReset}
              title={t('chatBotResetTooltip') || (isEn ? "Reset chat" : "Làm mới đoạn chat")}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              id="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title={t('chatBotCloseTooltip') || (isEn ? "Close chat" : "Đóng cửa sổ chat")}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Top Quick Action Chips Bar */}
        <div className="px-3 py-2 bg-indigo-50/70 dark:bg-zinc-900/70 border-b border-indigo-100/60 dark:border-zinc-800 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1">
            <Sparkles size={12} /> {t('chatBotSuggested') || (isEn ? "Suggested:" : "Gợi ý:")}
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(chip.query)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-foreground rounded-full border border-indigo-200/70 dark:border-zinc-700 whitespace-nowrap transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-950/50">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div 
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

              {/* Interactive Follow-Up Suggestion Chips for AI messages */}
              {msg.role === 'ai' && msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && !isLoading && (
                <div className="ml-11 flex flex-wrap gap-1.5 pt-1 animate-in fade-in duration-300">
                  <div className="w-full text-[11px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
                    <span>{t('chatBotFollowUpTitle') || (isEn ? "Suggested next steps:" : "Bạn có muốn tìm hiểu thêm:")}</span>
                  </div>
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendQuery(sug)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>{sug}</span>
                      <ArrowRight size={11} className="opacity-70" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <Bot size={15} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-tl-none shadow-xs flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Loader2 size={15} className="animate-spin text-indigo-600" />
                <span>{t('chatBotThinking') || (isEn ? "AI is thinking..." : "Trợ lý đang suy nghĩ...")}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white/95 dark:bg-zinc-900/95 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="relative flex items-center">
            <textarea
              id="ai-chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatBotInputPlaceholder') || (isEn ? "Ask me anything about English or website tools..." : "Hỏi về từ vựng, ngữ pháp hoặc tính năng web...")}
              className="w-full bg-slate-100/80 dark:bg-zinc-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm resize-none h-[48px] overflow-hidden transition-all"
              rows={1}
            />
            <button
              id="ai-chatbot-send-btn"
              onClick={() => handleSendQuery()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        id="ai-chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center z-[100] transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20 cursor-pointer"
      >
        <MessageSquare size={22} className={cn("transition-transform duration-300", isOpen && "rotate-90 scale-90")} />
      </Button>
    </>
  );
}
