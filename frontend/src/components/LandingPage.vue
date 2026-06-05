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
        <div class="hero-video">
          <div class="video-placeholder">
            <video autoplay muted loop playsinline>
              <source src="/animvideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
      <h2 class="sr-only">Search for Meals</h2>
      <div class="search-section">
        <form @submit.prevent="handleSearch" class="search-container">
          <div class="search-field">
            <label for="date">Date</label>
            <input id="date" type="date" v-model="form.date" :min="minDate" />
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

    <!-- Value Props Section -->
    <section class="value-props">
      <div class="value-card">
        <div class="card-icon">
          <svg
            class="value-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 2v3M9 2v3M15 2v3M4 11h16a1 1 0 0 1 1 1v3a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3a1 1 0 0 1 1-1z"
            />
            <path d="M21 14h2M1 14h2" />
          </svg>
        </div>
        <h2>Authenticity</h2>
        <p>
          Skip mass-produced fast food. Enjoy unique, authentic dishes crafted
          with fresh ingredients, care, and secret family recipes you won't find
          in traditional restaurants.
        </p>
      </div>
      <div class="value-card">
        <div class="card-icon">
          <svg
            class="value-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2>Connection</h2>
        <p>
          Come for the flavors, stay for the "bla bla." Turn dining into a
          social experience. Break bread with neighbors, share great
          conversations, and build genuine community.
        </p>
      </div>
      <div class="value-card">
        <div class="card-icon">
          <svg
            class="value-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h2>Opportunity</h2>
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

    <Footer />
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import CreateMealEventModal from "./CreateMealEventModal.vue";
import Footer from "./Footer.vue";
import { authService } from "../services/authService";
import { api } from "../services/api";
import { API_ENDPOINTS, MEAL_CUISINES } from "../utils/constants";

export default {
  name: "LandingPage",
  components: {
    CreateMealEventModal,
    Footer,
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
      minDate: `${year}-${month}-${day}`,
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
    handleSearch() {
      const query = {};
      if (this.form.date) query.date = this.form.date;
      if (this.form.time) query.time = this.form.time;
      if (this.form.people) query.people = this.form.people;
      if (this.form.cuisine) query.cuisine = this.form.cuisine;
      this.$router.push({ path: "/search", query });
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/LandingPage.css";
</style>
