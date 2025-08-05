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
          <li><a href="#">Home</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
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
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    }
  }
}
</script>
