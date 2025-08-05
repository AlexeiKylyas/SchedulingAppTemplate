<template>
  <section class="salon-info">
    <div class="container">
      <div class="salon-intro">
        <h2 class="section-title">Welcome to Our Beauty Salon</h2>
        <p class="section-subtitle">Where Beauty Meets Relaxation</p>
        <div class="divider"></div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">💇‍♀️</div>
          <h3>Professional Stylists</h3>
          <p>Our team of experienced stylists is dedicated to providing you with the best hair care services.</p>
        </div>

        <div class="info-card">
          <div class="info-icon">💅</div>
          <h3>Nail Services</h3>
          <p>From manicures to pedicures, we offer a wide range of nail services to keep your hands and feet looking beautiful.</p>
        </div>

        <div class="info-card">
          <div class="info-icon">🧖‍♀️</div>
          <h3>Spa Treatments</h3>
          <p>Relax and rejuvenate with our spa treatments designed to help you unwind and feel refreshed.</p>
        </div>

        <div class="info-card">
          <div class="info-icon">✨</div>
          <h3>Premium Products</h3>
          <p>We use only the highest quality products to ensure the best results for our clients.</p>
        </div>
      </div>

      <div class="salon-description">
        <p>
          Our beauty salon is dedicated to providing exceptional services in a relaxing and welcoming environment. 
          Whether you're looking for a new hairstyle, a manicure, or a rejuvenating facial, our team of professionals 
          is here to help you look and feel your best.
        </p>
        <p>
          We believe that everyone deserves to feel beautiful and confident, and we strive to provide personalized 
          services that meet your unique needs and preferences. Book an appointment today and experience the difference!
        </p>
      </div>
    </div>
  </section>
</template>

<script>
import '@/styles/components/SalonInfo.css'

export default {
  name: 'SalonInfo'
}
</script>
