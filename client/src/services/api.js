import axios from 'axios';

// Vite (preferred) or CRA fallback
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env.REACT_APP_API_BASE_URL) ||
  'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Expense APIs
export const expenseAPI = {
  create: (formData) =>
    api.post('/expenses', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyExpenses: (params) => api.get('/expenses/my-expenses', { params }),
  getAllExpenses: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  approve: (id, data) => api.post(`/expenses/${id}/approve`, data),
  reject: (id, data) => api.post(`/expenses/${id}/reject`, data),
  processPayment: (id, formData) =>
    api.post(`/expenses/${id}/payment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  addComment: (id, data) => api.post(`/expenses/${id}/comment`, data),
  getStats: () => api.get('/expenses/stats')
};

// User APIs
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats')
};

// Tickets
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getAllTickets: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  addReply: (id, data) => api.post(`/tickets/${id}/reply`, data),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data)
};

// Policies
export const policyAPI = {
  createPolicy: (data) => api.post('/policies', data),
  getAllPolicies: () => api.get('/policies'),
  getActivePolicies: () => api.get('/policies/active'),
  updatePolicy: (id, data) => api.put(`/policies/${id}`, data),
  deletePolicy: (id) => api.delete(`/policies/${id}`),
  checkCompliance: (data) => api.post('/policies/check-compliance', data)
};

// Approvals
export const approvalAPI = {
  getPendingApprovals: () => api.get('/approvals/pending'),
  approveAtLevel: (id, data) => api.post(`/approvals/${id}/approve`, data),
  rejectAtLevel: (id, data) => api.post(`/approvals/${id}/reject`, data),
  getWorkflowHistory: (id) => api.get(`/approvals/${id}/workflow`)
};

// Password
export const passwordAPI = {
  changePassword: (data) => api.post('/password/change-password', data),
  requestPasswordReset: (data) => api.post('/password/request-reset', data),
  resetPasswordWithOTP: (data) => api.post('/password/reset-with-otp', data)
};

export default api;
