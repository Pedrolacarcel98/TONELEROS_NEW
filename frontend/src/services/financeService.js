import apiClient from './apiClient';

export const financeService = {
  getSummary: async () => {
    const res = await apiClient.get('/finance/summary');
    return res.data;
  },
  getExpenses: async () => {
    const res = await apiClient.get('/finance/expenses');
    return res.data;
  },
  createExpense: async (payload) => {
    const res = await apiClient.post('/finance/expenses', payload);
    return res.data;
  }
  ,
  updateExpense: async (id, payload) => {
    const res = await apiClient.put(`/finance/expenses/${id}`, payload);
    return res.data;
  },
  deleteExpense: async (id) => {
    const res = await apiClient.delete(`/finance/expenses/${id}`);
    return res.data;
  }
};

export default financeService;
