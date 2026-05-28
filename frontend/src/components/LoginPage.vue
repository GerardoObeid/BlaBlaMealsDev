<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <h1 class="logo">🍽️ Bla Bla Meals</h1>
        <p class="tagline">Share Your Home-Cooked Passion</p>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div v-if="isSignUp" class="form-group">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            placeholder="John"
            :required="isSignUp"
            class="form-input"
          />
        </div>

        <div v-if="isSignUp" class="form-group">
          <label for="lastName">Last Name</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            placeholder="Smith"
            :required="isSignUp"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="john.smith@example.com"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            class="form-input"
          />
          <small class="hint">Minimum 8 characters</small>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="loading" class="loading-message">Processing...</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ isSignUp ? "Create Account" : "Login" }}
        </button>
      </form>

      <div class="toggle-section">
        <p>
          {{ isSignUp ? "Already have an account?" : "Don't have an account?" }}
        </p>
        <button type="button" class="btn-link" @click="toggleMode">
          {{ isSignUp ? "Login instead" : "Sign up here" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { authService } from "../services/authService";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";
import { toast } from "../utils/toast";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();

    return {
      router,
      authService,
    };
  },
  data() {
    return {
      isSignUp: false,
      loading: false,
      error: null,
      form: {
        email: "",
        password: "",
        firstName: "", // Added to form state
        lastName: "",  // Added to form state
      },
    };
  },
  methods: {
    async submit() {
      this.error = null;

      // Validate base fields
      if (!this.form.email || !this.form.password) {
        this.error = "Please fill in all required fields";
        return;
      }

      // Validate sign-up specific fields
      if (this.isSignUp && (!this.form.firstName || !this.form.lastName)) {
        this.error = "Please fill in your first and last name";
        return;
      }

      if (this.form.password.length < 8) {
        this.error = "Password must be at least 8 characters";
        return;
      }

      this.loading = true;

      try {
        let response;
        if (this.isSignUp) {
          // Now sending the actual values inputted by the user
          response = await this.authService.signup({
            email: this.form.email,
            password: this.form.password,
            firstName: this.form.firstName,
            lastName: this.form.lastName,
          });
        } else {
          response = await this.authService.login(
            this.form.email,
            this.form.password,
          );
        }

        // Check for a pending booking from the search results page
        const pendingEventId = sessionStorage.getItem(
          "pendingBookingEventId"
        );
        if (pendingEventId) {
          sessionStorage.removeItem("pendingBookingEventId");
          try {
            await api.post(API_ENDPOINTS.BOOKINGS.CREATE, {
              eventId: parseInt(pendingEventId, 10),
            });
            toast.success("You have booked a meal successfully");
          } catch (e) {
            console.error("Auto-booking failed:", e);
            toast.error(e.message || "Auto-booking failed");
          }
          this.router.push("/bookings");
        } else {
          this.router.push("/home");
        }
      } catch (e) {
        this.error = e.message || "Request failed. Please try again.";
        console.error("Auth error:", e);
      } finally {
        this.loading = false;
      }
    },

    toggleMode() {
      this.isSignUp = !this.isSignUp;
      this.error = null;
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/LoginPage.css";
</style>