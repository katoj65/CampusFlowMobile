<template>
  <template v-if="advertsEnabled">
    <button
      v-if="latestAdvert?.meal"
      class="advert-card advert-card-image"
      @click="router.push(`/item/${latestAdvert.meal.id}`)"
    >
      <img :src="latestAdvert.meal.image" :alt="latestAdvert.meal.name" class="advert-image" loading="lazy" />
      <div class="advert-scrim"></div>
      <div class="advert-content">
        <span class="advert-badge">
          <ion-icon :icon="megaphoneOutline" />
          {{ $t('dashboard.advert') }}
        </span>
        <h3>{{ latestAdvert.title }}</h3>
        <p v-if="latestAdvert.description">{{ latestAdvert.description }}</p>
        <span class="advert-cta">
          {{ $t('dashboard.viewItem') }}
          <ion-icon :icon="chevronForwardOutline" />
        </span>
      </div>
    </button>

    <div v-else-if="latestAdvert" class="advert-card advert-card-plain">
      <span class="advert-badge advert-badge-plain">
        <ion-icon :icon="megaphoneOutline" />
        {{ $t('dashboard.advert') }}
      </span>
      <h3>{{ latestAdvert.title }}</h3>
      <p v-if="latestAdvert.description">{{ latestAdvert.description }}</p>
    </div>

    <div v-else-if="loading" class="advert-card advert-card-skeleton">
      <ion-skeleton-text :animated="true" class="advert-skeleton-fill"></ion-skeleton-text>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonIcon, IonSkeletonText } from '@ionic/vue';
import { megaphoneOutline, chevronForwardOutline } from 'ionicons/icons';
import { useAdverts } from '@/composables/useAdverts';

const router = useRouter();
const { latestAdvert, loading, advertsEnabled } = useAdverts();
</script>

<style scoped>
.advert-card {
  position: relative;
  margin-top: 14px;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  border: none;
  padding: 0;
  display: block;
  text-align: left;
  font: inherit;
  color: inherit;
}

.advert-card-image {
  height: 150px;
  background: rgba(0, 0, 0, 0.2);
}

.advert-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.advert-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, rgba(20, 15, 10, 0.82) 0%, rgba(20, 15, 10, 0.35) 55%, rgba(20, 15, 10, 0.1) 100%);
}

.advert-content {
  position: absolute;
  inset: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}

.advert-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  background: #2ec4b6;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.advert-badge ion-icon {
  font-size: 12px;
}

.advert-content h3 {
  margin: 8px 0 2px;
  font-size: 16px;
  font-weight: 800;
  max-width: 78%;
}

.advert-content p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
  max-width: 78%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.advert-cta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 700;
}

.advert-cta ion-icon {
  font-size: 14px;
}

.advert-card-plain {
  padding: 16px;
  background: linear-gradient(135deg, #2ec4b6 0%, #229c92 100%);
  color: #fff;
}

.advert-badge-plain {
  background: rgba(255, 255, 255, 0.2);
}

.advert-card-plain h3 {
  margin: 8px 0 2px;
  font-size: 16px;
  font-weight: 800;
}

.advert-card-plain p {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.advert-card-skeleton {
  height: 150px;
}

.advert-skeleton-fill {
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: 0;
}
</style>
