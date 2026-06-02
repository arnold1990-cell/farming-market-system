import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const withCredentials = String(import.meta.env.VITE_API_WITH_CREDENTIALS || 'false').toLowerCase() === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials
});

const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);
const MAX_RETRIES = 1;

const shouldRetry = (error) => {
  const method = String(error?.config?.method || 'get').toLowerCase();
  if (!RETRYABLE_METHODS.has(method)) return false;
  if (!error?.config) return false;
  const status = error?.response?.status;
  return error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK' || (typeof status === 'number' && status >= 500);
};

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
    const config = error?.config;
    if (config && shouldRetry(error)) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        return new Promise((resolve) => {
          setTimeout(() => resolve(api(config)), 500);
        });
      }
    }

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

    if (error?.code === 'ECONNABORTED') {
      error.userMessage = 'Server is taking too long to respond. Please try again.';
    } else if (error?.code === 'ERR_NETWORK') {
      error.userMessage = 'Could not reach the server. Please check your connection and retry.';
    }

    return Promise.reject(error);
  }
);

export default api;
