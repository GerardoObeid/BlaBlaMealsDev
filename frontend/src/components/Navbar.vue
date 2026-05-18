<template>
  <nav class="navbar">
    <div class="navbar-content">
      <div class="logo">
        <img src="/logo.svg" alt="MealShare Logo" class="logo-icon" style="width: 28px; height: 28px;" />
        <span class="logo-text">MealShare</span>
      </div>

      <button
        class="hamburger"
        :class="{ 'is-active': menuOpen }"
        @click="toggleMenu"
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-links" :class="{ 'menu-open': menuOpen }">
        <router-link to="/home" class="nav-link" @click="menuOpen = false"
          >Home</router-link
        >
        <router-link to="/dashboard" class="nav-link" @click="menuOpen = false"
          >Dashboard</router-link
        >
        <router-link to="/bookings" class="nav-link" @click="menuOpen = false"
          >Bookings</router-link
        >
        <router-link to="/profile" class="nav-link" @click="menuOpen = false"
          >Profile</router-link
        >
      </div>

      <div class="nav-actions" :class="{ 'menu-open': menuOpen }">
        <div v-if="currentUser" class="user-section">
          <img
            v-if="currentUser?.profilePicture"
            :src="currentUser.profilePicture"
            alt="Profile"
            class="user-avatar"
          />
          <div v-else class="user-avatar-placeholder">
            {{ getInitials(currentUser?.firstName, currentUser?.lastName) }}
          </div>
          <div class="user-info">
            <p class="user-name">
              {{ currentUser?.firstName }} {{ currentUser?.lastName }}
            </p>
            <p class="user-email">{{ currentUser?.email }}</p>
          </div>
        </div>
        <button class="btn-logout" @click="logout">Logout</button>
      </div>
    </div>

    <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false"></div>
  </nav>
</template>

<script>
import { useRouter } from "vue-router";
import { authService } from "../services/authService";

export default {
  name: "Navbar",
  setup() {
    const router = useRouter();
    return { router, authService };
  },
  data() {
    return {
      currentUser: null,
      menuOpen: false,
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 768,
    };
  },
  mounted() {
    this.currentUser = this.authService.getCurrentUser();
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    async logout() {
      this.menuOpen = false;
      await this.authService.logout();
      this.router.push("/");
    },
    getInitials(firstName, lastName) {
      const first = firstName?.charAt(0)?.toUpperCase() || "U";
      const last = lastName?.charAt(0)?.toUpperCase() || "";
      return first + last;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth > 768) {
        this.menuOpen = false;
      }
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/Navbar.css";
</style>
