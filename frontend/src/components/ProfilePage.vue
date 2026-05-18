<template>
  <div class="placeholder-page">
    <Navbar />
    <div class="page-content">
      <h1>Profile</h1>
      <div class="todo-message">TODO: Profile page coming soon...</div>
    </div>
  </div>
</template>

<script>
import Navbar from "./Navbar.vue";

export default {
  name: "ProfilePage",
  components: {
    Navbar,
  },
};
</script>

<style scoped>
@import "../assets/css/components/PlaceholderPage.css";
</style>
