<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>{{ activeTab === "meal" ? "Create Meal" : "Create Event" }}</h2>
        <button class="btn-close" @click="closeModal">&times;</button>
      </div>

      <div class="modal-tabs">
        <button
          :class="['tab-button', { active: activeTab === 'meal' }]"
          @click="activeTab = 'meal'"
        >
          Create Meal
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'event' }]"
          @click="activeTab = 'event'"
        >
          Create Event
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-if="activeTab === 'meal'" class="form-section">
          <div class="form-group">
            <label for="meal-title">Meal Title *</label>
            <input
              id="meal-title"
              v-model="mealForm.title"
              type="text"
              class="form-input"
              placeholder="e.g., Authentic Carbonara"
              required
            />
          </div>

          <div class="form-group">
            <label for="meal-cuisine">Type of Food *</label>
            <select
              id="meal-cuisine"
              v-model="mealForm.cuisine"
              class="form-input"
              required
            >
              <option value="">Select a cuisine type...</option>
              <option
                v-for="cuisine in cuisines"
                :key="cuisine"
                :value="cuisine"
              >
                {{ cuisine }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="meal-desc">Description *</label>
            <textarea
              id="meal-desc"
              v-model="mealForm.description"
              class="form-input"
              rows="3"
              placeholder="Describe your meal..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="meal-ingredients">Ingredients *</label>
            <textarea
              id="meal-ingredients"
              v-model="mealForm.ingredients"
              class="form-input"
              rows="3"
              placeholder="List ingredients separated by commas"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="meal-allergies">Allergies Info</label>
            <input
              id="meal-allergies"
              v-model="mealForm.allergiesInfo"
              type="text"
              class="form-input"
              placeholder="e.g., Contains nuts, dairy"
            />
          </div>

          <div class="form-group">
            <label for="meal-dietary">Dietary Info</label>
            <input
              id="meal-dietary"
              v-model="mealForm.dietaryInfo"
              type="text"
              class="form-input"
              placeholder="e.g., Vegetarian, Gluten-free"
            />
          </div>

          <div class="form-group">
            <label for="meal-image">Image URL</label>
            <input
              id="meal-image"
              v-model="mealForm.imageUrl"
              type="url"
              class="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div
          v-if="activeTab === 'event'"
          class="form-section event-form-section"
        >
          <div class="event-form-row">
            <div class="form-left">
              <div class="form-group">
                <label for="event-meal">Select Meal *</label>
                <select
                  id="event-meal"
                  v-model="eventForm.mealId"
                  class="form-input"
                  required
                >
                  <option value="">Choose a meal...</option>
                  <option
                    v-for="meal in userMeals"
                    :key="meal.id"
                    :value="meal.id"
                  >
                    {{ meal.title }}
                  </option>
                </select>
                <p v-if="userMeals.length === 0" class="help-text">
                  You need to create a meal first.
                </p>
              </div>

              <div class="form-group">
                <label for="event-datetime">Date & Time *</label>
                <input
                  id="event-datetime"
                  v-model="eventForm.datetime"
                  type="datetime-local"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="event-location">Location Address *</label>
                <input
                  id="event-location"
                  v-model="eventForm.locationAddress"
                  type="text"
                  class="form-input"
                  placeholder="123 Main Street, City"
                  @blur="geocodeAddress"
                  required
                />
              </div>

              <button
                type="button"
                @click="getLocationFromMap"
                class="btn-secondary"
              >
                📍 Get Current Location
              </button>

              <div class="form-row">
                <div class="form-group">
                  <label for="event-max-guests">Max Guests *</label>
                  <input
                    id="event-max-guests"
                    v-model.number="eventForm.maxGuests"
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="event-price">Price per Person ($) *</label>
                  <input
                    id="event-price"
                    v-model.number="eventForm.price"
                    type="number"
                    min="0"
                    step=".50"
                    placeholder="e.g., 15.50"
                    class="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-right">
              <div class="map-container">
                <div id="event-map" class="event-map"></div>
                <p class="map-hint">Click on the map to set location</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-outline" @click="closeModal">
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="
              isSubmitting || (activeTab === 'event' && userMeals.length === 0)
            "
          >
            {{
              isSubmitting
                ? "Creating..."
                : activeTab === "meal"
                  ? "Create Meal"
                  : "Create Event"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api";
import { API_ENDPOINTS, MEAL_CUISINES } from "../utils/constants";

export default {
  name: "CreateMealEventModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    userMeals: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      activeTab: "meal",
      isSubmitting: false,
      map: null,
      marker: null,
      cuisines: MEAL_CUISINES,
      mealForm: {
        title: "",
        cuisine: "",
        description: "",
        ingredients: "",
        allergiesInfo: "",
        dietaryInfo: "",
        imageUrl: "",
      },
      eventForm: {
        mealId: "",
        datetime: "",
        locationAddress: "",
        maxGuests: null,
        availableSeats: null,
        price: null,
        latitude: null,
        longitude: null,
      },
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal && this.activeTab === "event") {
        this.$nextTick(() => {
          this.initializeMap();
        });
      }
    },
    activeTab(newVal) {
      if (newVal === "event" && this.isOpen) {
        this.$nextTick(() => {
          this.initializeMap();
        });
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
      this.resetForms();
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    },
    resetForms() {
      this.mealForm = {
        title: "",
        cuisine: "",
        description: "",
        ingredients: "",
        allergiesInfo: "",
        dietaryInfo: "",
        imageUrl: "",
      };
      this.eventForm = {
        mealId: "",
        datetime: "",
        locationAddress: "",
        maxGuests: null,
        availableSeats: null,
        price: null,
        latitude: null,
        longitude: null,
      };
      this.activeTab = "meal";
    },
    initializeMap() {
      if (this.map) {
        this.map.remove();
      }

      setTimeout(() => {
        const mapContainer = document.getElementById("event-map");
        if (!mapContainer) return;

        this.map = L.map("event-map").setView([51.505, -0.09], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(this.map);

        this.map.on("click", (e) => {
          this.setLocationFromMap(e.latlng);
        });

        if (this.eventForm.latitude && this.eventForm.longitude) {
          this.map.setView(
            [this.eventForm.latitude, this.eventForm.longitude],
            13,
          );
          this.addMarker(this.eventForm.latitude, this.eventForm.longitude);
        }
      }, 100);
    },
    setLocationFromMap(latlng) {
      this.eventForm.latitude = parseFloat(latlng.lat.toFixed(6));
      this.eventForm.longitude = parseFloat(latlng.lng.toFixed(6));
      this.addMarker(latlng.lat, latlng.lng);
      this.reverseGeocodeCoordinates(latlng.lat, latlng.lng);
    },
    addMarker(lat, lng) {
      if (this.marker) {
        this.marker.remove();
      }
      this.marker = L.marker([lat, lng], {
        draggable: true,
      }).addTo(this.map);

      this.marker.on("dragend", () => {
        const position = this.marker.getLatLng();
        this.eventForm.latitude = parseFloat(position.lat.toFixed(6));
        this.eventForm.longitude = parseFloat(position.lng.toFixed(6));
      });
    },
    getLocationFromMap() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.eventForm.latitude = parseFloat(latitude.toFixed(6));
            this.eventForm.longitude = parseFloat(longitude.toFixed(6));

            if (this.map) {
              this.map.setView([latitude, longitude], 15);
              this.addMarker(latitude, longitude);
            }

            this.reverseGeocodeCoordinates(latitude, longitude);
          },
          (error) => {
            alert("Unable to get location. Please allow location access.");
            console.error("Geolocation error:", error);
          },
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    async geocodeAddress() {
      if (!this.eventForm.locationAddress.trim()) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            this.eventForm.locationAddress,
          )}`,
        );
        const results = await response.json();

        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          this.eventForm.latitude = parseFloat(lat);
          this.eventForm.longitude = parseFloat(lon);

          if (this.map) {
            this.map.setView(
              [this.eventForm.latitude, this.eventForm.longitude],
              13,
            );
            this.addMarker(this.eventForm.latitude, this.eventForm.longitude);
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    },
    async reverseGeocodeCoordinates(latitude, longitude) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const result = await response.json();

        if (result && result.address) {
          this.eventForm.locationAddress =
            result.display_name || this.eventForm.locationAddress;
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    },
    async handleSubmit() {
      this.isSubmitting = true;
      try {
        if (this.activeTab === "meal") {
          console.log("Submitting meal form with data:", this.mealForm);
          const mealPayload = {
            title: this.mealForm.title,
            cuisine: this.mealForm.cuisine,
            description: this.mealForm.description,
            ingredients: this.mealForm.ingredients,
            allergiesInfo: this.mealForm.allergiesInfo,
            dietaryInfo: this.mealForm.dietaryInfo,
            imageUrl: this.mealForm.imageUrl,
          };

          await api.post(API_ENDPOINTS.MEALS.CREATE, mealPayload);
          alert("Meal created successfully!");
          this.$emit("success");
          this.closeModal();
        } else if (this.activeTab === "event") {
          // Explicit casting step to secure primitive types against backend validation
          const targetGuests = parseInt(this.eventForm.maxGuests, 10);
          const computedPrice = parseFloat(this.eventForm.price);

          const eventPayload = {
            mealId: parseInt(this.eventForm.mealId, 10),
            datetime: this.eventForm.datetime,
            locationAddress: this.eventForm.locationAddress,
            maxGuests: isNaN(targetGuests) ? 1 : targetGuests,
            availableSeats: isNaN(targetGuests) ? 1 : targetGuests,
            price: isNaN(computedPrice) ? 0.0 : computedPrice,
            latitude:
              this.eventForm.latitude !== null ? this.eventForm.latitude : 0.0,
            longitude:
              this.eventForm.longitude !== null
                ? this.eventForm.longitude
                : 0.0,
          };

          await api.post(API_ENDPOINTS.EVENTS.CREATE, eventPayload);
          alert("Event created successfully!");
          this.$emit("success");
          this.closeModal();
        }
      } catch (error) {
        console.error("Error creating item:", error);
        alert(error.message || "Failed to create item.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
@import "../assets/css/components/CreateMealEventModal.css";
</style>
