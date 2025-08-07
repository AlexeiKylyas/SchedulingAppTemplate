<template>
  <div class="login-view">
    <div class="login-container">
      <h2>Login to Your Account</h2>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">Phone Number</label>
          <input 
            type="tel" 
            id="email" 
            v-model="email" 
            required 
            placeholder="+380XXXXXXXXX"
            pattern="^\+380\d{9}$"
          >
          <small>Format: +380XXXXXXXXX</small>
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
        <button type="submit" class="btn-login" :disabled="loading">
          Login
          <span v-if="loading" class="loading-indicator"></span>
        </button>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
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
      password: '',
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    async login() {
      this.errorMessage = '';
      this.loading = true;

      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: this.email, // Using email field for phone number
            password: this.password
          })
        });

        if (!response.ok) {
          let errorMessage = 'Login failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = response.statusText || errorMessage;
            console.error('Error parsing response:', parseError);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Login successful:', data);

        // Store the JWT tokens in localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);

        // Trigger storage event for AppHeader to detect login
        window.dispatchEvent(new Event('storage'));

        // Redirect to home page or cabinet
        this.$router.push('/cabinet');

      } catch (error) {
        console.error('Error during login:', error);
        this.errorMessage = error.message || 'Login failed. Please try again.';
      } finally {
        this.loading = false;
      }
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

small {
  color: #777;
  font-size: 12px;
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
  position: relative;
}

.btn-login:hover {
  background-color: #45a049;
}

.btn-login:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-indicator {
  display: inline-block;
  margin-left: 8px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #f44336;
  margin-top: 16px;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
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
