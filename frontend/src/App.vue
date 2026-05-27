<template>
  <div class="app-container">
    <Navbar v-if="isAuthenticated" />
    <router-view />
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue"; // Ensure this matches your path
import { authService } from "./services/authService";

export default {
  name: "App",
  components: {
    Navbar, // Registering it explicitly
  },
  data() {
    return {
      isAuthenticated: false,
    };
  },
  watch: {
    // Re-evaluate auth every single time the route changes
    $route() {
      this.updateAuthStatus();
    },
  },
  methods: {
    updateAuthStatus() {
      this.isAuthenticated = authService.isAuthenticated();
    },
  },
  mounted() {
    this.updateAuthStatus();
  },
};
</script>

<style>
/* Your global layout styles */
</style>
