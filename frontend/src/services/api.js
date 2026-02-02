import axios from 'axios';

// ใช้ VUE_APP_API_URL จาก .env (ห้าม hardcode localhost!)
const BACKEND_BASE_URL = process.env.VUE_APP_API_URL;
if (!BACKEND_BASE_URL) {
  console.error('Error: VUE_APP_API_URL is not defined in .env file!');
  throw new Error('VUE_APP_API_URL environment variable is required');
}
const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

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

// Request interceptor - เพิ่ม userId ใน header อัตโนมัติ
apiClient.interceptors.request.use(
  (config) => {
    // ข้ามการเพิ่ม userId สำหรับ auth routes (login, logout)
    const authRoutes = ['/auth/login', '/auth/logout'];
    const isAuthRoute = authRoutes.some(route => config.url?.includes(route));
    
    if (!isAuthRoute) {
      // ดึง userId จาก localStorage และเพิ่มใน header
      const userId = localStorage.getItem('userId');
      
      if (userId && userId !== 'null' && userId !== 'undefined' && userId !== '') {
        // เพิ่ม userId ใน header เสมอ (ถ้ายังไม่มี)
        if (!config.headers['x-user-id']) {
          config.headers['x-user-id'] = userId;
        }
        
        // เพิ่ม userId ใน params เฉพาะเมื่อ:
        // 1. เป็น GET request
        // 2. ยังไม่มี userId ใน params อยู่แล้ว (ป้องกันการซ้ำ)
        if (config.method === 'get') {
          config.params = config.params || {};
          // เช็คว่ามี userId อยู่แล้วหรือไม่ (ทั้งใน params object และ URL string)
          const hasUserIdInParams = config.params.userId !== undefined && config.params.userId !== null;
          const hasUserIdInUrl = config.url?.includes('userId=');
          
          if (!hasUserIdInParams && !hasUserIdInUrl) {
            config.params.userId = userId;
          }
        }
        
        console.log(`[API INTERCEPTOR] Added userId (${userId}) to request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        // ถ้ายังไม่มี userId และไม่ใช่ auth route → log warning
        console.warn(`[API INTERCEPTOR] No valid userId found in localStorage for request: ${config.method?.toUpperCase()} ${config.url}`);
        console.warn(`[API INTERCEPTOR] localStorage userId value:`, userId);
        console.warn(`[API INTERCEPTOR] This request may fail with 400 Bad Request if backend requires userId`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 403 Forbidden - Permission Denied
    if (error.response?.status === 403) {
      console.warn('[API INTERCEPTOR] 403 Forbidden:', error.config?.url);
      
      // Import permissionStore dynamically เพื่อหลีกเลี่ยง circular dependency
      const { usePermissionStore } = await import('@/stores/permissionStore');
      const permissionStore = usePermissionStore();
      
      // ล้าง Permissions (อาจมีการเปลี่ยนแปลงสิทธิ์)
      permissionStore.clearPermissions();
      
      // Import router dynamically
      const router = (await import('@/router')).default;
      
      // Redirect ไปหน้า 403 (ถ้ายังไม่อยู่ในหน้า 403 อยู่แล้ว)
      if (router.currentRoute.value.path !== '/error/403') {
        router.push('/error/403');
      }
      
      return Promise.reject(error);
    }

    // Handle 400 Bad Request - อาจเกิดจาก missing userId
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'Bad Request';
      console.error(`[API INTERCEPTOR] 400 Bad Request: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`[API INTERCEPTOR] Error message:`, errorMessage);
      console.error(`[API INTERCEPTOR] Request headers:`, error.config?.headers);
      console.error(`[API INTERCEPTOR] Request params:`, error.config?.params);
      
      // ถ้า error message บอกว่า userId is required → แจ้งให้ user login ใหม่
      if (errorMessage.includes('userId is required') || errorMessage.includes('userId')) {
        console.error('[API INTERCEPTOR] Missing userId - User may need to login again');
      }
    }

    // ซ่อน Network Error ที่ไม่สำคัญ (API ที่ยังไม่ได้ implement)
    if (error.code === 'ERR_NETWORK') {
      console.warn('[API INTERCEPTOR] Network Error (API not available):', error.config?.url);
    } else if (error.response?.status !== 400) {
      // Log error อื่นๆ ยกเว้น 400 (เพราะ log ไปแล้วข้างบน)
      console.error('[API INTERCEPTOR] API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  getMe: (userId) => apiClient.get('/auth/me', { params: { userId } }),
  getPermissions: (userId) => apiClient.get('/auth/permissions', { params: { userId } }),
};

// ==================== COMPANIES API ====================
export const companiesAPI = {
  getAll: () => apiClient.get('/settings/companies'),
  getAccessible: (userId) => apiClient.get('/settings/companies/accessible', { params: userId ? { userId } : {} }),
  getById: (id) => apiClient.get(`/settings/companies/${id}`),
  create: (data) => apiClient.post('/settings/companies', data),
  update: (id, data) => apiClient.put(`/settings/companies/${id}`, data),
  delete: (id) => apiClient.delete(`/settings/companies/${id}`),
  updateSequence: (id, sequence) => apiClient.patch(`/settings/companies/${id}/sequence`, { sequence }),
  batchUpdateSequences: (updates) => apiClient.post('/settings/companies/batch-update-sequences', { updates }),
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
  getAll: (params = {}) => apiClient.get('/settings/users', { params }),
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

// ==================== PERMISSIONS API ====================
export const permissionsAPI = {
  getScreens: () => apiClient.get('/settings/permissions/screens'),
  getRolePermissions: (roleId) => apiClient.get(`/settings/permissions/roles/${roleId}`),
  addPermission: (data) => apiClient.post('/settings/permissions', data),
  deletePermission: (roleId, screenId) => apiClient.delete(`/settings/permissions/${roleId}/${screenId}`),
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

// ==================== LOCATIONS API ====================
export const locationsAPI = {
  getAll: (params) => apiClient.get('/locations', { params }),
  getActive: () => apiClient.get('/locations/active'),
  getById: (id) => apiClient.get(`/locations/${id}`),
  create: (data) => apiClient.post('/locations', data),
  update: (id, data) => apiClient.put(`/locations/${id}`, data),
  delete: (id) => apiClient.delete(`/locations/${id}`),
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
    // ไม่ต้องส่ง userId ไปเอง เพราะ Request Interceptor จะเพิ่มให้อัตโนมัติ
    // แต่ถ้าต้องการส่ง userId ไปเอง (กรณีพิเศษ) ให้ส่งผ่าน params object
    const params = userId ? { userId } : {};
    return apiClient.get('/settings/companies/accessible', { params });
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
