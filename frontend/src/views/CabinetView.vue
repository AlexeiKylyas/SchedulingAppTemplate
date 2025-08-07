<template>
  <div class="cabinet-view">
    <div class="cabinet-container">
      <div class="cabinet-sidebar">
        <h3>My Cabinet</h3>
        <ul class="sidebar-menu">
          <li><router-link to="/cabinet/profile">My Profile</router-link></li>
          <li><router-link to="/cabinet/appointments">My Appointments</router-link></li>
          <li><router-link to="/cabinet/history">Appointment History</router-link></li>
          <li><router-link to="/cabinet/settings">Settings</router-link></li>
          <li><a href="#" @click.prevent="logout" class="logout-link">Logout</a></li>
        </ul>
      </div>
      <div class="cabinet-content">
        <router-view />
        <div v-if="!$route.path.includes('/cabinet/')" class="welcome-message">
          <h2>Welcome to Your Cabinet</h2>
          <p>Select an option from the sidebar to manage your account.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CabinetView',
  methods: {
    logout() {
      // Clear authentication data from localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      
      // Redirect to home page
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.cabinet-view {
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: calc(100vh - 80px); /* Adjust based on your header height */
}

.cabinet-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cabinet-sidebar {
  width: 250px;
  background-color: #f5f5f5;
  padding: 20px;
  border-right: 1px solid #eee;
}

.cabinet-sidebar h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  color: #333;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 10px;
}

.sidebar-menu a {
  display: block;
  padding: 10px;
  color: #555;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sidebar-menu a:hover, .sidebar-menu a.router-link-active {
  background-color: #e0e0e0;
  color: #333;
}

.logout-link {
  color: #f44336 !important;
}

.logout-link:hover {
  background-color: #ffebee !important;
}

.cabinet-content {
  flex: 1;
  padding: 20px;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
}

.welcome-message h2 {
  margin-bottom: 16px;
  color: #333;
}

.welcome-message p {
  color: #666;
  font-size: 16px;
}
</style>