export const isNetworkError = (error) => {
  return !error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error');
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  if (error?.userMessage) return error.userMessage;
  if (error?.code === 'ECONNABORTED') return 'Server is taking too long to respond. Please try again.';
  if (isNetworkError(error)) return 'Could not connect to the server. Please try again.';
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) return backendMessage;
  if (status === 401) return 'Invalid email or password';
  if (status === 404) return 'User not found';
  if (status >= 500) return 'Unexpected server error. Please try again.';
  return error?.message || fallback;
};
