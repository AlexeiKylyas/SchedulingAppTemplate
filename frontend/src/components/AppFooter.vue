<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Contact Us</h3>
          <p><i class="icon">📞</i> +380 12 345 6789</p>
          <p><i class="icon">✉️</i> info@beautysalon.com</p>
          <p><i class="icon">📍</i> 123 Beauty Street, Kyiv, Ukraine</p>
        </div>

        <div class="footer-section">
          <h3>Opening Hours</h3>
          <p>Monday - Friday: 9:00 - 20:00</p>
          <p>Saturday: 10:00 - 18:00</p>
          <p>Sunday: Closed</p>
        </div>

        <div class="footer-section">
          <h3>Follow Us</h3>
          <div class="social-links">
            <a href="#" class="social-link">
              <span class="social-icon">📘</span> Facebook
            </a>
            <a href="#" class="social-link">
              <span class="social-icon">📷</span> Instagram
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2023 Beauty Salon. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import '@/styles/components/AppFooter.css'

export default {
  name: 'AppFooter'
}
</script>
