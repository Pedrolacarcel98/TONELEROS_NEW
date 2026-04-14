import apiClient from './apiClient';

const documentsService = {
  upload: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post('/documents/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  },
  list: async () => {
    const res = await apiClient.get('/documents/');
    return res.data;
  },
  downloadUrl: (doc) => {
    // Prefer the API download endpoint (works regardless of uploads mount)
    try {
      const baseApi = apiClient.defaults.baseURL || (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
      // baseApi is like http://host:8000/api -> use /documents/{id}/download
      if (doc && doc.id) return `${baseApi.replace(/\/$/, '')}/documents/${doc.id}/download`;
    } catch (e) {
      /* fallthrough */
    }
    // Fallback: direct uploads path on API host
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
    return `${base}/uploads/${doc.stored_name}`;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  },
  share: async (id) => {
    const res = await apiClient.get(`/documents/${id}/share`);
    return res.data;
  }
};

export default documentsService;
