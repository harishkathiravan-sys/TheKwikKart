import api from './config';

export const createOrder = async (orderData: Record<string, unknown>) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my-orders');
  return data;
};

export const getOrderById = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
};
