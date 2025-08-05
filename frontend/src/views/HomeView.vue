<template>
  <div class="home">
    <AppHeader />
    <SalonInfo />
    <AppFooter />
    <BookingButton />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import SalonInfo from '@/components/SalonInfo.vue'
import AppFooter from '@/components/AppFooter.vue'
import BookingButton from '@/components/BookingButton.vue'
import '@/styles/views/HomeView.css'

export default {
  name: 'HomeView',
  components: {
    AppHeader,
    SalonInfo,
    AppFooter,
    BookingButton
  }
}
</script>
