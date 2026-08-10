import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      },
      {
        path: 'tab4',
        component: () => import('@/views/Tab4Page.vue')
      },
      {
        path: 'tab5',
        component: () => import('@/views/Tab5Page.vue')
      }
    ]
  },
  {
    path: '/item/:id',
    component: () => import('@/views/ItemDetailPage.vue')
  },
  {
    path: '/cart',
    component: () => import('@/views/CartPage.vue')
  },
  {
    path: '/checkout',
    component: () => import('@/views/CheckoutPage.vue')
  },
  {
    path: '/order-confirmation',
    component: () => import('@/views/OrderConfirmationPage.vue')
  },
  {
    path: '/notifications',
    component: () => import('@/views/NotificationsPage.vue')
  },
  {
    path: '/dietary-preference',
    component: () => import('@/views/DietaryPreferencePage.vue')
  },
  {
    path: '/payment-methods',
    component: () => import('@/views/PaymentMethodsPage.vue')
  },
  {
    path: '/account-details',
    component: () => import('@/views/AccountDetailsPage.vue')
  },
  {
    path: '/pickup-location',
    component: () => import('@/views/PickupLocationPage.vue')
  },
  {
    path: '/language',
    component: () => import('@/views/LanguagePage.vue')
  },
  {
    path: '/help-support',
    component: () => import('@/views/HelpSupportPage.vue')
  },
  {
    path: '/terms',
    component: () => import('@/views/TermsPage.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/forgot-password',
    component: () => import('@/views/ForgotPasswordPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
