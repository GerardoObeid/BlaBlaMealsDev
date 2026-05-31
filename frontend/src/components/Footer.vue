<template>
  <footer class="footer">
    <div class="footer-wrapper">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="/logo.svg" alt="MealShare Logo" class="logo-icon" />
            <span class="logo-text">MealShare</span>
          </div>
          <p class="footer-tagline">Share your home-cooked passion</p>
        </div>

        <div class="footer-grid">
          <div class="footer-section">
            <h3>Product</h3>
            <ul>
              <li><a href="#0">How it works</a></li>
              <li><a href="#0">Pricing</a></li>
              <li><a href="#0">Safety</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h3>Community</h3>
            <ul>
              <li><a href="#0">About Us</a></li>
              <li><a href="#0">Blog</a></li>
              <li><a href="#0">Contact</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h3>Legal</h3>
            <ul>
              <li><a href="#0">Privacy Policy</a></li>
              <li><a href="#0">Terms of Service</a></li>
              <li><a href="#0">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-bottom">
        <p class="footer-copyright">
          &copy; 2026 Bla Bla Meals. All rights reserved.
        </p>
        <div class="footer-socials">
          <a href="#0" class="social-link" title="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </a>
          <a href="#0" class="social-link" title="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M23.953 4.57a10 10 0 002.856-3.51 9.86 9.86 0 01-2.836.856 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
          </a>
          <a href="#0" class="social-link" title="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style scoped>
@import "../assets/css/components/Footer.css";
</style>
