<template>
  <div class="profile-view">
    <h2>My Profile</h2>
    <div class="profile-content">
      <p>This is where you can view and edit your profile information.</p>
      <!-- Profile form would go here in a real application -->
      <div class="placeholder-form">
        <div class="form-group">
          <label>First Name</label>
          <input type="text" placeholder="John" disabled />
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input type="text" placeholder="Doe" disabled />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" placeholder="john.doe@example.com" disabled />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" placeholder="+380XXXXXXXXX" disabled />
        </div>
        <button class="btn-edit" disabled>Edit Profile</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView'
}
</script>

<style scoped>
.profile-view {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.profile-content {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.profile-content p {
  margin-bottom: 20px;
  color: #666;
}

.placeholder-form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f5f5f5;
}

.btn-edit {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 10px;
  opacity: 0.7;
}
</style>