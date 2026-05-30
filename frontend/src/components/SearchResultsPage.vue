<template>
  <div
    class="search-results-page"
    :class="{ 'is-authenticated': isAuthenticated }"
  >
    <!-- Header for unauthenticated users (same as LandingPage header) -->
    <header v-if="!isAuthenticated" class="header">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
          <img
            src="/logo.svg"
            alt="MealShare Logo"
            class="logo-icon"
            style="width: 28px; height: 28px"
          />
          <span class="logo-text">MealShare</span>
        </div>
        <nav class="nav">
          <button class="btn-outline" @click="$router.push('/login')">
            Login / Sign Up
          </button>
        </nav>
      </div>
    </header>

    <!-- Fixed search bar -->
    <div class="search-bar-fixed">
      <form @submit.prevent="handleSearch" class="search-bar-container">
        <div class="search-field">
          <label for="search-date">Date</label>
          <input id="search-date" type="date" v-model="form.date" />
        </div>

        <div class="search-field">
          <label for="search-time">Hour</label>
          <input id="search-time" type="time" v-model="form.time" />
        </div>

        <div class="search-field">
          <label for="search-people">Number of people</label>
          <input
            id="search-people"
            type="number"
            placeholder="1"
            v-model="form.people"
          />
        </div>

        <div class="search-field">
          <label for="search-cuisine">Type of food</label>
          <select id="search-cuisine" v-model="form.cuisine">
            <option value="">Any cuisine</option>
            <option
              v-for="cuisine in cuisinesList"
              :key="cuisine"
              :value="cuisine"
            >
              {{ cuisine }}
            </option>
          </select>
        </div>

        <button type="submit" class="btn-primary">Search</button>
      </form>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="results-loading">
      <span class="loading-spinner"></span>
      <p>Searching for meals...</p>
    </div>

    <!-- No results -->
    <div
      v-else-if="searchPerformed && results.length === 0"
      class="no-results-page"
    >
      <img src="/logo.svg" alt="MealShare Logo" class="no-results-logo" />
      <p>No meals found matching your criteria. Try adjusting your filters!</p>
    </div>

    <!-- Two-column results -->
    <div v-else-if="results.length > 0" class="results-content">
      <!-- Left: scrollable cards -->
      <div class="results-cards-column">
        <div class="meal-card" v-for="event in results" :key="event.event_id">
          <div class="card-header">
            <!-- Host avatar placeholder -->
            <div class="host-avatar">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div class="meal-info">
              <h2 class="meal-title">{{ event.meal_title }}</h2>

              <div class="menu-toggle" @click="toggleDetails(event.event_id)">
                <svg
                  v-if="!isExpanded(event.event_id)"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <svg
                  v-else
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>See Menu</span>
              </div>
            </div>

            <div class="datetime-info">
              <div class="info-item">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ formatTime(event.datetime) }}</span>
              </div>
            </div>
          </div>

          <!-- Expandable details -->
          <div class="card-details" v-show="isExpanded(event.event_id)">
            <p><strong>Cuisine:</strong> {{ event.cuisine }}</p>
            <p><strong>Description:</strong> {{ event.description }}</p>
            <div class="extra-info">
              <span
                ><strong>Host:</strong> {{ event.host_first_name }}
                {{ event.host_last_name }}</span
              >
              <span
                ><strong>Location:</strong> {{ event.location_address }}</span
              >
              <span
                ><strong>Seats Left:</strong> {{ event.available_seats }}</span
              >
              <span
                ><strong>Price:</strong> €{{
                  Number(event.price).toFixed(2)
                }}/person</span
              >
              <span
                ><strong>Date:</strong> {{ formatDate(event.datetime) }}</span
              >
            </div>
            <div class="card-actions">
              <button
                class="btn-book"
                @click="bookEvent(event)"
                :disabled="event.available_seats < 1"
              >
                {{ event.available_seats < 1 ? "Fully Booked" : "Book" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: fixed map -->
      <div class="results-map-column">
        <div ref="mapContainer" class="results-map"></div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

import Footer from "./Footer.vue";
import { authService } from "../services/authService";
import { api } from "../services/api";
import { API_ENDPOINTS, MEAL_CUISINES } from "../utils/constants";
import { toast } from "../utils/toast";

export default {
  name: "SearchResultsPage",
  components: {
    Footer,
  },
  data() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return {
      cuisinesList: MEAL_CUISINES,
      results: [],
      loading: false,
      searchPerformed: false,
      userLocation: { lat: 43.5808, lng: 7.1239 },
      expandedCards: [],
      mapInstance: null,
      form: {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
        people: "",
        cuisine: "",
      },
    };
  },
  computed: {
    isAuthenticated() {
      return authService.isAuthenticated();
    },
  },
  mounted() {
    // Read query params from URL and populate form
    const query = this.$route.query;
    if (query.date) this.form.date = query.date;
    if (query.time) this.form.time = query.time;
    if (query.people) this.form.people = query.people;
    if (query.cuisine) this.form.cuisine = query.cuisine;

    // Auto-search if any query params are present
    if (Object.keys(query).length > 0) {
      this.handleSearch();
    }
  },
  watch: {
    results(newResults) {
      if (newResults && newResults.length > 0) {
        this.$nextTick(() => {
          this.renderMap();
        });
      }
    },
  },
  methods: {
    async handleSearch() {
      this.loading = true;
      this.searchPerformed = true;
      this.results = [];

      // Get user location (best-effort, fallback to Antibes)
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          })
        );
        this.userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      } catch {
        // Keep Antibes fallback
      }

      // Build query string from form filters
      const queryParams = {};
      const params = new URLSearchParams();
      if (this.form.date) {
        params.append("date", this.form.date);
        queryParams.date = this.form.date;
      }
      if (this.form.time) {
        params.append("time", this.form.time);
        queryParams.time = this.form.time;
      }
      if (this.form.people) {
        params.append("people", this.form.people);
        queryParams.people = this.form.people;
      }
      if (this.form.cuisine) {
        params.append("cuisine", this.form.cuisine);
        queryParams.cuisine = this.form.cuisine;
      }

      // Update URL to reflect current search (bookmarkable)
      this.$router.replace({ query: queryParams });

      try {
        const url = `${API_ENDPOINTS.EVENTS.SEARCH}?${params.toString()}`;
        const response = await api.get(url);
        this.results = response.events || [];
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        this.loading = false;
      }
    },
    toggleDetails(eventId) {
      const index = this.expandedCards.indexOf(eventId);
      if (index > -1) {
        this.expandedCards.splice(index, 1);
      } else {
        this.expandedCards.push(eventId);
      }
    },
    isExpanded(eventId) {
      return this.expandedCards.includes(eventId);
    },
    async bookEvent(event) {
      // If not authenticated, store intent and redirect to login
      if (!this.isAuthenticated) {
        sessionStorage.setItem(
          "pendingBookingEventId",
          String(event.event_id)
        );
        this.$router.push("/login");
        return;
      }

      // If authenticated, book directly then redirect to bookings
      try {
        await api.post(API_ENDPOINTS.BOOKINGS.CREATE, {
          eventId: event.event_id,
        });
        toast.success("You have booked a meal successfully");
        this.$router.push("/bookings");
      } catch (error) {
        toast.error(error.message || "Booking failed. Please try again.");
      }
    },
    formatDate(datetimeStr) {
      if (!datetimeStr) return "";
      const date = new Date(datetimeStr.replace(" ", "T"));
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    formatTime(datetimeStr) {
      if (!datetimeStr) return "";
      const date = new Date(datetimeStr.replace(" ", "T"));
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
    renderMap() {
      // Destroy previous map if it exists
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }

      const mapEl = this.$refs.mapContainer;
      if (!mapEl) return;

      // Create map
      const map = L.map(mapEl).setView(
        [this.userLocation.lat, this.userLocation.lng],
        14
      );
      this.mapInstance = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Collect bounds for all markers
      const bounds = L.latLngBounds();

      // Event markers
      this.results.forEach((event) => {
        if (event.latitude && event.longitude) {
          const marker = L.marker([event.latitude, event.longitude]).addTo(
            map
          );

          marker.bindPopup(`
            <div style="min-width: 150px;">
              <strong>${event.meal_title}</strong><br/>
              <em>${event.cuisine}</em><br/>
              🕐 ${this.formatTime(event.datetime)}<br/>
              💰 €${Number(event.price).toFixed(2)}/person<br/>
              🪑 ${event.available_seats} seats left
            </div>
          `);

          bounds.extend([event.latitude, event.longitude]);
        }
      });

      // Fit map to show all markers
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    },
  },
  beforeUnmount() {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  },
};
</script>

<style scoped>
@import "../assets/css/components/SearchResultsPage.css";
</style>
