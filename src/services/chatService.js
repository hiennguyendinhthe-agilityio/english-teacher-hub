import { generateSmartResponse } from './smartChatEngine';

// Backend API URL: Relative path in production (Vercel), absolute path for local development
const BACKEND_URL = import.meta.env.PROD 
  ? '/api/chat' 
  : 'http://localhost:8000/api/chat';

export const sendChatMessage = async (chatHistory, newMessage, language = 'vi') => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: chatHistory,
        message: newMessage,
        language: language
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return data.reply;
      }
    }
    
    // Nếu backend phản hồi không 200, kích hoạt bộ não Smart Engine tại chỗ với ngôn ngữ hiện tại
    console.warn('Backend returned non-200, activating client-side Smart NLP Engine');
    return generateSmartResponse(newMessage, language);

  } catch (error) {
    console.warn('Backend fetch failed, activating resilient Smart NLP Engine:', error);
    // Tự động trả lời thông minh bằng client-side engine khi mất mạng hoặc không bật server
    return generateSmartResponse(newMessage, language);
  }
};
