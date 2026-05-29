import { getPublicProducts } from './productService';
import api from './api';

const APPROVED_LISTING_STATUSES = new Set(['AVAILABLE']);

export const getListingApprovalStatus = (product) => {
  const status = String(product?.availabilityStatus || '').toUpperCase();
  if (status === 'AVAILABLE') return 'APPROVED';
  if (status === 'SOLD' || status === 'OUT_OF_STOCK') return 'REJECTED';
  return 'PENDING';
};

export const filterApprovedListings = (products = []) =>
  products.filter((p) => APPROVED_LISTING_STATUSES.has(String(p?.availabilityStatus || 'AVAILABLE').toUpperCase()));

const filterByEnabledFarmers = async (products = []) => {
  try {
    const users = (await api.get('/users')).data;
    const enabledFarmers = new Set(
      (users || [])
        .filter((u) => String(u.role).toUpperCase() === 'FARMER' && u.enabled)
        .map((u) => Number(u.id))
    );
    return products.filter((p) => enabledFarmers.has(Number(p.farmerId)));
  } catch {
    // Fallback when /users is not available to current role/session.
    return products;
  }
};

export const getMarketplaceFeed = async (params) => getPublicProducts(params);

export const getMarketplaceSections = async (params) => {
  const raw = await getPublicProducts(params);
  const products = await filterByEnabledFarmers(filterApprovedListings(raw));
  return {
    featured: products.filter((p) => !!p.featured),
    readyNow: products.filter((p) => (p.availabilityStatus || 'AVAILABLE') === 'AVAILABLE'),
    maturingSoon: products.filter((p) => (p.harvestStatus || '') === 'IN_FIELD')
  };
};

export const getApprovedMarketplaceFeed = async (params) => {
  const raw = await getPublicProducts(params);
  return filterByEnabledFarmers(filterApprovedListings(raw));
};
