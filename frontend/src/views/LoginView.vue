<template>
  <div class="login-view">
    <div class="login-container">
      <h2>Login to Your Account</h2>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
          >
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter your password"
          >
        </div>
        <button type="submit" class="btn-login">Login</button>
      </form>
      <div class="additional-options">
        <router-link to="/forgot-password" class="forgot-password">Forgot Password?</router-link>
        <router-link to="/register" class="create-account">Create New Account</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login() {
      // Here you would typically call an API to authenticate the user
      console.log('Login attempt with:', this.email, this.password)
      // For now, we'll just log the attempt
      // In a real application, you would call your authentication service
    }
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust based on your header height */
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #555;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn-login {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.btn-login:hover {
  background-color: #45a049;
}

.additional-options {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.forgot-password, .create-account {
  color: #2196F3;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover, .create-account:hover {
  text-decoration: underline;
}
</style>