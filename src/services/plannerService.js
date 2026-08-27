import { apiClient } from './apiClient';

/**
 * Service gọi API cho Sổ Tay Giáo Viên (Planner)
 * Kết nối với Python FastAPI (Chapter 2 & 3)
 */
export const plannerService = {
  /**
   * Đăng nhập lấy JWT Token (Sử dụng x-www-form-urlencoded cho OAuth2 của FastAPI)
   */
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    // Thử gọi /auth/login (chuẩn RESTful mà Thầy/Cô đang code trong app.main)
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

    let response;
    try {
      // 1. Thử gọi endpoint chuẩn trong app.main
      response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok && response.status === 404) {
        // 2. Nếu không tìm thấy, thử gọi endpoint /token của file bài tập (exercise2)
        const rootUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
        response = await fetch(`${rootUrl}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
      }
    } catch (e) {
      throw new Error('errNoConnection');
    }

    if (!response.ok) {
      throw new Error('errLoginFail');
    }
    return response.json(); // Trả về { access_token: "...", token_type: "bearer" }
  },

  /**
   * Lấy danh sách Tasks từ Backend
   */
  async getTasks() {
    return apiClient.get('/tasks');
  },

  /**
   * Tạo mới 1 Task
   */
  async createTask(taskData) {
    return apiClient.post('/tasks', taskData);
  },

  /**
   * Đánh dấu hoàn thành / Cập nhật Task
   */
  async updateTask(taskId, updateData) {
    return apiClient.put(`/tasks/${taskId}`, updateData);
  },

  /**
   * Xóa một Task
   */
  async deleteTask(taskId) {
    return apiClient.delete(`/tasks/${taskId}`);
  },

  /**
   * Đăng ký tài khoản mới
   */
  async register(username, fullName, password) {
    const payload = {
      username: username,
      full_name: fullName,
      password: password
    };
    
    // Gọi trực tiếp fetch vì endpoint này không cần Token Authorization
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 409) {
        const errorData = await response.json();
        // Xử lý lỗi 409 chuẩn xịn theo thiết kế của Backend
        if (errorData.error_code === 'DUPLICATE_RESOURCE') {
          throw new Error('errUsernameTaken');
        }
      }
      throw new Error('errRegisterFail');
    }

    return response.json(); // Trả về thông tin User (không có mật khẩu)
  },

  /**
   * Gửi Email báo cáo (Background Tasks)
   */
  async sendSummaryEmail() {
    // Gọi qua apiClient để tự động đính kèm Token
    return apiClient.post('/tasks/summary-email');
  }
};
