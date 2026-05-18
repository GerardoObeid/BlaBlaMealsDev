<template>
  <div class="placeholder-page">
    <Navbar />
    <div class="page-content">
      <h1>Bookings</h1>
      <div class="todo-message">TODO: Bookings page coming soon...</div>
    </div>
  </div>
</template>

<script>
import Navbar from "./Navbar.vue";

export default {
  name: "BookingsPage",
  components: {
    Navbar,
  },
};
</script>

<style scoped>
@import "../assets/css/components/PlaceholderPage.css";
</style>
