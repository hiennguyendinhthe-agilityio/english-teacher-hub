import sys

with open('src/services/apiClient.js', 'r') as f:
    content = f.read()

target = """    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }"""

replacement = """    try {
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
      }"""

new_content = content.replace(target, replacement)

with open('src/services/apiClient.js', 'w') as f:
    f.write(new_content)

print("Patched successfully")
