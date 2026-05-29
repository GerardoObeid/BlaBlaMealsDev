import { createRouter, createWebHistory } from "vue-router";
import { authService } from "../services/authService";

// Pages
import LandingPage from "../components/LandingPage.vue";
import LoginPage from "../components/LoginPage.vue";
import HomePage from "../components/HomePage.vue";
import ProfilePage from "../components/ProfilePage.vue";
import DashboardPage from "../components/DashboardPage.vue";
import BookingsPage from "../components/BookingsPage.vue";
import SearchResultsPage from "../components/SearchResultsPage.vue";

const routes = [
  {
    path: "/",
    name: "Landing",
    component: LandingPage,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/bookings",
    name: "Bookings",
    component: BookingsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/search",
    name: "Search",
    component: SearchResultsPage,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth;

  // 1. If the route requires auth and user is NOT logged in, send to login
  if (requiresAuth && !isAuthenticated) {
    return "/login";
  }

  // 2. If user IS logged in and tries to go to Login OR the Landing page, send to home
  const isPublicOnlyPage = to.path === "/login" || to.path === "/";

  if (isPublicOnlyPage && isAuthenticated) {
    return "/home";
  }
});

export default router;
