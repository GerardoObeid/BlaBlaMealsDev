<template>
  <div class="placeholder-page">
    <Navbar />
    <div class="page-content">
      <h1>Dashboard</h1>
      <div class="todo-message">TODO: Dashboard page coming soon...</div>
    </div>
  </div>
</template>

<script>
import Navbar from "./Navbar.vue";

export default {
  name: "DashboardPage",
  components: {
    Navbar,
  },
};
</script>

<style scoped>
@import "../assets/css/components/PlaceholderPage.css";
</style>
