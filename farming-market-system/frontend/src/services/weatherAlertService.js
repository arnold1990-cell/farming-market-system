import api from './api';

export const getWeatherAlerts = async () => {
  try {
    return (await api.get('/alerts/weather')).data;
  } catch {
    // TODO: Backend endpoint for weather alerts is not available yet.
    return [];
  }
};

export const createWeatherAlert = async (payload) => {
  // TODO: Confirm backend route/contract for alert broadcasting.
  return (await api.post('/alerts/weather', payload)).data;
};

export const markWeatherAlertRead = async (alertId) => {
  // TODO: Implement when backend supports per-user alert read status.
  return (await api.post(`/alerts/weather/${alertId}/read`)).data;
};
