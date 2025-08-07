<template>
  <div class="register-view">
    <div class="register-container">
      <h2>Create New Account</h2>
      <div v-if="step === 1">
        <form @submit.prevent="requestOtp" class="register-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="firstName" 
              required 
              placeholder="Enter your first name"
            >
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="lastName" 
              required 
              placeholder="Enter your last name"
            >
          </div>
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
            <label for="phoneNumber">Phone Number</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              v-model="phoneNumber" 
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
              minlength="8"
            >
            <small>Minimum 8 characters</small>
          </div>
          <button type="submit" class="btn-register" :disabled="!allFieldsFilled || loading">
            Confirm my phone
            <span v-if="loading" class="loading-indicator"></span>
          </button>
        </form>
      </div>
      <div v-if="step === 2">
        <p class="otp-message">We've sent a verification code to your phone number. Please enter it below to complete registration.</p>
        <form @submit.prevent="register" class="register-form">
          <div class="form-group">
            <label for="otpCode">Verification Code</label>
            <input 
              type="text" 
              id="otpCode" 
              v-model="otpCode" 
              required 
              placeholder="Enter 4-digit code"
              pattern="^\d{4}$"
              maxlength="4"
            >
          </div>
          <button type="submit" class="btn-register" :disabled="loading">
            Create Account
            <span v-if="loading" class="loading-indicator"></span>
          </button>
        </form>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div class="login-link">
        Already have an account? <router-link to="/login">Login</router-link>
      </div>
    </div>

    <!-- OTP Verification Popup -->
    <OtpVerificationPopup 
      :show="showPopup" 
      :phoneNumber="phoneNumber"
      @verify="handleVerify"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import OtpVerificationPopup from '@/components/OtpVerificationPopup.vue';

export default {
  name: 'RegisterView',
  components: {
    OtpVerificationPopup
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      otpCode: '',
      step: 1,
      errorMessage: '',
      loading: false,
      showPopup: false
    }
  },
  computed: {
    allFieldsFilled() {
      return this.firstName.trim() !== '' && 
             this.lastName.trim() !== '' && 
             this.email.trim() !== '' && 
             this.phoneNumber.trim() !== '' && 
             this.password.trim() !== '';
    }
  },
  methods: {
    async requestOtp() {
      this.errorMessage = '';
      this.loading = true;

      try {
        const response = await fetch('http://localhost:3000/auth/generate-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: this.phoneNumber
          })
        });

        if (!response.ok) {
          let errorMessage = 'Failed to request OTP code';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // If response is not JSON, use status text or a generic message
            errorMessage = response.statusText || errorMessage;
            console.error('Error parsing response:', parseError);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('OTP generated:', data);

        // In a real application, the OTP would be sent to the user's phone
        // For development purposes, we'll pre-fill the OTP field with the code from the response
        this.otpCode = data.otpCode;

        // Show the popup instead of moving to step 2
        this.showPopup = true;
      } catch (error) {
        console.error('Error requesting OTP:', error);
        this.errorMessage = error.message || 'Failed to request OTP code. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    handleVerify(code) {
      this.otpCode = code;
      this.showPopup = false;
      // Move to step 2 to complete registration
      this.step = 2;
    },

    handleCancel() {
      this.showPopup = false;
      this.errorMessage = '';
    },

    async register() {
      this.errorMessage = '';
      this.loading = true;

      try {
        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            password: this.password,
            otpCode: this.otpCode
          })
        });

        if (!response.ok) {
          let errorMessage = 'Registration failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // If response is not JSON, use status text or a generic message
            errorMessage = response.statusText || errorMessage;
            console.error('Error parsing response:', parseError);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Registration successful:', data);

        // Store the JWT tokens in localStorage or Vuex store
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);

        // Redirect to home page or dashboard
        this.$router.push('/');

      } catch (error) {
        console.error('Error during registration:', error);
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust based on your header height */
  padding: 20px;
}

.register-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.register-form {
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

.btn-register {
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

.btn-register:hover {
  background-color: #45a049;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #555;
}

.login-link a {
  color: #2196F3;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.error-message {
  color: #f44336;
  margin-top: 16px;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}

.otp-message {
  margin-bottom: 16px;
  color: #555;
  text-align: center;
}

/* Loading state styles */
button:disabled {
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
</style>
