import api from './config';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (name: string, email: string, password: string) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateProfile = async (profileData: Record<string, unknown>) => {
  const { data } = await api.put('/auth/profile', profileData);
  return data;
};
