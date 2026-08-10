<template>
  <button
    class="cart-btn"
    :class="variant"
    :aria-label="t('cart.cartAria', { count: itemCount }, itemCount)"
    @click="router.push('/cart')"
  >
    <ion-icon :icon="cartOutline" />
    <span v-if="itemCount > 0" class="cart-badge">{{ itemCount }}</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonIcon } from '@ionic/vue';
import { cartOutline } from 'ionicons/icons';
import { useCart } from '@/composables/useCart';

withDefaults(defineProps<{ variant?: 'light' | 'dark' }>(), { variant: 'light' });

const router = useRouter();
const { t } = useI18n();
const { itemCount } = useCart();
</script>

<style scoped>
.cart-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.cart-btn.dark {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.cart-btn.light {
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  box-shadow: 0 8px 24px -18px rgba(0, 0, 0, 0.4);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--ion-color-step-50, #f4f5f8);
}
</style>
