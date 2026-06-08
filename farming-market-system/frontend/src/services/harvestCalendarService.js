import api from './api';

export const getCalendarEvents = async ({ dateFrom, dateTo } = {}) =>
  (await api.get('/calendar/events', { params: { dateFrom, dateTo } })).data;

export const createCalendarEvent = async (data) => (await api.post('/calendar/events', data)).data;

export const updateCalendarEvent = async (id, data) => (await api.put(`/calendar/events/${id}`, data)).data;

export const deleteCalendarEvent = async (id) => (await api.delete(`/calendar/events/${id}`)).data;
