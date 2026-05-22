<template>
  <div class="profile-page">
    <Navbar />

    <main class="page-content">
      <section class="profile-header">
        <div class="user-card">
          <div class="user-identity">
            <div class="avatar-placeholder">
              <span class="initials">{{ userInitials }}</span>
            </div>
            <h2 class="username">{{ currentUser?.firstName || 'Username' }} {{ currentUser?.lastName || '' }}</h2>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{stats.mealsAttended}}</span>
              <span class="stat-label">attended meals</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{stats.hostedEvents}}</span>
              <span class="stat-label">hosted meal</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" v-if='dbUser?.rating > 0'>{{dbUser.rating}}</span>
              <span class="stat-value" v-else>N/A</span>
              <span class="stat-label">rate</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">2</span>
              <span class="stat-label">reviews</span>
            </div>
            
          </div>
        </div>

        <div class="personal-info">
          <h2 class="section-title">Personal Information</h2>
          
          <div class="bio-container">
            <textarea 
              v-if="isEditingBio" 
              v-model="editedBio" 
              class="bio-textarea form-input" 
              placeholder="Write something about yourself..."
              rows="4"
            ></textarea>
            <p v-else class="bio-text">
              {{ dbUser?.bio || 'No biography provided yet. Update your profile to tell other foodies about yourself!' }}
            </p>

            <div class="bio-actions">
              <button v-if="!isEditingBio" @click="startEditingBio" class="btn-outline">Edit Bio</button>
              <template v-else>
                <button @click="saveBio" class="btn-primary" :disabled="isSavingBio">
                  {{ isSavingBio ? 'Saving...' : 'Save' }}
                </button>
                <button @click="cancelEditingBio" class="btn-outline" style="margin-left: 10px;" :disabled="isSavingBio">
                  Cancel
                </button>
              </template>
            </div>
          </div>

          <br />
          <h3 class="subsection-title">Cuisine Specialties</h3>
        </div>
      </section>

      <section class="attended-meals-section">
        <h2 class="section-title">Attended Meals</h2>
        
        <div class="meals-grid" v-if="attendedMeals && attendedMeals.length > 0">
          <div class="meal-card" v-for="(meal, index) in attendedMeals" :key="'meal-'+index">          
            <div class="meal-details">
              <h4 class="meal-title">{{ meal.mealTitle }}</h4>
              <span class="host-name">Host: {{ meal.hostFirstName }} {{ meal.hostLastName }}</span>
              <span class="meal-date">📅 {{ formatEventDate(meal.eventDate) }}</span>
              <span class="meal-address">📍 {{ meal.eventAddress }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="bio-text">You haven't attended any meals yet.</p>
        </div>
      </section>

      <section class="reviews-section">
        <h2 class="section-title">Reviews</h2>
        <div class="reviews-grid">
          <div class="review-item" v-for="n in 3" :key="'review-'+n">
            <h4 class="reviewer-name">John Doe</h4>
            <span class="review-date">march 2026</span>
            <p class="review-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
              do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </section>
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
import { authService } from "../services/authService";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";
import { helpers } from "../utils/helpers";

export default {
  name: "ProfilePage",
  components: {
    Navbar,
  },
  data() {
    return {
      currentUser: null,
      dbUser: null,
      stats: {
        mealsAttended: 0,
        hostedEvents: 0 // Added to state
      },
      attendedMeals: [],
      isEditingBio: false,
      editedBio: "",
      isSavingBio: false
    };
  },
  computed: {
    userInitials() {
      const first = this.currentUser?.firstName?.charAt(0)?.toUpperCase() || "U";
      const last = this.currentUser?.lastName?.charAt(0)?.toUpperCase() || "";
      return first + last;
    }
  },
  methods: {
    startEditingBio() {
      this.editedBio = this.dbUser?.bio || "";
      this.isEditingBio = true;
    },
    cancelEditingBio() {
      this.isEditingBio = false;
      this.editedBio = "";
    },
    async saveBio() {
      this.isSavingBio = true;
      try {
        await api.put(API_ENDPOINTS.USERS.PROFILE, { bio: this.editedBio });
        this.dbUser.bio = this.editedBio;
        this.isEditingBio = false;
      } catch (error) {
        console.error("Failed to save bio:", error);
        alert("There was an error saving your bio. Please try again.");
      } finally {
        this.isSavingBio = false;
      }
    },
    formatEventDate(dateTimeStr) {
      // Using your helper function to format the string
      return helpers.formatDateTime(dateTimeStr);
    }
  },
  async mounted() {
    this.currentUser = authService.getCurrentUser();
    
    try {
      const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
      
      this.dbUser = response.user;
      this.stats.mealsAttended = response.stats.mealsAttended || 0;
      this.stats.hostedEvents = response.stats.hostedEvents; 
      this.attendedMeals = response.attendedMeals || [];

    } catch (error) {
      console.error("Failed to load dynamic profile stats:", error);
    }
  }
};
</script>

<style scoped>
@import "../assets/css/components/ProfilePage.css";
</style>