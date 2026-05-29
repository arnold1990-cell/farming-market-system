import api from './api';
import { getMyProducts } from './productService';

export const getFarmerDashboardSummary = async () => {
  try {
    return (await api.get('/farmer/dashboard/summary')).data;
  } catch {
    const products = await getMyProducts();
    return {
      inventoryTotal: products.length,
      readyNow: products.filter((p) => (p.availabilityStatus || '') === 'AVAILABLE').length,
      maturingSoon: products.filter((p) => (p.harvestStatus || '') === 'HARVESTED').length
    };
  }
};

export const getFarmerApprovalStatus = async () => {
  // TODO: Replace with dedicated backend endpoint when available.
  return (await api.get('/users/me')).data;
};
