<template>
  <div class="profile-page">
    <main class="page-content">
      <div class="tabs-header">
        <button
          :class="['tab-btn', { active: activeTab === 'profile' }]"
          @click="activeTab = 'profile'"
        >
          Profile
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'meals' }]"
          @click="activeTab = 'meals'"
        >
          My Meals
        </button>
      </div>

      <!-- Profile Tab -->
      <section v-if="activeTab === 'profile'" class="profile-header">
        <div class="user-card">
          <div class="user-identity">
            <div class="avatar-placeholder">
              <span class="initials">{{ userInitials }}</span>
            </div>
            <h2 class="username">
              {{ currentUser?.firstName || "Username" }}
              {{ currentUser?.lastName || "" }}
            </h2>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ stats.mealsAttended }}</span>
              <span class="stat-label">attended meals</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.hostedEvents }}</span>
              <span class="stat-label">hosted meal</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" v-if="dbUser?.rating > 0"
                >{{ dbUser.rating }} / 5
              </span>
              <span class="stat-value" v-else>N/A</span>
              <span class="stat-label">rate</span>
            </div>
            <div class="stat-item">
              <span
                class="stat-value"
                v-if="receivedReviews && receivedReviews.length > 0"
                >{{ receivedReviews.length }}</span
              >
              <span class="stat-value" v-else>0</span>
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
              {{
                dbUser?.bio ||
                "No biography provided yet. Update your profile to tell other foodies about yourself!"
              }}
            </p>

            <div class="bio-actions">
              <button
                v-if="!isEditingBio"
                @click="startEditingBio"
                class="btn-outline"
              >
                Edit Bio
              </button>
              <template v-else>
                <button
                  @click="saveBio"
                  class="btn-primary"
                  :disabled="isSavingBio"
                >
                  {{ isSavingBio ? "Saving..." : "Save" }}
                </button>
                <button
                  @click="cancelEditingBio"
                  class="btn-outline"
                  style="margin-left: 10px"
                  :disabled="isSavingBio"
                >
                  Cancel
                </button>
              </template>
            </div>
          </div>

          
        </div>

        <!-- Past Events Hosted Section -->
        <div
          class="past-events-section"
          v-if="pastHostedEvents && pastHostedEvents.length > 0"
        >
          <h2 class="section-title">Past Events</h2>
          <div class="past-events-grid">
            <div
              v-for="event in pastHostedEvents"
              :key="event.eventId"
              class="past-event-card"
            >
              <h4 class="past-event-title">{{ event.mealTitle }}</h4>
              <span class="past-event-rating" v-if="event.avgRating">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#ebb65b"
                  stroke="none"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  ></polygon>
                </svg>
                {{ event.avgRating }}/5
              </span>
              <span class="past-event-rating no-rating" v-else
                >No ratings yet</span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- My Meals Tab -->
      <section v-if="activeTab === 'meals'" class="management-section">
        <h2 class="section-title">My Meals</h2>
        <p v-if="userMeals.length === 0" class="no-items-message">
          No meals yet. Create your first meal to share with the community!
        </p>
        <div v-else class="items-list">
          <div v-for="meal in userMeals" :key="meal.id" class="meal-item">
            <div class="item-header">
              <h3 class="item-title">{{ meal.title }}</h3>
              <span class="item-cuisine">{{ meal.cuisine }}</span>
            </div>
            <p class="item-description">{{ meal.description }}</p>
            <p class="item-details">
              <strong>Ingredients:</strong> {{ meal.ingredients }}
            </p>
            <p v-if="meal.allergies_info" class="item-details">
              <strong>Allergies:</strong> {{ meal.allergies_info }}
            </p>
            <p v-if="meal.dietary_info" class="item-details">
              <strong>Dietary:</strong> {{ meal.dietary_info }}
            </p>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script>
import Footer from "./Footer.vue";
import { authService } from "../services/authService";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";
import { helpers } from "../utils/helpers";

export default {
  name: "ProfilePage",
  components: {
    Footer,
  },
  data() {
    return {
      activeTab: "profile",
      currentUser: null,
      dbUser: null,
      stats: {
        mealsAttended: 0,
        hostedEvents: 0,
      },
      receivedReviews: [],
      isEditingBio: false,
      editedBio: "",
      isSavingBio: false,
      userMeals: [],
      userEvents: [],
      editingEvent: null,
      pastHostedEvents: [],
    };
  },
  computed: {
    userInitials() {
      const first =
        this.currentUser?.firstName?.charAt(0)?.toUpperCase() || "U";
      const last = this.currentUser?.lastName?.charAt(0)?.toUpperCase() || "";
      return first + last;
    },
  },
  watch: {
    activeTab(newVal) {
      if (newVal === "meals") {
        this.loadUserMeals();
      } else if (newVal === "events") {
        this.loadUserEvents();
      }
    },
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
    async loadUserMeals() {
      try {
        const response = await api.get(API_ENDPOINTS.MEALS.GET_USER_MEALS);
        this.userMeals = response.meals || [];
      } catch (error) {
        console.error("Failed to load user meals:", error);
      }
    },
    async loadUserEvents() {
      try {
        const response = await api.get(API_ENDPOINTS.EVENTS.GET_USER_EVENTS);
        this.userEvents = response.events || [];
      } catch (error) {
        console.error("Failed to load user events:", error);
      }
    },
    formatDateTime(dateTimeStr) {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    },
    editEvent(event) {
      this.editingEvent = { ...event };
    },
    cancelEdit() {
      this.editingEvent = null;
    },
    async saveEventChanges() {
      if (!this.editingEvent) return;

      try {
        const response = api.put(
          API_ENDPOINTS.EVENTS.UPDATE(this.editingEvent.id),
          {
            max_guests: this.editingEvent.max_guests,
            price: this.editingEvent.price,
            location_address: this.editingEvent.location_address,
            datetime: this.editingEvent.datetime,
          },
        );
        alert("Event updated successfully!");
        this.loadUserEvents();
      } catch (error) {
        console.error("Error saving event changes:", error);
        alert("Error saving event changes");
      } finally {
        this.editingEvent = null;
      }
    },
    async deleteEvent(eventId) {
      if (!confirm("Are you sure you want to delete this event?")) return;

      try {
        // 1. Await the API call
        await api.delete(API_ENDPOINTS.EVENTS.DELETE(eventId));

        // 2. If we reach this line, the ApiClient didn't throw an error, meaning it was a success!
        alert("Event deleted successfully!");
        this.loadUserEvents();
      } catch (error) {
        // 3. If the server returns a 4xx or 5xx, or if there's a network error, it lands here.
        console.error("Error deleting event:", error);

        // Bonus: You can show the exact error message your ApiClient parsed!
        alert(error.message || "Error deleting event");
      }
    },
  },
  async mounted() {
    this.currentUser = authService.getCurrentUser();

    try {
      const response = await api.get(API_ENDPOINTS.USERS.PROFILE);

      this.dbUser = response.user;
      this.stats.mealsAttended = response.stats.mealsAttended || 0;
      this.stats.hostedEvents = response.stats.hostedEvents;
      this.receivedReviews = response.receivedReviews || [];
      this.pastHostedEvents = response.pastHostedEvents || [];
    } catch (error) {
      console.error("Failed to load profile stats:", error);
    }
  },
};
</script>

<style scoped>
@import "../assets/css/components/ProfilePage.css";
</style>
