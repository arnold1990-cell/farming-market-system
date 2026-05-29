import api from './api';
import { getToken } from './authService';

const GUEST_CART_KEY = 'guest_cart_v1';

function readGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export const getCart = async () => {
  if (getToken()) return (await api.get('/cart')).data;
  return { cartId: null, items: readGuestCart() };
};

export const addToCart = async (product, quantity = 1) => {
  if (getToken()) {
    const productId = typeof product === 'object' ? product.id : product;
    const response = (await api.post('/cart/items', { productId, quantity })).data;
    window.dispatchEvent(new Event('cart-updated'));
    return response;
  }
  const productPayload = {
    productId: product.id,
    farmerId: product.farmerId || product.ownerId || null,
    farmerName: product.farmerName || product.farmer || 'Farmer',
    productName: product.name,
    unitPrice: Number(product.price),
    currency: product.currency || 'BWP',
    unit: product.unit,
    imageUrl: product.imageUrl || '',
    quantity
  };
  const items = readGuestCart();
  const existing = items.find((i) => i.productId === productPayload.productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ id: `guest-${Date.now()}-${productPayload.productId}`, ...productPayload });
  }
  writeGuestCart(items);
  return { cartId: null, items };
};

export const updateCartItem = async (itemId, quantity) => {
  if (getToken()) {
    const response = (await api.patch(`/cart/items/${itemId}`, { quantity })).data;
    window.dispatchEvent(new Event('cart-updated'));
    return response;
  }
  const items = readGuestCart().map((i) => (i.id === itemId ? { ...i, quantity } : i));
  writeGuestCart(items);
  return { cartId: null, items };
};

export const removeCartItem = async (itemId) => {
  if (getToken()) {
    const response = (await api.delete(`/cart/items/${itemId}`)).data;
    window.dispatchEvent(new Event('cart-updated'));
    return response;
  }
  const items = readGuestCart().filter((i) => i.id !== itemId);
  writeGuestCart(items);
  return { cartId: null, items };
};

export const clearCart = async () => {
  if (getToken()) {
    const response = (await api.delete('/cart')).data;
    window.dispatchEvent(new Event('cart-updated'));
    return response;
  }
  writeGuestCart([]);
  return { cartId: null, items: [] };
};

export const getCartCount = async () => {
  const cart = await getCart();
  return (cart.items || []).reduce((sum, i) => sum + Number(i.quantity || 0), 0);
};
