import apiClient from './apiClient';

export const eventsService = {
  getEvents: async () => {
    const res = await apiClient.get('/events/');
    return res.data;
  },

  createEvent: async (data) => {
    const res = await apiClient.post('/events/', data);
    return res.data;
  },

  updateEvent: async (id, data) => {
    const res = await apiClient.put(`/events/${id}`, data);
    return res.data;
  },

  deleteEvent: async (id) => {
    await apiClient.delete(`/events/${id}`);
  }
};

export default eventsService;
