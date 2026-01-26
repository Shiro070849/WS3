import { createRouter, createWebHistory } from "vue-router";
import { usePermissionStore } from "@/stores/permissionStore";
import { getScreenIdFromRoute } from "@/constants/screens";

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
    meta: { hideLayout: true }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { requiresAuth: true, screenId: 2000 } // DASHBOARD
  },
  {
    path: "/vehicle",
    name: "Vehicle",
    component: () => import("@/views/VehicleView.vue"),
    meta: { requiresAuth: true, screenId: 1100 } // VISIT
  },
  {
    path: "/vehicle/reprint",
    name: "VehicleReprint",
    component: () => import("@/views/VehicleReprintView.vue"),
    meta: { requiresAuth: true, screenId: 4000 } // REPRINT
  },
  {
    path: "/report",
    name: "Report",
    component: () => import("@/views/ReportView.vue"),
    meta: { requiresAuth: true, screenId: 1000 } // REPORTS
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: () => import("@/views/StatisticsView.vue"),
    meta: { requiresAuth: true, screenId: 3000 } // STATISTICS
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/SettingsView.vue"),
    meta: { requiresAuth: true, screenId: 10000 } // SETTINGS
  },
  {
    path: "/error/403",
    name: "Error403",
    component: () => import("@/views/Error403View.vue"),
    meta: { hideLayout: true }
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/login"
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  const permissionStore = usePermissionStore();

  // 1. เช็ค Idle Timeout (8 ชั่วโมงนับจากการใช้งานล่าสุด)
  if (isAuthenticated) {
    const lastActivityTime = localStorage.getItem('lastActivityTime');
    const idleTimeout = 8 * 60 * 60 * 1000; // 8 hours

    if (lastActivityTime && (Date.now() - parseInt(lastActivityTime) > idleTimeout)) {
      console.warn('[ROUTER] Session idle timeout (8 hours) - Auto logout');
      // ล้าง localStorage ทั้งหมด
      localStorage.clear();
      // Redirect ไป login
      next('/login');
      return;
    }

    // อัพเดทเวลาใช้งานล่าสุดทุกครั้งที่มี navigation
    localStorage.setItem('lastActivityTime', Date.now().toString());
  }

  // 2. เช็ค Authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // 2. ถ้าเป็นหน้า Login และ Login แล้ว → redirect ไป Dashboard
  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // 3. ถ้าไม่ใช่หน้า Login และไม่ต้องการ Auth → ผ่าน
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  // 4. เช็ค Permission (ถ้าต้องการ Auth)
  try {
    const userId = parseInt(localStorage.getItem('userId'));

    if (!userId) {
      console.warn('[ROUTER] No userId found, redirecting to login');
      next('/login');
      return;
    }

    // โหลด Permissions ถ้ายังไม่มี
    if (!permissionStore.isLoaded) {
      console.log('[ROUTER] Loading permissions...');
      await permissionStore.loadPermissions(userId);
    }

    // ดึง Screen ID จาก route meta หรือ route path
    const screenId = to.meta.screenId || getScreenIdFromRoute(to.path);

    if (!screenId) {
      console.warn('[ROUTER] No screenId found for route:', to.path);
      // ถ้าไม่มี screenId → อนุญาตให้ผ่าน (backward compatibility)
      next();
      return;
    }

    // เช็คสิทธิ์
    const hasAccess = permissionStore.hasAccess(screenId);

    if (!hasAccess) {
      console.warn(`[ROUTER] Permission denied for Screen ${screenId} (${to.path})`);
      next('/error/403');
      return;
    }

    console.log(`[ROUTER] Permission granted for Screen ${screenId} (${to.path})`);
    next();
  } catch (error) {
    console.error('[ROUTER] Error checking permissions:', error);
    // ถ้า error → redirect ไป login (อาจเป็นเพราะ session หมดอายุ)
    next('/login');
  }
});

export default router;