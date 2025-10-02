import { createRouter, createWebHistory } from "vue-router";

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
    meta: { requiresAuth: true }
  },
  {
    path: "/vehicle",
    name: "Vehicle",
    component: () => import("@/views/VehicleView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/report",
    name: "Report",
    component: () => import("@/views/ReportView.vue"),
    meta: { requiresAuth: true }
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

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;