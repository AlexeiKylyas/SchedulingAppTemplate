<template>
  <div class="forgot-password-view">
    <div class="forgot-password-container">
      <h2>Forgot Password</h2>
      <p class="description">Enter your email address and we'll send you a link to reset your password.</p>
      <form @submit.prevent="sendResetLink" class="forgot-password-form">
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
        <button type="submit" class="btn-send">Send Reset Link</button>
      </form>
      <div class="back-to-login">
        <router-link to="/login">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: ''
    }
  },
  methods: {
    sendResetLink() {
      // Here you would typically call an API to send a password reset link
      console.log('Password reset requested for:', this.email)
      // For now, we'll just log the attempt
      // In a real application, you would call your password reset service
      
      // Show a success message to the user
      alert('If an account exists with this email, a password reset link will be sent.')
      
      // Redirect back to login page
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.forgot-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust based on your header height */
  padding: 20px;
}

.forgot-password-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 16px;
  color: #333;
}

.description {
  text-align: center;
  margin-bottom: 24px;
  color: #666;
  font-size: 14px;
}

.forgot-password-form {
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

.btn-send {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.btn-send:hover {
  background-color: #0b7dda;
}

.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-to-login a {
  color: #2196F3;
  text-decoration: none;
  font-size: 14px;
}

.back-to-login a:hover {
  text-decoration: underline;
}
</style>