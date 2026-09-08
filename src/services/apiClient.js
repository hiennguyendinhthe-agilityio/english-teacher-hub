// v2 production
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://english-teacher-hub.onrender.com/api/v1';

/**
 * Lớp dùng chung để gọi API tới Python FastAPI Backend
 */
class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Tự động kẹp JWT Token nếu có trong Local Storage
    const token = localStorage.getItem('teacher_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, config);
      
      // Nếu Token bị hết hạn (401)
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('teacher_refresh_token');
        if (refreshToken) {
          console.log("♻️ Access Token hết hạn, đang tự động gọi Refresh Token...");
          // Gọi API refresh
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            // Lưu lại token mới
            localStorage.setItem('teacher_token', data.access_token);
            localStorage.setItem('teacher_refresh_token', data.refresh_token);
            
            // Đính kèm token mới và thử gọi lại API ban đầu
            config.headers['Authorization'] = `Bearer ${data.access_token}`;
            response = await fetch(url, config);
          } else {
            // Refresh Token cũng hết hạn -> Đá ra ngoài đăng nhập
            localStorage.removeItem('teacher_token');
            localStorage.removeItem('teacher_refresh_token');
            window.location.href = '/login';
            throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }

      // Log Performance từ Backend (X-Process-Time)
      const processTime = response.headers.get('X-Process-Time');
      if (processTime) {
        console.debug(`⏱️ [API Performance] ${options.method || 'GET'} ${endpoint} took ${processTime}s on server.`);
      }

      // 204 No Content không có body
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Client Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();
