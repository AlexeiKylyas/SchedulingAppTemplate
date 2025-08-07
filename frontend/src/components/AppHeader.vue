<template>
  <header class="app-header">
    <div class="container">
      <h1 class="logo">Beauty Salon</h1>
      <button class="hamburger-menu" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="main-nav" :class="{ 'active': isMenuOpen }">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
          <li v-if="!isLoggedIn"><router-link to="/login" class="login-button">Login</router-link></li>
          <li v-if="isLoggedIn"><router-link to="/cabinet" class="cabinet-button">My Cabinet</router-link></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import '@/styles/components/AppHeader.css'

export default {
  name: 'AppHeader',
  data() {
    return {
      isMenuOpen: false,
      isLoggedIn: false
    }
  },
  created() {
    // Check if user is logged in when component is created
    this.checkLoginStatus()
    // Listen for login/logout events
    window.addEventListener('storage', this.checkLoginStatus)
  },
  beforeUnmount() {
    // Remove event listener when component is destroyed
    window.removeEventListener('storage', this.checkLoginStatus)
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    checkLoginStatus() {
      // Check if accessToken exists in localStorage
      this.isLoggedIn = !!localStorage.getItem('accessToken')
    }
  }
}
</script>
