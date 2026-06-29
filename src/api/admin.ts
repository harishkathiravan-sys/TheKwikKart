import api from './config';

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

export const toggleBlockUser = async (id: string) => {
  const { data } = await api.put(`/admin/users/${id}/toggle-block`);
  return data;
};

export const updateUserRole = async (id: string, role: string) => {
  const { data } = await api.put(`/admin/users/${id}/role`, { role });
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders/all');
  return data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/orders/dashboard-stats');
  return data;
};

export const getAllProducts = async () => {
  const { data } = await api.get('/products?limit=1000');
  return data;
};

export const updateProduct = async (id: string, productData: FormData) => {
  const { data } = await api.put(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
