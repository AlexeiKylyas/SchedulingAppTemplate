<template>
  <div class="history-view">
    <h2>Appointment History</h2>
    <div class="history-content">
      <p>This is where you can view your past appointments.</p>
      <!-- Appointment history would go here in a real application -->
      <div class="placeholder-history">
        <div class="history-card completed">
          <div class="history-date">May 10, 2023</div>
          <div class="history-time">11:00 AM - 12:00 PM</div>
          <div class="history-service">Haircut</div>
          <div class="history-staff">with John Smith</div>
          <div class="history-status">Completed</div>
        </div>
        <div class="history-card cancelled">
          <div class="history-date">April 25, 2023</div>
          <div class="history-time">3:30 PM - 4:30 PM</div>
          <div class="history-service">Manicure</div>
          <div class="history-staff">with Jane Doe</div>
          <div class="history-status">Cancelled</div>
        </div>
        <div class="history-card completed">
          <div class="history-date">April 5, 2023</div>
          <div class="history-time">10:00 AM - 11:00 AM</div>
          <div class="history-service">Facial Treatment</div>
          <div class="history-staff">with Sarah Johnson</div>
          <div class="history-status">Completed</div>
        </div>
        <div class="no-more-history">
          No more appointment history
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryView'
}
</script>

<style scoped>
.history-view {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.history-content {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.history-content p {
  margin-bottom: 20px;
  color: #666;
}

.placeholder-history {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.history-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
}

.history-date {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.history-time {
  color: #666;
  margin-bottom: 10px;
}

.history-service {
  font-weight: 600;
  margin-bottom: 5px;
}

.history-staff {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.history-status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
}

.completed .history-service {
  color: #4CAF50;
}

.completed .history-status {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.cancelled .history-service {
  color: #f44336;
}

.cancelled .history-status {
  background-color: #FFEBEE;
  color: #f44336;
}

.no-more-history {
  text-align: center;
  padding: 15px;
  color: #999;
  font-style: italic;
}
</style>