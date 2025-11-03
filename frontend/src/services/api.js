import axios from 'axios';

// ใช้ VUE_APP_API_URL จาก .env (ห้าม hardcode localhost!)
const BACKEND_BASE_URL = process.env.VUE_APP_API_URL;
if (!BACKEND_BASE_URL) {
  console.error('Error: VUE_APP_API_URL is not defined in .env file!');
  throw new Error('VUE_APP_API_URL environment variable is required');
}
const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

console.log('[API] Backend Base URL:', BACKEND_BASE_URL);
console.log('[API] API Base URL:', API_BASE_URL);

// Export BACKEND_BASE_URL สำหรับใช้ใน component อื่นๆ (สำหรับ static files เช่น images)
export const getBackendBaseUrl = () => BACKEND_BASE_URL;

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
    // ซ่อน Network Error ที่ไม่สำคัญ (API ที่ยังไม่ได้ implement)
    if (error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Network Error (API not available):', error.config?.url);
    } else {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
};

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
  getStats: (companyId) => {
    const params = companyId ? `?companyId=${companyId}` : '';
    return apiClient.get(`/dashboard/stats${params}`);
  },
  getActivities: (limit = 10, companyId) => {
    const params = new URLSearchParams({ limit });
    if (companyId) params.append('companyId', companyId);
    return apiClient.get(`/dashboard/activities?${params}`);
  },
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

// ==================== STATISTICS API ====================
export const statisticsAPI = {
  getOverview: (period = 'week') => apiClient.get(`/statistics/overview?period=${period}`),
  getVehicleTypes: (period = 'week') => apiClient.get(`/statistics/vehicle-types?period=${period}`),
  getPeakHours: (period = 'week') => apiClient.get(`/statistics/peak-hours?period=${period}`),
  getTopCompanies: (period = 'week', limit = 5) => apiClient.get(`/statistics/top-companies?period=${period}&limit=${limit}`),
  getTrafficTrend: (period = 'week') => apiClient.get(`/statistics/traffic-trend?period=${period}`),
  getAdditional: (period = 'week') => apiClient.get(`/statistics/additional?period=${period}`),
};

// ==================== SYSTEM SETTINGS API ====================
export const systemSettingsAPI = {
  // Companies
  getAccessibleCompanies: (userId) => {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.get(`/settings/companies/accessible${params}`);
  },

  // General Settings
  getGeneral: (companyId) => apiClient.get(`/settings/general?companyId=${companyId}`),
  updateGeneral: (data, companyId) => apiClient.put(`/settings/general?companyId=${companyId}`, data),

  // Appearance Settings
  getAppearance: (companyId) => apiClient.get(`/settings/appearance?companyId=${companyId}`),
  updateAppearance: (data, companyId) => apiClient.put(`/settings/appearance?companyId=${companyId}`, data),

  // Security Settings
  getSecurity: (companyId) => apiClient.get(`/settings/security?companyId=${companyId}`),
  updateSecurity: (data, companyId) => apiClient.put(`/settings/security?companyId=${companyId}`, data),

  // Email Settings
  getEmail: (companyId) => apiClient.get(`/settings/email?companyId=${companyId}`),
  updateEmail: (data, companyId) => apiClient.put(`/settings/email?companyId=${companyId}`, data),
  testEmail: (data) => apiClient.post('/settings/email/test', data),

  // Notification Settings
  getNotifications: (companyId) => apiClient.get(`/settings/notifications?companyId=${companyId}`),
  updateNotifications: (data, companyId) => apiClient.put(`/settings/notifications?companyId=${companyId}`, data),

  // Upload Image (Logo, Favicon)
  uploadImage: (file, companyId, type) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return apiClient.post(`/settings/upload-image?companyId=${companyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient;
