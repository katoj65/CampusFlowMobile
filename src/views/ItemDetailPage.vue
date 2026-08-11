<template>
  <ion-page>
    <ion-content :fullscreen="true" class="item-content" v-if="meal">
      <div class="item-hero">
        <img :src="meal.image" :alt="meal.name" class="item-image" />
        <div class="item-hero-scrim"></div>
        <button class="back-btn" :aria-label="t('common.goBack')" @click="router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </button>
        <CartButton variant="dark" class="hero-cart" />
        <span v-if="meal.available <= 5" class="low-badge">{{ t('item.onlyLeftToday', { count: meal.available }) }}</span>
      </div>

      <div class="item-body">
        <div class="item-title-row">
          <h1>{{ meal.name }}</h1>
          <span class="item-price">{{ formatCurrency(meal.price) }}</span>
        </div>
        <div class="item-tags">
          <span class="tag" v-for="tag in meal.tags" :key="tag">{{ tag }}</span>
          <span class="cal-tag">
            <ion-icon :icon="flameOutline" />
            {{ meal.calories }} kcal
          </span>
        </div>
        <p class="item-description">{{ meal.description }}</p>

        <section class="detail-section">
          <h2>{{ $t('item.ingredients') }}</h2>
          <div class="ingredient-list">
            <button
              v-for="ingredient in meal.ingredients"
              :key="ingredient"
              class="ingredient-pill"
              :class="{ excluded: !includedIngredients.has(ingredient) }"
              @click="toggleIngredient(ingredient)"
            >
              <ion-icon :icon="includedIngredients.has(ingredient) ? checkmarkCircle : closeCircleOutline" />
              {{ ingredient }}
            </button>
          </div>
          <p class="section-hint" v-if="meal.customizable">{{ $t('item.tapIngredientHint') }}</p>
        </section>

        <template v-if="meal.customizable">
          <section class="detail-section">
            <h2>{{ $t('item.size') }}</h2>
            <div class="option-row">
              <button
                v-for="option in sizeOptions"
                :key="option.id"
                class="option-chip"
                :class="{ active: selectedSize === option.id }"
                @click="selectedSize = option.id"
              >
                {{ option.label }}
                <span v-if="option.priceDelta > 0">+{{ formatCurrency(option.priceDelta) }}</span>
              </button>
            </div>
          </section>

          <section class="detail-section" v-if="showSpiceLevel">
            <h2>{{ $t('item.spiceLevel') }}</h2>
            <div class="option-row">
              <button
                v-for="level in spiceLevels"
                :key="level"
                class="option-chip"
                :class="{ active: selectedSpice === level }"
                @click="selectedSpice = level"
              >
                {{ level }}
              </button>
            </div>
          </section>

          <section class="detail-section">
            <h2>{{ $t('item.addExtras') }}</h2>
            <div class="option-row">
              <button
                v-for="extra in commonExtras"
                :key="extra.id"
                class="option-chip"
                :class="{ active: selectedExtras.has(extra.id) }"
                @click="toggleExtra(extra.id)"
              >
                {{ extra.label }}
                <span>+{{ formatCurrency(extra.priceDelta) }}</span>
              </button>
            </div>
          </section>
        </template>

        <section class="detail-section">
          <h2>{{ $t('item.quantity') }}</h2>
          <div class="qty-stepper">
            <button class="qty-btn" :disabled="qty <= 1" @click="qty = Math.max(1, qty - 1)">
              <ion-icon :icon="removeOutline" />
            </button>
            <span class="qty-value">{{ qty }}</span>
            <button class="qty-btn" :disabled="qty >= 10" @click="qty = Math.min(10, qty + 1)">
              <ion-icon :icon="addOutline" />
            </button>
          </div>
        </section>
      </div>

      <div class="item-footer">
        <button class="add-to-cart-btn" @click="onAddToCart">
          <span>{{ $t('item.addToCart') }}</span>
          <span>{{ formatCurrency(totalPrice) }}</span>
        </button>
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="1400"
        position="top"
        @didDismiss="showToast = false"
      ></ion-toast>
    </ion-content>

    <ion-content :fullscreen="true" v-else>
      <div class="not-found">
        <ion-icon :icon="fastFoodOutline" />
        <h3>{{ $t('item.notFound') }}</h3>
        <button class="primary-btn" @click="router.replace('/tabs/tab2')">{{ $t('item.backToMenu') }}</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/vue';
import {
  chevronBackOutline,
  flameOutline,
  checkmarkCircle,
  closeCircleOutline,
  removeOutline,
  addOutline,
  fastFoodOutline,
} from 'ionicons/icons';
import { sizeOptions, spiceLevels, commonExtras, CATEGORY_MAINS, CATEGORY_GRILL } from '@/data/menu';
import { useMenu } from '@/composables/useMenu';
import { useCart } from '@/composables/useCart';
import { formatCurrency } from '@/utils/currency';
import CartButton from '@/components/CartButton.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const cart = useCart();
const { findMeal } = useMenu();

const meal = computed(() => findMeal(Number(route.params.id)));

const qty = ref(1);
const selectedSize = ref(sizeOptions[0].id);
const selectedSpice = ref(spiceLevels[1]);
const selectedExtras = ref(new Set<string>());
const includedIngredients = ref(new Set<string>(meal.value?.ingredients ?? []));

const showSpiceLevel = computed(() => meal.value?.category === CATEGORY_MAINS || meal.value?.category === CATEGORY_GRILL);

function toggleExtra(id: string) {
  if (selectedExtras.value.has(id)) {
    selectedExtras.value.delete(id);
  } else {
    selectedExtras.value.add(id);
  }
  selectedExtras.value = new Set(selectedExtras.value);
}

function toggleIngredient(name: string) {
  if (includedIngredients.value.has(name)) {
    includedIngredients.value.delete(name);
  } else {
    includedIngredients.value.add(name);
  }
  includedIngredients.value = new Set(includedIngredients.value);
}

const unitPrice = computed(() => {
  if (!meal.value) return 0;
  let price = meal.value.price;
  if (meal.value.customizable) {
    const size = sizeOptions.find((o) => o.id === selectedSize.value);
    price += size?.priceDelta ?? 0;
    for (const extraId of selectedExtras.value) {
      const extra = commonExtras.find((e) => e.id === extraId);
      price += extra?.priceDelta ?? 0;
    }
  }
  return price;
});

const totalPrice = computed(() => unitPrice.value * qty.value);

const customizationSummary = computed(() => {
  if (!meal.value || !meal.value.customizable) return '';
  const parts: string[] = [];
  const size = sizeOptions.find((o) => o.id === selectedSize.value);
  if (size && size.priceDelta > 0) parts.push(size.label);
  if (showSpiceLevel.value) parts.push(t('item.spiceSuffix', { level: selectedSpice.value }));
  for (const extraId of selectedExtras.value) {
    const extra = commonExtras.find((e) => e.id === extraId);
    if (extra) parts.push(extra.label);
  }
  if (meal.value) {
    for (const ingredient of meal.value.ingredients) {
      if (!includedIngredients.value.has(ingredient)) parts.push(t('item.noIngredient', { ingredient }));
    }
  }
  return parts.join(' · ');
});

const showToast = ref(false);
const toastMessage = ref('');

function onAddToCart() {
  if (!meal.value) return;
  // Optimistic — addToCart pushes the local line synchronously and only
  // rolls back in the rare case the background save fails.
  cart
    .addToCart({
      mealId: meal.value.id,
      name: meal.value.name,
      image: meal.value.image,
      unitPrice: unitPrice.value,
      qty: qty.value,
      summary: customizationSummary.value,
    })
    .catch(() => {});
  toastMessage.value = t('item.addedToCart', { name: meal.value.name });
  showToast.value = true;
  setTimeout(() => router.back(), 500);
}
</script>

<style scoped>
.item-content {
  --background: var(--ion-color-step-50, #f4f5f8);
  --padding-bottom: 100px;
}

.item-hero {
  position: relative;
  height: 260px;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 30%);
}

.back-btn,
.hero-cart {
  position: absolute;
  top: calc(14px + env(safe-area-inset-top));
}

.back-btn {
  left: 14px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.hero-cart {
  right: 14px;
}

.low-badge {
  position: absolute;
  left: 14px;
  bottom: 14px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.92);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.item-body {
  padding: 18px 16px 16px;
}

.item-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.item-title-row h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  flex: 1;
}

.item-price {
  font-size: 18px;
  font-weight: 800;
  color: #ff6b35;
  flex-shrink: 0;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tag {
  font-size: 11px;
  font-weight: 600;
  color: #2ec4b6;
  background: rgba(46, 196, 182, 0.12);
  padding: 3px 9px;
  border-radius: 999px;
}

.cal-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.item-description {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.detail-section {
  margin-top: 22px;
}

.detail-section h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.section-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ingredient-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 999px;
  border: none;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 6px 16px -14px rgba(0, 0, 0, 0.4);
}

.ingredient-pill ion-icon {
  font-size: 15px;
  color: #2ec4b6;
}

.ingredient-pill.excluded {
  opacity: 0.5;
  text-decoration: line-through;
}

.ingredient-pill.excluded ion-icon {
  color: #ff3b30;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 6px 16px -14px rgba(0, 0, 0, 0.4);
}

.option-chip span {
  color: var(--ion-color-medium);
  font-weight: 500;
}

.option-chip.active {
  background: #ff6b35;
  color: #fff;
}

.option-chip.active span {
  color: rgba(255, 255, 255, 0.85);
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: 18px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--ion-card-background, #fff);
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 6px 16px -14px rgba(0, 0, 0, 0.4);
}

.qty-btn:disabled {
  color: var(--ion-color-medium);
  opacity: 0.5;
}

.qty-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.item-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--ion-background-color, #fff);
  box-shadow: 0 -10px 30px -20px rgba(0, 0, 0, 0.4);
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.not-found ion-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.primary-btn {
  margin-top: 16px;
  padding: 12px 22px;
  border: none;
  border-radius: 14px;
  background: #ff6b35;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}
</style>
