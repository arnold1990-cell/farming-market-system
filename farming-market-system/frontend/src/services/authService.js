import api from './api';

export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getToken = () => localStorage.getItem('token');
export const getCurrentUser = () => {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};
export const isAuthenticated = () => Boolean(getToken());
export const hasRole = (role) => getCurrentUser()?.role === role;

export const registerUser = async (data) => {
  const payload = {
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    password: data.password,
    role: data.role
  };
  const res = await api.post('/auth/register', payload);
  return res.data;
};

export const loginUser = async (data) => {
  const start = Date.now();
  try {
    const res = await api.post('/auth/login', data);
    console.info('[AUTH][LOGIN][SUCCESS]', {
      status: res.status,
      durationMs: Date.now() - start
    });
    const token = res.data.token;
    saveAuth(token, { userId: res.data.userId, email: res.data.email, role: res.data.role });
    return res.data;
  } catch (error) {
    console.error('[AUTH][LOGIN][FAILURE]', {
      status: error?.response?.status,
      code: error?.code,
      message: error?.message,
      durationMs: Date.now() - start
    });
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const fetchMe = async () => {
  const res = await api.get('/users/me');
  return res.data;
};
