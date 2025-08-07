<template>
  <div class="appointments-view">
    <h2>My Appointments</h2>
    <div class="appointments-content">
      <p>This is where you can view and manage your upcoming appointments.</p>
      <!-- Appointments list would go here in a real application -->
      <div class="placeholder-appointments">
        <div class="appointment-card">
          <div class="appointment-date">June 15, 2023</div>
          <div class="appointment-time">10:00 AM - 11:30 AM</div>
          <div class="appointment-service">Haircut & Styling</div>
          <div class="appointment-staff">with John Smith</div>
          <div class="appointment-actions">
            <button class="btn-reschedule" disabled>Reschedule</button>
            <button class="btn-cancel" disabled>Cancel</button>
          </div>
        </div>
        <div class="appointment-card">
          <div class="appointment-date">June 22, 2023</div>
          <div class="appointment-time">2:00 PM - 3:00 PM</div>
          <div class="appointment-service">Manicure</div>
          <div class="appointment-staff">with Jane Doe</div>
          <div class="appointment-actions">
            <button class="btn-reschedule" disabled>Reschedule</button>
            <button class="btn-cancel" disabled>Cancel</button>
          </div>
        </div>
        <div class="no-more-appointments">
          No more upcoming appointments
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppointmentsView'
}
</script>

<style scoped>
.appointments-view {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.appointments-content {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.appointments-content p {
  margin-bottom: 20px;
  color: #666;
}

.placeholder-appointments {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.appointment-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
}

.appointment-date {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.appointment-time {
  color: #666;
  margin-bottom: 10px;
}

.appointment-service {
  font-weight: 600;
  color: #4CAF50;
  margin-bottom: 5px;
}

.appointment-staff {
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
}

.appointment-actions {
  display: flex;
  gap: 10px;
}

.btn-reschedule, .btn-cancel {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: none;
  opacity: 0.7;
}

.btn-reschedule {
  background-color: #2196F3;
  color: white;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.no-more-appointments {
  text-align: center;
  padding: 15px;
  color: #999;
  font-style: italic;
}
</style>