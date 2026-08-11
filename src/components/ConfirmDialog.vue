<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="isOpen" class="confirm-overlay" role="alertdialog" aria-modal="true" @click.self="onCancel">
        <div class="confirm-card">
          <div class="confirm-icon" :class="{ destructive }">
            <ion-icon :icon="icon" />
          </div>
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-btn-cancel" @click="onCancel">{{ cancelText }}</button>
            <button class="confirm-btn confirm-btn-confirm" :class="{ destructive }" @click="onConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

withDefaults(
  defineProps<{
    isOpen: boolean;
    icon: string;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    destructive?: boolean;
  }>(),
  { destructive: false }
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(20, 15, 10, 0.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.confirm-card {
  width: 100%;
  max-width: 320px;
  padding: 26px 22px 20px;
  border-radius: 24px;
  background: var(--ion-card-background, #fff);
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.confirm-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: rgba(255, 107, 53, 0.12);
  color: #ff6b35;
}

.confirm-icon.destructive {
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
}

.confirm-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 800;
  color: var(--ion-text-color);
}

.confirm-message {
  margin: 0 0 22px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-btn {
  flex: 1;
  padding: 13px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  transition: transform 0.15s ease;
}

.confirm-btn:active {
  transform: scale(0.96);
}

.confirm-btn-cancel {
  background: var(--ion-color-step-100, #eee);
  color: var(--ion-text-color);
}

.confirm-btn-confirm {
  background: #ff6b35;
  color: #fff;
}

.confirm-btn-confirm.destructive {
  background: #ff3b30;
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-active .confirm-card,
.confirm-fade-leave-active .confirm-card {
  transition: transform 0.2s ease;
}

.confirm-fade-enter-from .confirm-card,
.confirm-fade-leave-to .confirm-card {
  transform: scale(0.92) translateY(8px);
}
</style>
