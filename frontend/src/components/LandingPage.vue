<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img
            src="/logo.svg"
            alt="MealShare Logo"
            class="logo-icon"
            style="width: 28px; height: 28px"
          />
          <span class="logo-text">MealShare</span>
        </div>
        <nav class="nav">
          <button class="btn-outline" @click="navigateToLogin">
            Login / Sign Up
          </button>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Meet, Eat, Discover</h1>
          <p>
            Unlock new flavours and friendships through local, shared dining
            experiences
          </p>
        </div>
        <div class="hero-image">
          <div class="image-placeholder">
            <img
              src="../assets/images/dinner_party.jpg"
              alt="Dining Experience"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
      <div class="search-section">
        <form @submit.prevent="handleSearch" class="search-container">
          <div class="search-field">
            <label Lifor="date">Date</label>
            <input id="date" type="date" v-model="form.date" />
          </div>

          <div class="search-field">
            <label for="time">Hour</label>
            <input id="time" type="time" v-model="form.time" />
          </div>

          <div class="search-field">
            <label for="people">Number of people</label>
            <input
              id="people"
              type="number"
              placeholder="1"
              v-model="form.people"
            />
          </div>

          <div class="search-field">
            <label for="cuisine">Type of food</label>
            <select id="cuisine" v-model="form.cuisine">
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
    </section>

    <SearchResults
      v-if="searchPerformed"
      :results="searchResults"
      :userLocation="userLocation"
      :loading="searchLoading"
    />

    <!-- Value Props Section -->
    <section class="value-props">
      <div class="value-card">
        <div class="card-icon">🥘</div>
        <h3>Authenticity</h3>
        <p>
          Skip mass-produced fast food. Enjoy unique, authentic dishes crafted
          with fresh ingredients, care, and secret family recipes you won't find
          in traditional restaurants.
        </p>
      </div>
      <div class="value-card">
        <div class="card-icon">👥</div>
        <h3>Connection</h3>
        <p>
          Come for the flavors, stay for the "bla bla." Turn dining into a
          social experience. Break bread with neighbors, share great
          conversations, and build genuine community.
        </p>
      </div>
      <div class="value-card">
        <div class="card-icon">💰</div>
        <h3>Opportunity</h3>
        <p>
          Monetize your culinary skills to earn supplemental income as a host,
          or discover wholesome, high-quality home-cooked meals that perfectly
          fit your budget.
        </p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <h2>Share a Meal. Reduce Costs.</h2>
      <p>
        Offer a seat at your table or save on grocery costs with your empty
        chairs.
      </p>
      <p>
        It's simple: publish your meal, and your guests will split the cost of
        ingredients with you.
      </p>
      <button class="btn-outline" @click="openShareMealModal">
        Share a Meal
      </button>
    </section>

    <!-- Footer -->
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
import { useRouter } from "vue-router";
import CreateMealEventModal from "./CreateMealEventModal.vue";
import SearchResults from "./SearchResults.vue";
import { authService } from "../services/authService";
import { api } from "../services/api";
import { API_ENDPOINTS, MEAL_CUISINES } from "../utils/constants";

export default {
  name: "LandingPage",
  components: {
    CreateMealEventModal,
    SearchResults,
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return {
      cuisinesList: MEAL_CUISINES,
      showMealEventModal: false,
      userMeals: [],
      searchResults: [],
      searchLoading: false,
      searchPerformed: false,
      userLocation: { lat: 43.5808, lng: 7.1239 },
      form: {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
        people: "",
        cuisine: "",
      },
    };
  },
  methods: {
    navigateToLogin() {
      this.$router.push("/login");
    },
    openShareMealModal() {
      const user = authService.getCurrentUser();
      if (!user) {
        this.navigateToLogin();
        return;
      }
      this.loadUserMeals();
      this.showMealEventModal = true;
    },
    closeMealEventModal() {
      this.showMealEventModal = false;
    },
    async loadUserMeals() {
      try {
        const mealsResponse = await api.get(API_ENDPOINTS.MEALS.GET_USER_MEALS);
        this.userMeals = mealsResponse.meals || [];
      } catch (error) {
        console.error("Failed to load user meals:", error);
      }
    },
    async handleCreateMeal(mealData) {
      try {
        const response = await api.post(API_ENDPOINTS.MEALS.CREATE, mealData);
        this.userMeals.push(response.meal);
        alert("Meal created successfully!");
        this.showMealEventModal = false;
      } catch (error) {
        console.error("Failed to create meal:", error);
        alert("Error creating meal. Please try again.");
      }
    },
    async handleCreateEvent(eventData) {
      try {
        const response = await api.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
        alert("Event created successfully!");
        this.showMealEventModal = false;
      } catch (error) {
        console.error("Failed to create event:", error);
        alert("Error creating event. Please try again.");
      }
    },
    async handleSearch() {
      this.searchLoading = true;
      this.searchPerformed = true;
      this.searchResults = [];

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
      const params = new URLSearchParams();
      if (this.form.date) params.append("date", this.form.date);
      if (this.form.time) params.append("time", this.form.time);
      if (this.form.people) params.append("people", this.form.people);
      if (this.form.cuisine) params.append("cuisine", this.form.cuisine);

      try {
        const url = `${API_ENDPOINTS.EVENTS.SEARCH}?${params.toString()}`;
        const response = await api.get(url);
        this.searchResults = response.events || [];
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        this.searchLoading = false;
      }
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/LandingPage.css";
</style>
