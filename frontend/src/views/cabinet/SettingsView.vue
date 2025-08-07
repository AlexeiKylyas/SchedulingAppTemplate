<template>
  <div class="settings-view">
    <h2>Settings</h2>
    <div class="settings-content">
      <p>This is where you can manage your account settings.</p>
      <!-- Settings form would go here in a real application -->
      <div class="placeholder-settings">
        <div class="settings-section">
          <h3>Notification Preferences</h3>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" disabled checked />
              Email notifications
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" disabled checked />
              SMS notifications
            </label>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Password</h3>
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" disabled />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" placeholder="••••••••" disabled />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" placeholder="••••••••" disabled />
          </div>
          <button class="btn-save" disabled>Change Password</button>
        </div>
        
        <div class="settings-section">
          <h3>Language</h3>
          <div class="form-group">
            <select disabled>
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
              <option value="ru">Russian</option>
            </select>
          </div>
        </div>
        
        <div class="settings-section danger-zone">
          <h3>Danger Zone</h3>
          <button class="btn-danger" disabled>Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsView'
}
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.settings-content {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.settings-content p {
  margin-bottom: 20px;
  color: #666;
}

.placeholder-settings {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.settings-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

h3 {
  margin-bottom: 15px;
  color: #555;
  font-size: 18px;
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

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: not-allowed;
}

.checkbox-label input {
  margin-right: 10px;
  width: auto;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f5f5f5;
}

select {
  height: 40px;
}

.btn-save {
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

.danger-zone {
  background-color: #FFF8F8;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #FFEBEE;
}

.btn-danger {
  background-color: #f44336;
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