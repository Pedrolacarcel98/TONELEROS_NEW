import apiClient from './apiClient';

export const vacationsService = {
  getVacations: async (includePast = false) => {
    const response = await apiClient.get('/vacations/', {
      params: includePast ? { include_past: true } : {}
    });
    return response.data;
  },

  getSummary: async (year = null) => {
    const response = await apiClient.get('/vacations/summary', {
      params: year ? { year } : {}
    });
    return response.data;
  },
  
  createVacation: async (vacationData) => {
    const response = await apiClient.post('/vacations/', vacationData);
    return response.data;
  },

  updateVacation: async (id, vacationData) => {
    const response = await apiClient.put(`/vacations/${id}`, vacationData);
    return response.data;
  },
  
  deleteVacation: async (id) => {
    const response = await apiClient.delete(`/vacations/${id}`);
    return response.data;
  }
};
