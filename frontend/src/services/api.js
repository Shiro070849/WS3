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

// ==================== CONFIG API ====================
// Cache สำหรับเก็บ Server Config
let serverConfigCache = null;

export const configAPI = {
  // ดึง Server Configuration จาก Backend
  getConfig: async () => {
    try {
      const response = await apiClient.get('/config');
      if (response.data.success) {
        serverConfigCache = response.data.data;
        console.log('[CONFIG] Server config loaded:', serverConfigCache);
      }
      return response;
    } catch (error) {
      console.error('[CONFIG] Failed to load server config:', error);
      // Fallback ใช้ BACKEND_BASE_URL จาก .env
      serverConfigCache = {
        base_url: BACKEND_BASE_URL,
        uploads_path: '/uploads'
      };
      return {
        data: {
          success: true,
          data: serverConfigCache
        }
      };
    }
  },

  // ดึง BASE_URL จาก Cache (ถ้ายังไม่มีจะ fetch ใหม่)
  getBaseUrl: async () => {
    if (!serverConfigCache) {
      await configAPI.getConfig();
    }
    return serverConfigCache?.base_url || BACKEND_BASE_URL;
  }
};

// Helper function: แปลง relative path เป็น full URL
export const getFullImageUrl = (relativePath) => {
  if (!relativePath) return '';

  // ถ้าเป็น full URL อยู่แล้ว (http/https) ให้ใช้ตรงๆ
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // ถ้าเป็น relative path ให้เติม BACKEND_BASE_URL
  // ตัดเครื่องหมาย / ที่ซ้ำออก
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

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
  uploadLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`/settings/companies/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ==================== USERS API ====================
export const usersAPI = {
  getAll: () => apiClient.get('/settings/users'),
  getById: (id) => apiClient.get(`/settings/users/${id}`),
  create: (data) => apiClient.post('/settings/users', data),
  update: (id, data) => apiClient.put(`/settings/users/${id}`, data),
  resetPassword: (id, data) => apiClient.put(`/settings/users/${id}/reset-password`, data),
  delete: (id) => apiClient.delete(`/settings/users/${id}`),
};

// ==================== ROLES API ====================
export const rolesAPI = {
  getAll: () => apiClient.get('/settings/roles'),
};

// ==================== DEPARTMENTS API ====================
export const departmentsAPI = {
  getAll: () => apiClient.get('/settings/departments'),
  getById: (id) => apiClient.get(`/settings/departments/${id}`),
  getTree: (companyId) => apiClient.get(`/settings/departments/tree?companyId=${companyId}`),
  create: (data) => apiClient.post('/settings/departments', data),
  update: (id, data) => apiClient.put(`/settings/departments/${id}`, data),
  move: (id, newParentId) => apiClient.put(`/settings/departments/${id}/move`, { newParentId }),
  delete: (id) => apiClient.delete(`/settings/departments/${id}`),
  getCompanyDepartments: () => apiClient.get('/settings/company-departments'),
  linkToCompany: (departmentId, companyId) => apiClient.post('/settings/company-departments/link', { departmentId, companyId }),
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: (userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    const queryString = params.toString();
    return apiClient.get(`/dashboard/stats${queryString ? '?' + queryString : ''}`);
  },
  getActivities: (limit = 10, userId, companyId, dateFrom, dateTo, search, vehicleType) => {
    const params = new URLSearchParams({ limit });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (search) params.append('search', search);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/dashboard/activities?${params}`);
  },
  getTopCompanies: (limit = 5) => apiClient.get(`/dashboard/companies?limit=${limit}`),
};

// ==================== VEHICLES API ====================
export const vehiclesAPI = {
  getAll: (params) => {
    // Ensure userId is included in params if available
    const queryParams = { ...params };
    return apiClient.get('/vehicles', { params: queryParams });
  },
  getById: (id) => apiClient.get(`/vehicles/${id}`),
  create: (data) => apiClient.post('/vehicles', data),
  update: (id, data) => apiClient.put(`/vehicles/${id}`, data),
  delete: (id) => apiClient.delete(`/vehicles/${id}`),
  checkout: (id, data) => apiClient.post(`/vehicles/${id}/checkout`, data),
};

// ==================== VEHICLE TYPES API ====================
export const vehicleTypesAPI = {
  getAll: (activeOnly = true) => {
    const params = activeOnly !== undefined ? { activeOnly } : {};
    return apiClient.get('/vehicle-types', { params });
  },
  getById: (id) => apiClient.get(`/vehicle-types/${id}`),
  create: (data) => apiClient.post('/vehicle-types', data),
  update: (id, data) => apiClient.put(`/vehicle-types/${id}`, data),
  delete: (id) => apiClient.delete(`/vehicle-types/${id}`),
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
  getOverview: (period = 'week', userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams({ period });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/statistics/overview?${params}`);
  },
  getVehicleTypes: (period = 'week', userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams({ period });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/statistics/vehicle-types?${params}`);
  },
  getPeakHours: (period = 'week', userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams({ period });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/statistics/peak-hours?${params}`);
  },
  getTopCompanies: (period = 'week', limit = 5, userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams({ period, limit });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/statistics/top-companies?${params}`);
  },
  getTrafficTrend: (period = 'week', userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams({ period });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/statistics/traffic-trend?${params}`);
  },
  getAdditional: (period = 'week', userId, companyId, dateFrom, dateTo, vehicleType) => {
    const params = new URLSearchParams({ period });
    if (userId) params.append('userId', userId);
    if (companyId) params.append('companyId', companyId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (vehicleType) params.append('vehicleType', vehicleType);
    return apiClient.get(`/statistics/additional?${params}`);
  },
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

// ==================== WAYIN API (สำหรับรีปริ้น) ====================
export const wayinAPI = {
  getAll: (params) => apiClient.get('/wayin', { params }),
  searchByBarcode: (barcode) => apiClient.get(`/wayin/barcode/${barcode}`),
  getById: (id) => apiClient.get(`/wayin/${id}`),
  update: (id, data) => apiClient.put(`/wayin/${id}`, data),
  getVisitTypes: () => apiClient.get('/wayin/visit-types'),
};

export default apiClient;
