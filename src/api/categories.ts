import api from './config';

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};
