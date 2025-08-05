<template>
  <div class="popup-overlay" v-if="show">
    <div class="popup-content">
      <h3>Verify Your Phone Number</h3>
      <p>We've sent a verification code to:</p>
      <p class="phone-number">{{ phoneNumber }}</p>
      <form @submit.prevent="verifyOtp">
        <div class="form-group">
          <label for="otpCode">Enter 4-digit code</label>
          <input 
            type="text" 
            id="otpCode" 
            v-model="otpCode" 
            required 
            placeholder="Enter 4-digit code"
            pattern="^\d{4}$"
            maxlength="4"
            autofocus
          >
        </div>
        <div class="button-group">
          <button type="button" class="btn-cancel" @click="cancel">Cancel</button>
          <button type="submit" class="btn-verify" :disabled="loading">
            Verify
            <span v-if="loading" class="loading-indicator"></span>
          </button>
        </div>
      </form>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OtpVerificationPopup',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      otpCode: '',
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    verifyOtp() {
      if (this.otpCode.length !== 4 || !/^\d{4}$/.test(this.otpCode)) {
        this.errorMessage = 'Please enter a valid 4-digit code';
        return;
      }
      
      this.errorMessage = '';
      this.$emit('verify', this.otpCode);
    },
    cancel() {
      this.otpCode = '';
      this.errorMessage = '';
      this.$emit('cancel');
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.otpCode = '';
        this.errorMessage = '';
      }
    }
  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 30px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h3 {
  margin-bottom: 16px;
  color: #333;
}

.phone-number {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  color: #555;
  text-align: left;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn-cancel, .btn-verify {
  flex: 1;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-verify {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.btn-verify:hover {
  background-color: #45a049;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.error-message {
  color: #f44336;
  margin-top: 16px;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
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