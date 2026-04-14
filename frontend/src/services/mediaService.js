import apiClient from './apiClient';

const mediaService = {
  getAll: (type = null) => {
    const url = type ? `/media/?media_type=${type}` : '/media/';
    return apiClient.get(url).then(res => res.data);
  },

  upload: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', type);
    return apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  delete: (id) => {
    return apiClient.delete(`/media/${id}`);
  },

  getDownloadUrl: (id) => {
    const baseURL = apiClient.defaults.baseURL;
    return `${baseURL}/media/download/${id}`;
  },

  getViewUrl: (id) => {
    const baseURL = apiClient.defaults.baseURL;
    return `${baseURL}/media/view/${id}`;
  }
};

export default mediaService;
