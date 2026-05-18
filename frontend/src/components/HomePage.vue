<template>
  <div class="landing-page">
    <Navbar />

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
      <button class="btn-outline">Share a Meal</button>
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
import Navbar from "./Navbar.vue";
import { MEAL_CUISINES } from "../utils/constants";

export default {
  name: "HomePage",
  components: {
    Navbar,
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
      console.log("Searching with criteria:", this.form);
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/LandingPage.css";
</style>
