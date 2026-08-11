<template>
  <ion-page>
    <ion-content :fullscreen="true" class="menu-content">
      <div class="sticky-header">
        <div class="page-header">
          <div class="page-header-top">
            <div>
              <h1>{{ $t('nav.menu') }}</h1>
              <p class="page-sub">{{ t('menu.itemsSummary', { count: filteredMeals.length, total: meals.length }) }}</p>
            </div>
            <CartButton />
          </div>
          <ion-searchbar
            v-model="searchQuery"
            :placeholder="$t('menu.searchPlaceholder')"
            class="menu-search"
            :debounce="150"
            show-clear-button="focus"
          ></ion-searchbar>
        </div>

        <div class="category-bar">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="category-chip"
            :class="{ active: selectedCategory === cat.id }"
            @click="selectedCategory = cat.id"
          >
            <ion-icon :icon="cat.icon" />
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <div class="menu-grid" v-if="loading && meals.length === 0">
        <div class="menu-card" v-for="i in 6" :key="i">
          <div class="menu-card-image">
            <ion-skeleton-text :animated="true" class="image-skeleton"></ion-skeleton-text>
          </div>
          <div class="menu-card-body">
            <ion-skeleton-text :animated="true" style="width: 80%; height: 13px"></ion-skeleton-text>
            <ion-skeleton-text :animated="true" style="width: 45%; height: 10px; margin-top: 8px"></ion-skeleton-text>
            <div class="menu-card-footer">
              <ion-skeleton-text :animated="true" style="width: 30%; height: 12px; margin-top: 10px"></ion-skeleton-text>
              <ion-skeleton-text :animated="true" style="width: 25%; height: 12px; margin-top: 10px"></ion-skeleton-text>
            </div>
          </div>
        </div>
      </div>

      <div class="menu-grid" v-else-if="filteredMeals.length">
        <button class="menu-card" v-for="meal in filteredMeals" :key="meal.id" @click="goToItem(meal.id)">
          <div class="menu-card-image">
            <img :src="meal.image" :alt="meal.name" loading="lazy" />
            <span v-if="meal.available <= 5" class="low-badge">{{ t('menu.onlyLeft', { count: meal.available }) }}</span>
            <span class="add-btn" :aria-label="t('dashboard.viewItemAria')">
              <ion-icon :icon="addCircleOutline" />
            </span>
          </div>
          <div class="menu-card-body">
            <h4>{{ meal.name }}</h4>
            <div class="menu-tags">
              <span class="tag" v-for="tag in meal.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="menu-card-footer">
              <span class="menu-price">{{ formatCurrency(meal.price) }}</span>
              <span class="menu-cal">
                <ion-icon :icon="flameOutline" />
                {{ meal.calories }} kcal
              </span>
            </div>
          </div>
        </button>
      </div>

      <div class="empty-state" v-else>
        <ion-icon :icon="searchOutline" />
        <h3>{{ $t('menu.noMealsFound') }}</h3>
        <p>{{ $t('menu.tryDifferentSearch') }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { IonPage, IonContent, IonIcon, IonSearchbar, IonSkeletonText } from '@ionic/vue';
import { flameOutline, addCircleOutline, searchOutline } from 'ionicons/icons';
import { CATEGORY_ALL } from '@/data/menu';
import { useMenu } from '@/composables/useMenu';
import { formatCurrency } from '@/utils/currency';
import CartButton from '@/components/CartButton.vue';

const router = useRouter();
const { t } = useI18n();
const { meals, categories, loading } = useMenu();

const selectedCategory = ref(CATEGORY_ALL);
const searchQuery = ref('');

const filteredMeals = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return meals.filter((meal) => {
    const matchesCategory = selectedCategory.value === CATEGORY_ALL || meal.category === selectedCategory.value;
    const matchesQuery = !query || meal.name.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
});

function goToItem(id: number) {
  router.push(`/item/${id}`);
}
</script>

<style scoped>
.menu-content {
  --background: var(--ion-color-step-50, #f4f5f8);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--ion-color-step-50, #f4f5f8);
}

.page-header {
  padding: calc(20px + env(safe-area-inset-top)) 16px 12px;
}

.page-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.page-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.menu-search {
  margin-top: 14px;
  --background: var(--ion-card-background, #fff);
  --border-radius: 14px;
  --box-shadow: 0 8px 24px -18px rgba(0, 0, 0, 0.4);
  padding: 0;
}

.category-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 16px 16px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 9px 14px;
  border: none;
  border-radius: 999px;
  background: var(--ion-card-background, #fff);
  color: var(--ion-text-color);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 6px 18px -14px rgba(0, 0, 0, 0.4);
}

.category-chip ion-icon {
  font-size: 16px;
}

.category-chip.active {
  background: #ff6b35;
  color: #fff;
}

.menu-grid {
  padding: 4px 16px 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.menu-card {
  border: none;
  text-align: left;
  background: var(--ion-card-background, #fff);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 30px -20px rgba(0, 0, 0, 0.35);
}

.menu-card-image {
  position: relative;
  height: 110px;
  background: var(--ion-color-step-100, #eee);
}

.menu-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-skeleton {
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
}

.low-badge {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.92);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

.add-btn {
  position: absolute;
  right: 8px;
  bottom: -14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff6b35;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 6px 14px -4px rgba(255, 107, 53, 0.7);
}

.menu-card-body {
  padding: 18px 10px 12px;
}

.menu-card-body h4 {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}

.menu-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  color: #2ec4b6;
  background: rgba(46, 196, 182, 0.12);
  padding: 2px 7px;
  border-radius: 999px;
}

.menu-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-price {
  font-size: 13px;
  font-weight: 700;
}

.menu-cal {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.menu-cal ion-icon {
  font-size: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-state h3 {
  margin: 0 0 4px;
  color: var(--ion-text-color);
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}
</style>
