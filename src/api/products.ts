import api from './config';

export const getProducts = async (params?: Record<string, unknown>) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getFeaturedProducts = async () => {
  const { data } = await api.get('/products/featured');
  return data;
};

export const addReview = async (id: string, review: { rating: number; comment: string }) => {
  const { data } = await api.post(`/products/${id}/reviews`, review);
  return data;
};
