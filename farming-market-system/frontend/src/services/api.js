import { API_BASE_URL, withApiBase } from '../config/api';

const DEFAULT_TIMEOUT_MS = 30000;
const withCredentials = String(import.meta.env.VITE_API_WITH_CREDENTIALS || 'false').toLowerCase() === 'true';

const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);
const MAX_RETRIES = 1;

const mergeHeaders = (...headerSets) => {
  const headers = new Headers();
  for (const headerSet of headerSets) {
    if (!headerSet) continue;
    const source = headerSet instanceof Headers ? headerSet : new Headers(headerSet);
    source.forEach((value, key) => headers.set(key, value));
  }
  return headers;
};

const buildQueryString = (params) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null) searchParams.append(key, String(item));
      });
      return;
    }
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const buildUrl = (url, params) => {
  const baseUrl = /^https?:\/\//i.test(String(url || '')) ? String(url) : withApiBase(url);
  const query = buildQueryString(params);
  if (!query) return baseUrl;
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query.slice(1)}`;
};

const getUri = (config = {}) => buildUrl(config.url || '', config.params);

const parseResponseBody = async (response) => {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
};

const createError = (message, { config, code, response, cause }) => {
  const error = new Error(message);
  error.config = config;
  error.code = code;
  error.response = response;
  error.cause = cause;
  return error;
};

const shouldRetry = (error) => {
  const method = String(error?.config?.method || 'get').toLowerCase();
  if (!RETRYABLE_METHODS.has(method)) return false;
  if (!error?.config) return false;
  const status = error?.response?.status;
  return error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK' || (typeof status === 'number' && status >= 500);
};

async function request(config = {}) {
  const method = String(config.method || 'get').toLowerCase();
  const timeout = Number(config.timeout || DEFAULT_TIMEOUT_MS);
  const url = getUri(config);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort('timeout'), timeout);
  const headers = mergeHeaders(config.headers);
  const token = localStorage.getItem('token');

  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body = config.data;
  if (body != null && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (body != null && headers.get('Content-Type')?.includes('application/json') && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  if (url.includes('/auth/login')) {
    console.info('[API][LOGIN][REQUEST]', {
      method: method.toUpperCase(),
      url,
      timeoutMs: timeout
    });
  }

  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers,
      body: ['get', 'head'].includes(method) ? undefined : body,
      credentials: withCredentials ? 'include' : 'same-origin',
      signal: controller.signal
    });

    const responseData = await parseResponseBody(response);
    const result = {
      data: responseData,
      status: response.status,
      headers: response.headers,
      config: { ...config, method, timeout }
    };

    if (url.includes('/auth/login')) {
      console.info('[API][LOGIN][RESPONSE]', {
        status: response.status,
        url
      });
    }

    if (!response.ok) {
      throw createError(`Request failed with status code ${response.status}`, {
        config: result.config,
        response: result
      });
    }

    return result;
  } catch (error) {
    const isTimeout = controller.signal.aborted && controller.signal.reason === 'timeout';
    const normalizedError = isTimeout
      ? createError(`timeout of ${timeout}ms exceeded`, {
          config: { ...config, method, timeout },
          code: 'ECONNABORTED',
          cause: error
        })
      : error?.response || error?.config
        ? error
        : createError(error?.message || 'Network Error', {
            config: { ...config, method, timeout },
            code: 'ERR_NETWORK',
            cause: error
          });

    const retryConfig = normalizedError.config;
    if (retryConfig && shouldRetry(normalizedError)) {
      retryConfig.__retryCount = retryConfig.__retryCount || 0;
      if (retryConfig.__retryCount < MAX_RETRIES) {
        retryConfig.__retryCount += 1;
        return new Promise((resolve) => {
          setTimeout(() => resolve(request(retryConfig)), 500);
        });
      }
    }

    if (url.includes('/auth/login')) {
      console.error('[API][LOGIN][ERROR]', {
        code: normalizedError?.code,
        status: normalizedError?.response?.status,
        message: normalizedError?.message,
        url
      });
    }

    if (normalizedError?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    if (normalizedError?.code === 'ECONNABORTED') {
      normalizedError.userMessage = 'Server is taking too long to respond. Please try again.';
    } else if (normalizedError?.code === 'ERR_NETWORK') {
      normalizedError.userMessage = 'Could not reach the server. Please check your connection and retry.';
    }

    throw normalizedError;
  } finally {
    window.clearTimeout(timer);
  }
}

const api = {
  defaults: {
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT_MS,
    withCredentials
  },
  getUri,
  request,
  get: (url, config = {}) => request({ ...config, method: 'get', url }),
  delete: (url, config = {}) => request({ ...config, method: 'delete', url }),
  head: (url, config = {}) => request({ ...config, method: 'head', url }),
  options: (url, config = {}) => request({ ...config, method: 'options', url }),
  post: (url, data, config = {}) => request({ ...config, method: 'post', url, data }),
  put: (url, data, config = {}) => request({ ...config, method: 'put', url, data }),
  patch: (url, data, config = {}) => request({ ...config, method: 'patch', url, data })
};

export default api;
