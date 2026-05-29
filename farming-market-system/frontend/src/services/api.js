import axios from 'axios';

const runtimeApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
console.log('API Base URL:', runtimeApiBaseUrl);

const api = axios.create({
  baseURL: runtimeApiBaseUrl,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const fullUrl = api.getUri(config);
  if (fullUrl.includes('/auth/login')) {
    console.info('[API][LOGIN][REQUEST]', {
      method: (config.method || 'get').toUpperCase(),
      url: fullUrl,
      timeoutMs: config.timeout
    });
  }
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    const responseUrl = response?.config ? api.getUri(response.config) : '';
    if (responseUrl.includes('/auth/login')) {
      console.info('[API][LOGIN][RESPONSE]', {
        status: response.status,
        url: responseUrl
      });
    }
    return response;
  },
  (error) => {
    const failedUrl = error?.config ? api.getUri(error.config) : '';
    if (failedUrl.includes('/auth/login')) {
      console.error('[API][LOGIN][ERROR]', {
        code: error?.code,
        status: error?.response?.status,
        message: error?.message,
        url: failedUrl
      });
    }
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
