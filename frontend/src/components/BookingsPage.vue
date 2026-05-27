<template>
  <div class="bookings-page">
    <main class="page-content">
      <h1 class="page-title">My Bookings</h1>

      <div v-if="isLoading" class="loading-state">Loading your bookings...</div>
      
      <div v-else-if="bookings.length === 0" class="empty-state">
        <p>You don't have any bookings yet.</p>
        <router-link to="/home" class="btn-primary">Find a Meal</router-link>
      </div>

      <div v-else class="bookings-list">
        <div class="booking-card" v-for="booking in bookings" :key="booking.bookingId">
          
          <div class="card-header">
            

            <div class="meal-info">
              <h2 class="meal-title">{{ booking.mealTitle }}</h2>
              
              <div class="menu-toggle" @click="toggleMenu(booking.bookingId)">
                <svg v-if="!isExpanded(booking.bookingId)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>See Menu</span>
              </div>
            </div>

            <div class="datetime-info">
              <div class="info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{{ formatDate(booking.eventDate) }}</span>
              </div>
              <div class="info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{{ formatTime(booking.eventDate) }}</span>
              </div>
            </div>
          </div>

          <div class="card-details" v-show="isExpanded(booking.bookingId)">
            <p class="description"><strong>Description:</strong> {{ booking.mealDescription }}</p>
            <p class="ingredients"><strong>Ingredients:</strong> {{ booking.ingredients }}</p>
            <div class="extra-info">
              <span><strong>Host:</strong> {{ booking.hostFirstName }} {{ booking.hostLastName }}</span>
              <span><strong>Location:</strong> {{ booking.location }}</span>
              <span><strong>Seats Booked:</strong> {{ booking.guestCount }}</span>
              <span :class="['status-badge', booking.status]">{{ booking.status }}</span>
            </div>
          </div>

        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Use cases</h4>
          <ul>
            <li><a href="#0">UI design</a></li>
            <li><a href="#0">UX design</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Explore</h4>
          <ul>
            <li><a href="#0">Design</a></li>
            <li><a href="#0">Prototyping</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#0">Blog</a></li>
            <li><a href="#0">Best practices</a></li>
          </ul>
        </div>
      </div>
      <p>&copy; 2026 Bla Bla Meals. Share your home-cooked passion.</p>
    </footer>
  </div>
</template>

<script>
import Navbar from "./Navbar.vue";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";

export default {
  name: "BookingsPage",
  components: {
  },
  data() {
    return {
      bookings: [],
      isLoading: true,
      expandedMenus: [] // Array to track which booking IDs have their menu expanded
    };
  },
  methods: {
    async fetchBookings() {
      try {
        this.isLoading = true;
        const response = await api.get(API_ENDPOINTS.BOOKINGS.LIST);
        this.bookings = response;
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        this.isLoading = false;
      }
    },
    toggleMenu(bookingId) {
      const index = this.expandedMenus.indexOf(bookingId);
      if (index > -1) {
        this.expandedMenus.splice(index, 1); // Close it
      } else {
        this.expandedMenus.push(bookingId); // Open it
      }
    },
    isExpanded(bookingId) {
      return this.expandedMenus.includes(bookingId);
    },
    // Formats ISO string into DD/MM like the mockup
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    },
    // Formats ISO string into HH:MM like the mockup
    formatTime(dateString) {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  },
  mounted() {
    this.fetchBookings();
  }
};
</script>

<style scoped>
@import "../assets/css/components/Bookings.css";
</style>