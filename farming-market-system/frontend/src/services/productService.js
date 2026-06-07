import api from './api';

export const getProducts = async (params) => (await api.get('/products', { params })).data;
export const getPublicProducts = async (params) => {
  const response = await api.get('/products/public', { params });
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};
export const getProductById = async (id) => (await api.get(`/products/${id}`)).data;
export const getPublicProductById = async (id) => (await api.get(`/products/public/${id}`)).data;
export const searchProducts = async (keyword) => (await api.get('/products/search', { params: { keyword } })).data;
export const getProductMapListings = async (params) => (await api.get('/products/map', { params })).data;
export const getMyProducts = async () => (await api.get('/farmer/products')).data;
export const getFarmerDashboard = async () => (await api.get('/products/farmer/dashboard')).data;
export const createProduct = async (data) => (await api.post('/farmer/products', data)).data;
export const updateProduct = async (id, data) => (await api.put(`/farmer/products/${id}`, data)).data;
export const deleteProduct = async (id) => (await api.delete(`/farmer/products/${id}`)).data;
export const updateProductAvailability = async (id, availabilityStatus) =>
  (await api.patch(`/farmer/products/${id}/availability`, { availabilityStatus })).data;
export const uploadProductImages = async (productId, imageType, files) => {
  const formData = new FormData();
  formData.append('imageType', imageType);
  files.forEach((f) => formData.append('files', f));
  console.log('FormData entries:', [...formData.entries()]);
  return (await api.post(`/products/${productId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
export const getProductImages = async (productId) => (await api.get(`/products/${productId}/images`)).data;
export const reorderProductImages = async (productId, imageType, imageIds) =>
  (await api.patch(`/products/${productId}/images/reorder`, { imageIds }, { params: { imageType } })).data;
export const setPrimaryImage = async (imageId) => (await api.patch(`/products/images/${imageId}/primary`)).data;
export const deleteProductImage = async (imageId) => (await api.delete(`/products/images/${imageId}`)).data;
export const getProductOrders = async (productId) => (await api.get(`/products/${productId}/orders`)).data;
