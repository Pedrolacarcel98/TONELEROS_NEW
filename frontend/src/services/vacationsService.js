import apiClient from './apiClient';

export const vacationsService = {
  getVacations: async () => {
    const response = await apiClient.get('/vacations/');
    return response.data;
  },
  
  createVacation: async (vacationData) => {
    const response = await apiClient.post('/vacations/', vacationData);
    return response.data;
  },
  
  deleteVacation: async (id) => {
    const response = await apiClient.delete(`/vacations/${id}`);
    return response.data;
  }
};
