import api from './api';

export const getAssignedDeliveries = async () => (await api.get('/delivery/agent/me')).data;
export const updateDeliveryStatus = async (id, status) => (await api.patch(`/delivery/agent/${id}/status`, { status })).data;
export const getAllDeliveries = async () => (await api.get('/delivery/all')).data;
export const assignDeliveryAgent = async (orderId, deliveryAgentId) => (await api.post('/delivery/assign', { orderId, deliveryAgentId })).data;
