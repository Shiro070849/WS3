import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== COMPANIES API ====================
export const companiesAPI = {
  getAll: () => apiClient.get('/settings/companies'),
  getById: (id) => apiClient.get(`/settings/companies/${id}`),
  create: (data) => apiClient.post('/settings/companies', data),
  update: (id, data) => apiClient.put(`/settings/companies/${id}`, data),
  delete: (id) => apiClient.delete(`/settings/companies/${id}`),
};

// ==================== USERS API ====================
export const usersAPI = {
  getAll: () => apiClient.get('/settings/users'),
  getById: (id) => apiClient.get(`/settings/users/${id}`),
  create: (data) => apiClient.post('/settings/users', data),
  update: (id, data) => apiClient.put(`/settings/users/${id}`, data),
  resetPassword: (id, newPassword) =>
    apiClient.put(`/settings/users/${id}/reset-password`, { newPassword }),
  delete: (id) => apiClient.delete(`/settings/users/${id}`),
};

// ==================== DEPARTMENTS API ====================
export const departmentsAPI = {
  getAll: () => apiClient.get('/settings/departments'),
  getById: (id) => apiClient.get(`/settings/departments/${id}`),
  create: (data) => apiClient.post('/settings/departments', data),
  update: (id, data) => apiClient.put(`/settings/departments/${id}`, data),
  delete: (id) => apiClient.delete(`/settings/departments/${id}`),
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getActivities: (limit = 10) => apiClient.get(`/dashboard/activities?limit=${limit}`),
  getTopCompanies: (limit = 5) => apiClient.get(`/dashboard/companies?limit=${limit}`),
};

// ==================== VEHICLES API ====================
export const vehiclesAPI = {
  getAll: (params) => apiClient.get('/vehicles', { params }),
  getById: (id) => apiClient.get(`/vehicles/${id}`),
  create: (data) => apiClient.post('/vehicles', data),
  update: (id, data) => apiClient.put(`/vehicles/${id}`, data),
  delete: (id) => apiClient.delete(`/vehicles/${id}`),
  checkout: (id, data) => apiClient.post(`/vehicles/${id}/checkout`, data),
};

// ==================== REPORTS API ====================
export const reportsAPI = {
  getAll: (params) => apiClient.get('/reports', { params }),
  exportExcel: (params) => apiClient.get('/reports/export/excel', { params }),
  exportPDF: (params) => apiClient.get('/reports/export/pdf', { params }),
  getStatistics: (params) => apiClient.get('/reports/statistics', { params }),
};

export default apiClient;
