import apiClient from './apiClient';

export const eventsService = {
  getEvents: async (history = false, all = false) => {
    const res = await apiClient.get('/events/', { params: { history, all_events: all } });
    return res.data;
  },

  getAllEvents: async () => {
    try {
      const res = await apiClient.get('/events/', { params: { all_events: true } });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn("Fallo al obtener all_events, usando fallback combinado:", e);
    }

    // Fallback de máxima fiabilidad: obtener activos e históricos y combinar por ID
    const [upcomingRes, historyRes] = await Promise.all([
      apiClient.get('/events/', { params: { history: false } }),
      apiClient.get('/events/', { params: { history: true } })
    ]);

    const eventMap = new Map();
    (historyRes.data || []).forEach(ev => eventMap.set(ev.id, ev));
    (upcomingRes.data || []).forEach(ev => eventMap.set(ev.id, ev));
    return Array.from(eventMap.values()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
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
