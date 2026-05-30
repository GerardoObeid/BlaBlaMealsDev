<template>
  <div class="landing-page">
    <CreateMealEventModal
      :isOpen="showMealEventModal"
      :userMeals="userMeals"
      @close="showMealEventModal = false"
      @success="handleCreationSuccess"
    />

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

    <section class="search-section">
      <div class="search-section">
        <form @submit.prevent="handleSearch" class="search-container">
          <div class="search-field">
            <label for="date">Date</label>
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
              placeholder="0"
              v-model="form.people"
            />
          </div>

          <div class="search-field">
            <label for="cuisine">Type of food</label>
            <select id="cuisine" v-model="form.cuisine">
              <option value="">Select a cuisine</option>
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
        <h3>Authenticity</h3>
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
        <h3>Connection</h3>
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
        <h3>Opportunity</h3>
        <p>
          Monetize your culinary skills to earn supplemental income as a host,
          or discover wholesome, high-quality home-cooked meals that perfectly
          fit your budget.
        </p>
      </div>
    </section>

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
      <button class="btn-outline" @click="openMealModal">Share a Meal</button>
    </section>

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
import CreateMealEventModal from "./CreateMealEventModal.vue";
import { api } from "../services/api";
import { API_ENDPOINTS, MEAL_CUISINES } from "../utils/constants";

export default {
  name: "HomePage",
  components: {
    CreateMealEventModal,
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
      showMealEventModal: false,
      userMeals: [],
      form: {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
        people: "",
        cuisine: "",
      },
    };
  },
  methods: {
    handleSearch() {
      const query = {};
      if (this.form.date) query.date = this.form.date;
      if (this.form.time) query.time = this.form.time;
      if (this.form.people) query.people = this.form.people;
      if (this.form.cuisine) query.cuisine = this.form.cuisine;
      this.$router.push({ path: "/search", query });
    },
    openMealModal() {
      this.loadUserMeals();
      this.showMealEventModal = true;
    },
    async loadUserMeals() {
      try {
        const mealsResponse = await api.get(API_ENDPOINTS.MEALS.GET_USER_MEALS);
        this.userMeals = mealsResponse.meals || [];
      } catch (error) {
        console.error("Failed to load user meals:", error);
      }
    },
    // Triggers when the modal signals a successful entry generation
    handleCreationSuccess() {
      this.loadUserMeals(); // Keep context data reactive and fresh
      this.showMealEventModal = false;
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/LandingPage.css";
</style>
