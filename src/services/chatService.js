import { getStoredApiKey } from './aiService';

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI ảo của "Ms Van's English Class" - một nền tảng E-Learning và công cụ hỗ trợ giảng dạy tiếng Anh hiện đại.
Nhiệm vụ của bạn là:
1. Hướng dẫn người dùng (Giáo viên hoặc Học sinh) cách sử dụng các tính năng của website.
2. Trả lời các câu hỏi về tiếng Anh một cách ngắn gọn, dễ hiểu và thân thiện.
3. Luôn giữ thái độ chuyên nghiệp, tận tâm và vui vẻ.

Các chức năng chính của website:
- Course Manager (Quản lý bài học): Nơi tạo, sửa, xoá các khoá học và bài học.
- AI Importer (Tạo bài học bằng AI): Tự động phân tích file văn bản (.txt, tài liệu) để tạo ra giáo án 4 kỹ năng Nghe, Nói, Đọc, Viết với JSON Advanced.
- Interactive Lesson (Bài học tương tác): Giao diện học sinh với Flashcard, Ngữ pháp, Bài tập trắc nghiệm và tự luận (có thanh Mục lục thông minh).
- Flashcard Builder: Tạo thẻ ghi nhớ từ vựng tự động.
- Worksheet Generator: Tạo phiếu bài tập PDF.
- Essay Grader: Chấm điểm bài luận tiếng Anh bằng AI.

Nếu người dùng hỏi cách làm gì đó, hãy hướng dẫn họ đến tính năng tương ứng. Không sử dụng markdown quá phức tạp, có thể dùng in đậm, in nghiêng và danh sách bullet.`;

export const sendChatMessage = async (chatHistory, newMessage) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('API Key không hợp lệ hoặc chưa được cấu hình.');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Map existing history
    const contents = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    
    // Add the new message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          role: 'user',
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      throw new Error(errorData.error?.message || 'Lỗi kết nối đến Gemini API');
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const replyText = data.candidates[0].content.parts.map(p => p.text).join('');
      return replyText;
    }
    
    throw new Error('AI không trả về kết quả hợp lệ.');
  } catch (error) {
    console.error('Chat AI Error:', error);
    throw new Error('Xin lỗi, tôi đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau nhé!');
  }
};
