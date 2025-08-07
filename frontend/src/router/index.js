import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import CabinetView from '../views/CabinetView.vue'
import ProfileView from '../views/cabinet/ProfileView.vue'
import AppointmentsView from '../views/cabinet/AppointmentsView.vue'
import HistoryView from '../views/cabinet/HistoryView.vue'
import SettingsView from '../views/cabinet/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView
  },
  {
    path: '/cabinet',
    name: 'cabinet',
    component: CabinetView,
    children: [
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: AppointmentsView
      },
      {
        path: 'history',
        name: 'history',
        component: HistoryView
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard to protect cabinet routes
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  const requiresAuth = to.path.startsWith('/cabinet')

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('accessToken')

  if (requiresAuth && !isLoggedIn) {
    // If route requires auth and user is not logged in, redirect to login
    next('/login')
  } else {
    // Otherwise proceed as normal
    next()
  }
})

export default router
