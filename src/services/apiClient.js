const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
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
