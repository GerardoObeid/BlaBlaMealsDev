import { createRouter, createWebHistory } from "vue-router";
// import { authStore } from "../stores/authStore";

// Pages
import LandingPage from "../components/common/LandingPage.vue";
import LoginPage from "../components/common/LoginPage.vue";

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
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
