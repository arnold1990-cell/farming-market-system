import { getApprovedMarketplaceFeed } from './marketplaceService';
import { getMyProducts } from './productService';

const toWindow = (date) => {
  if (!date) return 'UNKNOWN';
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'READY_NOW';
  if (diffDays <= 7) return 'THIS_WEEK';
  if (diffDays <= 30) return 'THIS_MONTH';
  return 'LATER';
};

export const getCustomerHarvestCalendar = async () => {
  const products = await getApprovedMarketplaceFeed();
  return products.map((p) => ({ ...p, calendarWindow: toWindow(p.harvestReadyDate || p.updatedAt) }));
};

export const getFarmerHarvestCalendar = async () => {
  const products = await getMyProducts();
  return products.map((p) => ({ ...p, calendarWindow: toWindow(p.harvestReadyDate || p.updatedAt) }));
};
