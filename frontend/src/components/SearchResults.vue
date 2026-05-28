<template>
  <section class="search-results-section">
    <!-- Loading state -->
    <div v-if="loading" class="search-loading">
      <span class="loading-spinner"></span>
      <p>Searching for meals...</p>
    </div>

    <!-- No results note -->
    <div v-else-if="results.length === 0" class="no-results">
      <span class="no-results-icon">🍽️</span>
      <p>No meals found matching your criteria. Try adjusting your filters!</p>
    </div>

    <!-- Results: table + map -->
    <template v-else>
      <h2 class="results-heading">Available Meals</h2>

      <div class="results-layout">
        <!-- Results table -->
        <div class="results-table-wrapper">
          <table class="results-table">
            <thead>
              <tr>
                <th>Meal</th>
                <th>Cuisine</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Seats Left</th>
                <th>Price/person</th>
                <th>Host</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in results" :key="event.event_id">
                <td>{{ event.meal_title }}</td>
                <td>{{ event.cuisine }}</td>
                <td>{{ formatDate(event.datetime) }}</td>
                <td>{{ event.location_address }}</td>
                <td>{{ event.available_seats }}</td>
                <td>€{{ Number(event.price).toFixed(2) }}</td>
                <td>{{ event.host_first_name }} {{ event.host_last_name }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Leaflet Map -->
        <div class="map-container" ref="mapContainer"></div>
      </div>
    </template>
  </section>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with bundlers (Vite/Webpack)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export default {
  name: "SearchResults",
  props: {
    results: {
      type: Array,
      default: () => [],
    },
    userLocation: {
      type: Object,
      default: () => ({ lat: 43.5808, lng: 7.1239 }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mapInstance: null,
    };
  },
  watch: {
    results(newResults) {
      if (newResults && newResults.length > 0) {
        this.$nextTick(() => {
          this.renderMap();
        });
      }
    },
  },
  methods: {
    formatDate(datetimeStr) {
      if (!datetimeStr) return "";
      const date = new Date(datetimeStr.replace(" ", "T"));
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    renderMap() {
      // Destroy previous map instance if it exists
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }

      const mapEl = this.$refs.mapContainer;
      if (!mapEl) return;

      // Create map centered on user location
      const map = L.map(mapEl).setView(
        [this.userLocation.lat, this.userLocation.lng],
        14
      );
      this.mapInstance = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker (blue)
      const userIcon = L.icon({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: "user-marker",
      });

      L.marker([this.userLocation.lat, this.userLocation.lng], {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup("<strong>📍 You are here</strong>");

      // Collect all marker positions for bounds fitting
      const bounds = L.latLngBounds([
        [this.userLocation.lat, this.userLocation.lng],
      ]);

      // Event markers (orange)
      const eventIcon = L.icon({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: "event-marker",
      });

      this.results.forEach((event) => {
        if (event.latitude && event.longitude) {
          const marker = L.marker([event.latitude, event.longitude], {
            icon: eventIcon,
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width: 150px;">
              <strong>${event.meal_title}</strong><br/>
              <em>${event.cuisine}</em><br/>
              🕐 ${this.formatDate(event.datetime)}<br/>
              💰 €${Number(event.price).toFixed(2)}/person<br/>
              🪑 ${event.available_seats} seats left
            </div>
          `);

          bounds.extend([event.latitude, event.longitude]);
        }
      });

      // Fit map to show all markers with some padding
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    },
  },
  beforeUnmount() {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  },
};
</script>

<style scoped>
/* Override Leaflet marker colors via CSS filters */
.user-marker {
  filter: hue-rotate(200deg) saturate(1.5);
}

.event-marker {
  filter: hue-rotate(-30deg) saturate(2) brightness(1.1);
}
</style>
