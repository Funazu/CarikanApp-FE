import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  }
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Auto-refresh tokens on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Ignore refresh endpoint itself to prevent infinite loop
    if (originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Note: call raw axios to avoid interceptor loop
          const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/refresh`, {
            refresh_token: refreshToken
          }, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (res.status === 200 && res.data.access_token) {
            const newToken = res.data.access_token;
            localStorage.setItem('access_token', newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token expired or invalid, log out user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          // Clear current location and redirect if logged in
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
