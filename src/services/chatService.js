// Backend API URL
const BACKEND_URL = 'http://localhost:8000/api/chat';

export const sendChatMessage = async (chatHistory, newMessage) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: chatHistory,
        message: newMessage
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API Error:', errorData);
      throw new Error(errorData.detail || 'Lỗi kết nối đến Server Backend');
    }

    const data = await response.json();
    return data.reply;
    
  } catch (error) {
    console.error('Chat AI Error:', error);
    // Thay đổi thông báo một chút để dễ nhận biết lỗi này là do kết nối backend
    if (error.message === 'Failed to fetch') {
      throw new Error('Không thể kết nối đến Server Python. Hãy chắc chắn rằng bạn đã khởi động Server (uvicorn main:app) nhé!');
    }
    throw new Error(error.message || 'Xin lỗi, tôi đang gặp trục trặc kỹ thuật. Vui lòng thử lại sau nhé!');
  }
};
