<template>
  <div class="app-container">
    <Header v-if="isAuthenticated" @logout="handleLogout" />
    <router-view />
  </div>
</template>
