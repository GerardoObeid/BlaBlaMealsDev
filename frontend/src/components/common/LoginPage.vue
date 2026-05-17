<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <h1 class="logo">🍽️ Bla Bla Meals</h1>
        <p class="tagline">Share Your Home-Cooked Passion</p>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
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

        <div class="form-group">
          <label for="role">I am a...</label>
          <select v-model="form.role" id="role" class="form-select">
            <option value="user">👤 Regular User</option>
            <option value="chef">👨‍🍳 Chef</option>
          </select>
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
import { authService } from "../../services/authService";

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
        role: "user",
      },
    };
  },
  methods: {
    async submit() {
      this.error = null;

      if (!this.form.email || !this.form.password) {
        this.error = "Please fill in all fields";
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
          response = await this.authService.signup({
            email: this.form.email,
            password: this.form.password,
            firstName: this.form.email.split("@")[0],
            lastName: "User",
            role: this.form.role,
          });
        } else {
          response = await this.authService.login(
            this.form.email,
            this.form.password,
          );
        }

        const dashboardRoute =
          response.user.role === "chef" ? "/chef/home" : "/user/home";
        this.router.push(dashboardRoute);
      } catch (e) {
        this.error = e.message || "Login failed. Please try again.";
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
@import "../../assets/css/components/LoginPage.css";
</style>
