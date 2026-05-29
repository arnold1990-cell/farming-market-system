import api from './api';
import { getProducts } from './productService';
import { getAllOrders } from './orderService';
import { getAllDeliveries, assignDeliveryAgent } from './deliveryService';

export const getUsers = async () => (await api.get('/users')).data;
export const disableUser = async (id) => (await api.patch(`/users/${id}/disable`)).data;
export const getAllProducts = async () => getProducts();
export const getAllOrdersAdmin = async () => getAllOrders();
export const getAllFarmers = async () => (await api.get('/users')).data.filter((u) => u.role === 'FARMER');
export const getDeliveries = async () => getAllDeliveries();
export const assignDelivery = async (orderId, agentId) => assignDeliveryAgent(orderId, agentId);

export const getFarmers = async () => {
  try {
    return (await api.get('/admin/farmers')).data;
  } catch {
    return getAllFarmers();
  }
};

export const getFarmerById = async (id) => {
  try {
    return (await api.get(`/admin/farmers/${id}`)).data;
  } catch {
    const farmers = await getFarmers();
    return farmers.find((f) => Number(f.id) === Number(id));
  }
};

export const createFarmer = async (data) => {
  try {
    return (await api.post('/admin/farmers', data)).data;
  } catch {
    return (await api.post('/auth/register', {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: 'FARMER'
    })).data;
  }
};

export const approveFarmer = async (id) => {
  try {
    return (await api.patch(`/admin/farmers/${id}/approve`)).data;
  } catch {
    return { success: true, message: 'Approve endpoint not available in current backend' };
  }
};

export const suspendFarmer = async (id) => {
  try {
    return (await api.patch(`/admin/farmers/${id}/suspend`)).data;
  } catch {
    return disableUser(id);
  }
};

export const deleteFarmer = async (id) => {
  return (await api.delete(`/admin/farmers/${id}`)).data;
};

export const getDashboardStats = async () => {
  const [users, products, orders] = await Promise.all([getUsers(), getAllProducts(), getAllOrdersAdmin()]);
  const listingStatus = (products || []).reduce((acc, p) => {
    const key = String(p.availabilityStatus || 'AVAILABLE').toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    totalUsers: users.length,
    farmers: users.filter((u) => u.role === 'FARMER').length,
    buyers: users.filter((u) => u.role === 'BUYER').length,
    products: products.length,
    pendingListings: 0,
    approvedListings: listingStatus.AVAILABLE || 0,
    rejectedListings: (listingStatus.OUT_OF_STOCK || 0) + (listingStatus.SOLD || 0),
    pendingFarmers: users.filter((u) => u.role === 'FARMER' && !u.enabled).length,
    orders: orders.length,
    revenue: orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  };
};

export const getRedFlags = async () => (await api.get('/admin/red-flags')).data;
export const getCommissions = async () => (await api.get('/admin/commissions')).data;
export const resolveRedFlag = async (id, notes) => (await api.patch(`/admin/red-flags/${id}/resolve`, null, { params: { notes } })).data;
export const getMonetizationSummary = async () => (await api.get('/admin/monetization-summary')).data;
