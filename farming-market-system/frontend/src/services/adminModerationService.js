import api from './api';
import { getUsers, disableUser, getAllProducts } from './adminService';

export const getModerationUsers = async () => getUsers();
export const suspendUser = async (id) => disableUser(id);

export const getModerationListings = async () => getAllProducts();

export const approveListing = async (id) => {
  // TODO: Replace with dedicated moderation endpoint when available.
  return (await api.patch(`/farmer/products/${id}/availability`, { availabilityStatus: 'AVAILABLE' })).data;
};

export const rejectListing = async (id) => {
  // TODO: Replace with dedicated moderation endpoint when available.
  return (await api.patch(`/farmer/products/${id}/availability`, { availabilityStatus: 'OUT_OF_STOCK' })).data;
};
