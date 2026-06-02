const trimSlashes = (value) => String(value || '').trim().replace(/\/+$/, '');

const rawEnvBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';
const normalizedEnvBase = trimSlashes(rawEnvBase);

const ensureApiPrefix = (value) => {
  if (!value || value === '/') return '/api';
  if (value === '/api' || value.endsWith('/api')) return value;
  return `${value}/api`;
};

const toOrigin = (value) => {
  if (!value || value.startsWith('/')) return '';
  return value.replace(/\/api$/, '');
};

export const API_BASE_URL = ensureApiPrefix(normalizedEnvBase);
export const API_ORIGIN = toOrigin(API_BASE_URL);
export const BACKEND_HEALTHCHECK_PATH = '/health';
export const BACKEND_HEALTHCHECK_URL = `${API_BASE_URL}${BACKEND_HEALTHCHECK_PATH}`;

export const withApiBase = (path = '') => {
  const cleanedPath = String(path || '').trim();
  if (!cleanedPath) return API_BASE_URL;
  const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
  if (normalizedPath === '/api' || normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
};
