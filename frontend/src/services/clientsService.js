import apiClient from './apiClient';

export const clientsService = {
  getClients: async () => {
    const res = await apiClient.get('/clients/');
    return res.data;
  },

  getClient: async (id) => {
    const res = await apiClient.get(`/clients/${id}`);
    return res.data;
  },

  createClient: async (data) => {
    const res = await apiClient.post('/clients/', data);
    return res.data;
  },

  updateClient: async (id, data) => {
    const res = await apiClient.put(`/clients/${id}`, data);
    return res.data;
  },

  deleteClient: async (id) => {
    await apiClient.delete(`/clients/${id}`);
  }
};

export default clientsService;
