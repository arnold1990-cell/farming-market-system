import api from './api';

export const placeOrder = async (paymentMethod) => (await api.post('/checkout', { paymentMethod })).data;
export const getMyOrders = async () => (await api.get('/orders/my-orders')).data;
export const getOrderById = async (id) => (await api.get(`/orders/${id}`)).data;
export const getFarmerOrders = async () => (await api.get('/farmer/orders')).data;
export const updateOrderStatus = async (id, status) => (await api.patch(`/admin/orders/${id}/status`, null, { params: { status } })).data;
export const getAllOrders = async () => (await api.get('/orders/all')).data;
export const initiateOnlinePayment = async (orderId) => (await api.post('/payments/online/initiate', { orderId })).data;
export const confirmOnlinePayment = async (orderId) => (await api.post('/payments/online/confirm', { orderId })).data;
export const initiateOrangeMoney = async (orderId, customerPhone) => (await api.post('/payments/orange-money/initiate', { orderId, customerPhone })).data;
export const initiateMyZaka = async (orderId, customerPhone) => (await api.post('/payments/myzaka/initiate', { orderId, customerPhone })).data;
export const acceptCashPayment = async (orderItemId) => (await api.post(`/payments/cash/${orderItemId}/accept`)).data;
export const rejectCashPayment = async (orderItemId) => (await api.post(`/payments/cash/${orderItemId}/reject`)).data;
