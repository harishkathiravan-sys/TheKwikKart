import api from './config';

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addToCart = async (productId: string, quantity = 1) => {
  const { data } = await api.post('/cart/add', { productId, quantity });
  return data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
  return data;
};

export const removeFromCart = async (itemId: string) => {
  const { data } = await api.delete(`/cart/item/${itemId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart/clear');
  return data;
};
