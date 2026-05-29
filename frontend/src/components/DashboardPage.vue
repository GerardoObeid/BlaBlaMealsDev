<template>
  <div class="dashboard-page">
    
  <CreateMealEventModal
    :isOpen="showMealEventModal"
    :userMeals="userMeals"
    @close="closeMealEventModal"
    @success="fetchDashboardData"
  />
  <div v-if="editingEvent" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content edit-event-form">
        <h3>Edit Event</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="edit-max-guests">Max Guests</label>
            <input id="edit-max-guests" v-model.number="editingEvent.max_guests" type="number" min="1" class="form-input" />
          </div>

          <div class="form-group">
            <label for="edit-price">Price per Person ($)</label>
            <input id="edit-price" v-model.number="editingEvent.price" type="number" min="0.01" step="0.01" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label for="edit-location">Location Address</label>
          <input id="edit-location" v-model="editingEvent.location_address" type="text" class="form-input" />
        </div>

        

        <div class="form-group">
          <label for="edit-datetime">Date & Time</label>
          <input id="edit-datetime" v-model="editingEvent.datetime" type="datetime-local" class="form-input" />
        </div>

        <div class="guests-section">
          <h4>Guests ({{ eventGuests.length }})</h4>
          <ul v-if="eventGuests.length > 0" class="guest-list">
            <li v-for="guest in eventGuests" :key="guest.booking_id" class="guest-item">
              <span>{{ guest.first_name }} {{ guest.last_name }}</span>
              <button @click.prevent="removeGuest(guest.booking_id)" class="btn-remove-guest">Remove</button>
            </li>
          </ul>
          <p v-else class="no-guests-message">No guests have booked this event yet.</p>
        </div>
        

        <div class="edit-actions">
          <button @click="saveEventChanges" class="btn-primary">Save Changes</button>
          <button @click="closeEditModal" class="btn-outline">Cancel</button>
        </div>
      </div>
    </div>

    <main class="page-content">
      <div class="dashboard-split">
        
        <section class="planned-meals-section">
          <h2 class="section-title">Planned Events</h2>
          <p v-if="userEvents.length === 0" class="no-items-message">
            No meals yet. Create your first meal to share with the community!
          </p>
          
          <div v-else class="events-list">
            <div v-for='event in userEvents' :key="event.id" class="event-container">
              <div class="planned-meal-card">
                <div class="meal-details">
                  <h3>{{event.meal_title}}</h3>
                  
                  <div class="menu-toggle" @click="toggleDetails(event.id)">
                    <svg v-if="!isExpanded(event.id)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>See Details</span>
                  </div>
                </div>
                
                <div class="meal-datetime">
                  <div class="datetime-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{{formatDate(event.datetime)}}</span>
                  </div>
                  <div class="datetime-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{{formatTime(event.datetime)}}</span>
                  </div>
                </div>
              </div>

              <div class="card-details" v-show="isExpanded(event.id)">
                <p><strong>Location:</strong> {{ event.location_address || 'Not specified' }}</p>
                <p><strong>Available Seats:</strong> {{ event.available_seats || 0 }}</p>
                
                <div class="card-actions">
                  <button class="btn-manage" @click="openEditModal(event)">Manage Event</button>
                </div>
              </div>

            </div>
          </div>

          <button class="btn-create-new" @click="openShareMealModal">Create New Meal</button>
        </section>

        <section class="notifications-section">
          <div class="notifications-card">
            <h2 class="section-title">Notifications</h2>
            <ul class="notification-list">
              <li>Pasta Carbonara - New booking: John</li>
              <li>Sarah has left you a review</li>
            </ul>
          </div>
        </section>

      </div>
    </main>

    </div>
</template>
<script>
import Navbar from "./Navbar.vue";
import CreateMealEventModal from "./CreateMealEventModal.vue"; // 1. Import
import { authService } from "../services/authService"; // 2. Import auth
import { api } from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";
import { toast } from "../utils/toast";

export default {
  name: "DashboardPage",
  components: {
    Navbar,
    CreateMealEventModal // Register
  },
  data() {
    return {
      userEvents: [],
      notifications: [],
      expandedEvents: [],
      
      // Modal State (Same as Landing Page)
      showMealEventModal: false,
      userMeals: [],
      editingEvent: null,
      eventGuests: []
    }
  },
  async mounted() {
    await this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const responseEvents = await api.get(API_ENDPOINTS.EVENTS.GET_USER_EVENTS);
        this.userEvents = responseEvents.events || [];
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } 
    },

    openEditModal(event) {
      // Create a copy of the event so we don't mutate the UI before saving
      this.editingEvent = { ...event };
      this.loadEventGuests(event.id);
    },
    
    closeEditModal() {
      this.editingEvent = null;
      this.eventGuests = [];
    },

    async loadEventGuests(eventId) {
      try {
        const response = await api.get(API_ENDPOINTS.EVENTS.GET_GUESTS(eventId));
        this.eventGuests = response.guests || [];
      } catch (error) {
        console.error("Failed to load guests:", error);
      }
    },

    async removeGuest(bookingId) {
      if (!confirm("Are you sure you want to remove this guest? This will free up their seat.")) return;
      
      try {
        await api.delete(API_ENDPOINTS.EVENTS.REMOVE_GUEST(this.editingEvent.id, bookingId));
        alert("Guest removed successfully!");
        
        // Refresh the guest list and the dashboard events (to update seat counts)
        this.loadEventGuests(this.editingEvent.id);
        this.fetchDashboardData();
      } catch (error) {
        console.error("Failed to remove guest:", error);
        alert("Error removing guest. Please try again.");
      }
    },
    
    async saveEventChanges() {
      if (!this.editingEvent) return;

      try {
        await api.put(
          API_ENDPOINTS.EVENTS.UPDATE(this.editingEvent.id),
          {
            max_guests: this.editingEvent.max_guests,
            price: this.editingEvent.price,
            location_address: this.editingEvent.location_address,
            datetime: this.editingEvent.datetime,
          }
        );
        
        alert("Event updated successfully!");
        this.closeEditModal();
        
        // Refresh the dashboard data to show the updated event details
        this.fetchDashboardData(); 
      } catch (error) {
        console.error("Error saving event changes:", error);
        alert("Error saving event changes");
      }
    },

    // --- EXACT METHODS FROM LANDING PAGE ---
    openShareMealModal() {
      const user = authService.getCurrentUser();
      if (!user) {
        this.$router.push("/login");
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
        
        // Refresh dashboard to show changes
        this.fetchDashboardData(); 
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
        
        // Refresh dashboard to show new event
        this.fetchDashboardData(); 
      } catch (error) {
        console.error("Failed to create event:", error);
        alert("Error creating event. Please try again.");
      }
    },
    // ---------------------------------------

    // Details Dropdown logic
    toggleDetails(eventId) {
      const index = this.expandedEvents.indexOf(eventId);
      if (index > -1) {
        this.expandedEvents.splice(index, 1);
      } else {
        this.expandedEvents.push(eventId);
      }
    },
    isExpanded(eventId) {
      return this.expandedEvents.includes(eventId);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style scoped>
/* Link to the newly created CSS file */
@import "../assets/css/components/DashboardPage.css";
</style>