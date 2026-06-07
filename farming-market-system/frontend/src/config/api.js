const DEVELOPMENT_API_FALLBACK = '/api';

const trimSlashes = (value) => String(value || '').trim().replace(/\/+$/, '');

const ensureApiPrefix = (value) => {
  const normalizedValue = trimSlashes(value);
  if (!normalizedValue) return '';
  if (normalizedValue === '/api' || normalizedValue.endsWith('/api')) return normalizedValue;
  return `${normalizedValue}/api`;
};

const configuredApiBase = trimSlashes(import.meta.env.VITE_API_BASE_URL);
const defaultApiBase = import.meta.env.DEV ? DEVELOPMENT_API_FALLBACK : '';

export const API_BASE_URL = ensureApiPrefix(configuredApiBase || defaultApiBase);
export const API_ORIGIN = API_BASE_URL && !API_BASE_URL.startsWith('/')
  ? API_BASE_URL.replace(/\/api$/, '')
  : '';
export const BACKEND_HEALTHCHECK_PATH = '/health';

export const withApiBase = (path = '') => {
  const cleanedPath = String(path || '').trim();
  if (!cleanedPath) return API_BASE_URL;

  const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
  if (!API_BASE_URL) return normalizedPath;
  if (normalizedPath === '/api' || normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
};
