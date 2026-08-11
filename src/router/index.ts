import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import { authReady, useAuth } from '@/composables/useAuth';

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
    path: '/order-tracking/:id',
    component: () => import('@/views/OrderTrackingPage.vue')
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
    path: '/wallet',
    component: () => import('@/views/WalletPage.vue')
  },
  {
    path: '/transactions',
    component: () => import('@/views/TransactionsPage.vue')
  },
  {
    path: '/weekly-meal-plan',
    component: () => import('@/views/WeeklyMealPlanPage.vue')
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
    component: () => import('@/views/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { public: true }
  },
  {
    path: '/forgot-password',
    component: () => import('@/views/ForgotPasswordPage.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// /terms is reachable pre-account-creation from the register flow, so it's
// public too — set here rather than duplicating the meta block above.
const termsRoute = routes.find((route) => route.path === '/terms');
if (termsRoute) termsRoute.meta = { public: true };

router.beforeEach(async (to) => {
  // Wait for the initial session check so a cold start with a valid stored
  // session isn't briefly misread as logged-out and bounced to /login.
  await authReady;
  const { isAuthenticated } = useAuth();

  if (!to.meta.public && !isAuthenticated.value) {
    return '/login';
  }
  // Signed-in users shouldn't land back on login/register from history
  // (e.g. hardware back button after logging in).
  if (to.meta.public && isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return '/tabs/tab1';
  }
});

export default router
